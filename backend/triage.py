import json
import os
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


def compute_safety_flags(data) -> list[str]:
    """Hard-coded threshold checks that override LLM output."""
    red_flags = []
    yellow_flags = []

    # BP thresholds
    if data.systolic_bp >= 160:
        red_flags.append(f"Systolic BP critically elevated: {data.systolic_bp} mmHg (≥160 = RED)")
    elif data.systolic_bp >= 140:
        yellow_flags.append(f"Systolic BP elevated: {data.systolic_bp} mmHg (140–159 = YELLOW)")

    if data.diastolic_bp >= 110:
        red_flags.append(f"Diastolic BP critically elevated: {data.diastolic_bp} mmHg (≥110 = RED)")
    elif data.diastolic_bp >= 90:
        yellow_flags.append(f"Diastolic BP elevated: {data.diastolic_bp} mmHg (90–109 = YELLOW)")

    # Temperature
    if data.temperature > 38.0:
        red_flags.append(f"Fever (temperature {data.temperature}°C — >38.0°C = RED, possible sepsis)")
    elif data.temperature >= 37.5:
        yellow_flags.append(f"Low-grade fever: {data.temperature}°C (37.5–38.0°C = YELLOW)")

    # Heart rate
    if data.heart_rate > 100:
        red_flags.append(f"Tachycardia: HR {data.heart_rate} bpm (>100 = RED)")
    elif data.heart_rate >= 90:
        yellow_flags.append(f"Elevated HR: {data.heart_rate} bpm (90–100 = YELLOW)")

    # Haemoglobin
    if data.hb < 7:
        red_flags.append(f"Severe anaemia: Hb {data.hb} g/dL (<7 = RED)")
    elif data.hb <= 9:
        yellow_flags.append(f"Moderate anaemia: Hb {data.hb} g/dL (7–9 = YELLOW)")

    # Urine protein
    protein_map = {"negative": 0, "trace": 1, "1+": 2, "2+": 3, "3+": 4}
    protein_level = protein_map.get(data.urine_protein.lower(), 0)
    if protein_level >= 2:
        red_flags.append(f"Significant proteinuria: {data.urine_protein} (1+ or greater = RED)")
    elif protein_level == 1:
        yellow_flags.append(f"Trace proteinuria: {data.urine_protein} (YELLOW — monitor)")

    return red_flags, yellow_flags


def determine_forced_level(red_flags, yellow_flags) -> str | None:
    if red_flags:
        return "RED"
    if yellow_flags:
        return "YELLOW"
    return None


async def run_triage(data, context: str) -> dict:
    red_flags, yellow_flags = compute_safety_flags(data)
    forced_level = determine_forced_level(red_flags, yellow_flags)

    safety_note = ""
    if red_flags:
        safety_note = f"\n\nSAFETY OVERRIDE — Python thresholds detected RED flags:\n" + "\n".join(f"- {f}" for f in red_flags)
        safety_note += "\nYou MUST classify this patient as RED and prioritise these findings."
    elif yellow_flags:
        safety_note = f"\n\nSAFETY NOTE — Python thresholds detected YELLOW flags:\n" + "\n".join(f"- {f}" for f in yellow_flags)
        safety_note += "\nYou MUST classify this patient as at least YELLOW."

    user_message = f"""WHO GUIDELINES CONTEXT:
{context}

PATIENT CLINICAL DATA:
- Age: {data.age} years
- Gestational Age: {data.gestational_age} weeks
- Gravida: {data.gravida or 'N/A'} | Para: {data.para or 'N/A'}
- Systolic BP: {data.systolic_bp} mmHg
- Diastolic BP: {data.diastolic_bp} mmHg
- Temperature: {data.temperature}°C
- Maternal HR: {data.heart_rate} bpm
- Haemoglobin: {data.hb} g/dL
- Urine Protein: {data.urine_protein}
- Urine Glucose: {data.urine_glucose}
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
