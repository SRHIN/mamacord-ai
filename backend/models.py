import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    facility_name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="chw")  # chw, tba, nurse, doctor
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TriageRecord(Base):
    __tablename__ = "triage_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # Patient snapshot (de-identified)
    patient_id = Column(String(50), nullable=True)
    age = Column(Integer, nullable=False)
    gestational_age = Column(Integer, nullable=False)
    systolic_bp = Column(Float, nullable=False)
    diastolic_bp = Column(Float, nullable=False)

    # Result
    risk_level = Column(String(10), nullable=False)
    primary_concern = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
