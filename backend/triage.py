import json
import os
import base64
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

aclient = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are Mamacord AI, a clinical decision support tool for maternal triage in low-resource Nigerian settings. You help TBAs, CHWs, and PHC nurses identify high-risk pregnancies caused by the Big Three obstetric killers: hypertensive disorders (pre-eclampsia/eclampsia), obstetric haemorrhage, and sepsis.

You MUST:
- Base ALL responses strictly on the provided WHO guidelines in context
- Classify the patient as GREEN, YELLOW, or RED
- Cite the specific guideline section for every finding you flag
- Output MUST be strict JSON (no markdown, no code fences)
- Refuse to answer any question outside maternal triage
- When PCV is provided, convert to estimated Hb using: Hb (g/dL) = PCV (%) / 3
- When FBC (WBC, Neutrophils, Platelets) is provided, incorporate into sepsis and HELLP risk assessment

You MUST NOT:
- Hallucinate clinical facts not in the provided context
- Give advice on conditions outside the Big Three
- Replace the clinical judgement of a qualified doctor

Output JSON format (no extra text, no markdown):
{
  "risk_level": "RED | YELLOW | GREEN",
  "primary_concern": "string — one-line clinical summary",
  "flags": ["list of triggered clinical findings"],
  "rationale": "string — full clinical reasoning paragraph",
  "citations": ["Guideline name §section"],
  "recommended_action": "string",
  "generate_handover": true | false
}"""


def pcv_to_hb(pcv: float) -> float:
    """Convert PCV % to estimated Hb g/dL using standard formula."""
    return round(pcv / 3, 1)


def compute_safety_flags(data) -> tuple:
    """Hard-coded threshold checks that override LLM output."""
    red_flags = []
    yellow_flags = []

    # BP thresholds
    if data.systolic_bp >= 160:
        red_flags.append(f"Systolic BP critically elevated: {data.systolic_bp} mmHg (>=160 = RED)")
    elif data.systolic_bp >= 140:
        yellow_flags.append(f"Systolic BP elevated: {data.systolic_bp} mmHg (140-159 = YELLOW)")

    if data.diastolic_bp >= 110:
        red_flags.append(f"Diastolic BP critically elevated: {data.diastolic_bp} mmHg (>=110 = RED)")
    elif data.diastolic_bp >= 90:
        yellow_flags.append(f"Diastolic BP elevated: {data.diastolic_bp} mmHg (90-109 = YELLOW)")

    # Temperature
    if data.temperature > 38.0:
        red_flags.append(f"Fever: {data.temperature}C (>38.0C = RED, possible sepsis)")
    elif data.temperature >= 37.5:
        yellow_flags.append(f"Low-grade fever: {data.temperature}C (37.5-38.0C = YELLOW)")

    # Heart rate
    if data.heart_rate > 100:
        red_flags.append(f"Tachycardia: HR {data.heart_rate} bpm (>100 = RED)")
    elif data.heart_rate >= 90:
        yellow_flags.append(f"Elevated HR: {data.heart_rate} bpm (90-100 = YELLOW)")

    # PCV thresholds (PCV 21% = Hb 7, PCV 27% = Hb 9)
    hb_equiv = pcv_to_hb(data.pcv)
    if data.pcv < 21:
        red_flags.append(f"Severe anaemia: PCV {data.pcv}% (estimated Hb {hb_equiv} g/dL — <21% = RED)")
    elif data.pcv <= 27:
        yellow_flags.append(f"Moderate anaemia: PCV {data.pcv}% (estimated Hb {hb_equiv} g/dL — 21-27% = YELLOW)")

    # Urine protein
    protein_map = {"negative": 0, "trace": 1, "1+": 2, "2+": 3, "3+": 4}
    protein_level = protein_map.get(data.urine_protein.lower(), 0)
    if protein_level >= 2:
        red_flags.append(f"Significant proteinuria: {data.urine_protein} (1+ or greater = RED)")
    elif protein_level == 1:
        yellow_flags.append(f"Trace proteinuria: {data.urine_protein} (YELLOW - monitor)")

    # FBC flags
    if data.platelets is not None and data.platelets < 100:
        red_flags.append(f"Thrombocytopenia: Platelets {data.platelets} x10^3/uL (<100 = RED, HELLP risk)")
    if data.wbc is not None and data.wbc > 15 and data.temperature > 38.0:
        red_flags.append(f"Leukocytosis with fever: WBC {data.wbc} x10^3/uL with temp {data.temperature}C (sepsis risk = RED)")

    return red_flags, yellow_flags


def determine_forced_level(red_flags, yellow_flags) -> str | None:
    if red_flags:
        return "RED"
    if yellow_flags:
        return "YELLOW"
    return None


async def analyze_uss_image(image_base64: str) -> str:
    """Call GPT-4o vision to analyze obstetric USS image."""
    try:
        response = await aclient.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You are analyzing an obstetric ultrasound image for maternal triage. "
                                "Describe ONLY what is clinically visible: placental location, fetal presentation, "
                                "liquor volume, any obvious pathology (e.g. placenta praevia, oligohydramnios, malpresentation). "
                                "Be brief and factual. Do not speculate beyond what is visible."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                        },
                    ],
                }
            ],
            max_tokens=300,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"USS image analysis unavailable: {str(e)}"


async def extract_uss_fields(image_base64: str) -> dict:
    """Call GPT-4o vision to extract structured USS findings from an image."""
    try:
        response = await aclient.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You are an expert obstetrician analyzing an obstetric ultrasound image. "
                                "Extract the following findings from this image. "
                                "Return ONLY a JSON object with these exact keys:\n"
                                "- \"placental_location\": one of \"Normal\", \"Low-lying\", \"Praevia\" (or null if not visible)\n"
                                "- \"fetal_presentation\": one of \"Cephalic\", \"Breech\", \"Transverse\" (or null if not visible)\n"
                                "- \"liquor_volume\": one of \"Normal\", \"Reduced\", \"Oligohydramnios\", \"Increased\" (or null if not assessable)\n"
                                "- \"fhr\": estimated fetal heart rate as a number in bpm (or null if not visible)\n"
                                "- \"summary\": a one-sentence clinical summary of what you see\n\n"
                                "If the image is not an obstetric ultrasound, set all fields to null and "
                                "summary to \"Image does not appear to be an obstetric ultrasound.\"\n"
                                "Output strict JSON only, no markdown."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                        },
                    ],
                }
            ],
            max_tokens=300,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {
            "placental_location": None,
            "fetal_presentation": None,
            "liquor_volume": None,
            "fhr": None,
            "summary": f"USS analysis failed: {str(e)}",
        }


async def run_triage(data, context: str) -> dict:
    red_flags, yellow_flags = compute_safety_flags(data)
    forced_level = determine_forced_level(red_flags, yellow_flags)
    hb_equiv = pcv_to_hb(data.pcv)

    # USS image analysis
    uss_vision_note = ""
    if data.uss_image_base64:
        vision_result = await analyze_uss_image(data.uss_image_base64)
        uss_vision_note = f"\nUSS IMAGE ANALYSIS (AI Vision):\n{vision_result}\n"

    safety_note = ""
    if red_flags:
        safety_note = "\n\nSAFETY OVERRIDE - Python thresholds detected RED flags:\n" + "\n".join(f"- {f}" for f in red_flags)
        safety_note += "\nYou MUST classify this patient as RED and prioritise these findings."
    elif yellow_flags:
        safety_note = "\n\nSAFETY NOTE - Python thresholds detected YELLOW flags:\n" + "\n".join(f"- {f}" for f in yellow_flags)
        safety_note += "\nYou MUST classify this patient as at least YELLOW."

    # FBC section
    fbc_section = ""
    if any(v is not None for v in [data.wbc, data.neutrophils, data.platelets]):
        fbc_lines = []
        if data.wbc is not None:
            fbc_lines.append(f"  WBC: {data.wbc} x10^3/uL")
        if data.neutrophils is not None:
            fbc_lines.append(f"  Neutrophils: {data.neutrophils}%")
        if data.platelets is not None:
            fbc_lines.append(f"  Platelets: {data.platelets} x10^3/uL")
        fbc_section = "\nFULL BLOOD COUNT:\n" + "\n".join(fbc_lines)

    user_message = f"""WHO GUIDELINES CONTEXT:
{context}
{uss_vision_note}
PATIENT CLINICAL DATA:
- Patient ID: {data.patient_id or 'Not provided'}
- Age: {data.age} years
- Gestational Age: {data.gestational_age} weeks
- Gravida: {data.gravida or 'N/A'} | Para: {data.para or 'N/A'}
- Systolic BP: {data.systolic_bp} mmHg
- Diastolic BP: {data.diastolic_bp} mmHg
- Temperature: {data.temperature}C
- Maternal HR: {data.heart_rate} bpm
- PCV: {data.pcv}% (estimated Hb: {hb_equiv} g/dL)
- Urine Protein: {data.urine_protein}
- Urine Glucose: {data.urine_glucose}{fbc_section}
- Placental Location: {data.placental_location or 'Not assessed'}
- Fetal Presentation: {data.fetal_presentation or 'Not assessed'}
- Liquor Volume: {data.liquor_volume or 'Not assessed'}
- FHR: {data.fhr or 'Not assessed'} bpm
{safety_note}

Perform maternal triage. Output strict JSON only."""

    response = await aclient.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content
    result = json.loads(raw)

    # Safety override: enforce threshold-driven level
    if forced_level == "RED" and result.get("risk_level") != "RED":
        result["risk_level"] = "RED"
        result["generate_handover"] = True
        existing_flags = result.get("flags", [])
        result["flags"] = list(set(existing_flags + red_flags))
    elif forced_level == "YELLOW" and result.get("risk_level") == "GREEN":
        result["risk_level"] = "YELLOW"
        result["generate_handover"] = False
        existing_flags = result.get("flags", [])
        result["flags"] = list(set(existing_flags + yellow_flags))

    return result
