from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
from typing import Optional
import io

from rag import retrieve_context
from triage import run_triage
from handover import generate_handover_note
from download import generate_pdf, generate_docx

app = FastAPI(title="Mamacord AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TriageInput(BaseModel):
    # Patient details
    patient_id: Optional[str] = None
    age: int
    gestational_age: int
    gravida: Optional[int] = None
    para: Optional[int] = None

    # Vitals
    systolic_bp: float
    diastolic_bp: float
    temperature: float
    heart_rate: float

    # Labs
    pcv: float                  # Packed Cell Volume in % (replaces Hb)
    urine_protein: str
    urine_glucose: str

    # FBC (optional — for sepsis screening)
    wbc: Optional[float] = None         # x10³/μL
    neutrophils: Optional[float] = None  # %
    platelets: Optional[int] = None      # x10³/μL

    # USS (optional)
    placental_location: Optional[str] = None
    fetal_presentation: Optional[str] = None
    liquor_volume: Optional[str] = None
    fhr: Optional[float] = None
    uss_image_base64: Optional[str] = None  # base64-encoded USS image

    @field_validator("systolic_bp", "diastolic_bp", "temperature", "heart_rate", "pcv", mode="before")
    @classmethod
    def cast_to_float(cls, v):
        return float(v)

    @field_validator("age", "gestational_age", mode="before")
    @classmethod
    def cast_to_int(cls, v):
        return int(v)


class DownloadPayload(BaseModel):
    format: str  # "pdf" or "docx"
    result: dict
    input: dict


@app.get("/health")
def health_check():
    return {"status": "ok", "app": "Mamacord AI"}


@app.post("/api/triage")
async def triage(data: TriageInput):
    try:
        context = retrieve_context(data)
        result = await run_triage(data, context)

        handover_note = None
        if result.get("risk_level") == "RED":
            handover_note = generate_handover_note(data, result)

        return {
            "risk_level": result.get("risk_level"),
            "primary_concern": result.get("primary_concern"),
            "flags": result.get("flags", []),
            "rationale": result.get("rationale"),
            "citations": result.get("citations", []),
            "recommended_action": result.get("recommended_action"),
            "handover_note": handover_note,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/download")
async def download_report(payload: DownloadPayload):
    try:
        fmt = payload.format.lower()
        if fmt == "pdf":
            content = generate_pdf(payload.input, payload.result)
            return StreamingResponse(
                io.BytesIO(content),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=mamacord-triage-report.pdf"},
            )
        elif fmt == "docx":
            content = generate_docx(payload.input, payload.result)
            return StreamingResponse(
                io.BytesIO(content),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": "attachment; filename=mamacord-triage-report.docx"},
            )
        else:
            raise HTTPException(status_code=400, detail="Format must be 'pdf' or 'docx'")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
