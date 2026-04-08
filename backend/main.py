from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional
import json

from rag import retrieve_context
from triage import run_triage
from handover import generate_handover_note

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
    hb: float
    urine_protein: str
    urine_glucose: str

    # USS (optional)
    placental_location: Optional[str] = None
    fetal_presentation: Optional[str] = None
    liquor_volume: Optional[str] = None
    fhr: Optional[float] = None

    @field_validator("systolic_bp", "diastolic_bp", "temperature", "heart_rate", "hb", mode="before")
    @classmethod
    def cast_to_float(cls, v):
        return float(v)

    @field_validator("age", "gestational_age", mode="before")
    @classmethod
    def cast_to_int(cls, v):
        return int(v)


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
