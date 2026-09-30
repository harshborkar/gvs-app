from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Patient, Session as SessionModel, Telemetry
from schemas import (
    PatientCreate,
    PatientResponse,
    SessionCreate,
    SessionResponse,
    TelemetryCreate,
    TelemetryResponse,
)


# =========================================
# DATABASE INITIALIZATION
# =========================================

Base.metadata.create_all(bind=engine)


# =========================================
# FASTAPI APP
# =========================================

app = FastAPI(
    title="Vestibular Rehab Telemetry API",
    version="1.0.0",
)


# =========================================
# CORS CONFIGURATION
# =========================================

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================
# ROOT
# =========================================

@app.get("/")
def root():
    return {
        "message": "Vestibular Rehab Telemetry API",
        "status": "running",
    }


# =========================================
# HEALTH CHECK
# =========================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }


# =========================================
# PATIENTS
# =========================================

@app.get(
    "/api/patients",
    response_model=list[PatientResponse],
)
def get_patients(
    db: Session = Depends(get_db),
):
    patients = (
        db.query(Patient)
        .order_by(Patient.id)
        .all()
    )

    return patients


@app.post(
    "/api/patients",
    response_model=PatientResponse,
    status_code=201,
)
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
):
    existing_patient = (
        db.query(Patient)
        .filter(
            Patient.patient_code == patient.patient_code
        )
        .first()
    )

    if existing_patient:
        raise HTTPException(
            status_code=400,
            detail="Patient code already exists",
        )

    new_patient = Patient(
        patient_code=patient.patient_code,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        status=patient.status,
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient


@app.get(
    "/api/patients/{patient_id}",
    response_model=PatientResponse,
)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    return patient


@app.delete("/api/patients/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    db.delete(patient)
    db.commit()

    return {
        "message": "Patient deleted successfully",
    }


# =========================================
# CREATE SESSION
# =========================================

@app.post(
    "/api/sessions",
    response_model=SessionResponse,
    status_code=201,
)
def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db),
):
    # Check that patient exists
    patient = (
        db.query(Patient)
        .filter(
            Patient.id == session_data.patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    # Check for duplicate session code
    existing_session = (
        db.query(SessionModel)
        .filter(
            SessionModel.session_code
            == session_data.session_code
        )
        .first()
    )

    if existing_session:
        raise HTTPException(
            status_code=400,
            detail="Session code already exists",
        )

    new_session = SessionModel(
        session_code=session_data.session_code,
        patient_id=session_data.patient_id,
        date=session_data.date,
        duration=session_data.duration,
        total_inputs=session_data.total_inputs,
        peak_inputs_per_minute=session_data.peak_inputs_per_minute,
        dominant_direction=session_data.dominant_direction,
        status=session_data.status,
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


# =========================================
# GET PATIENT SESSIONS
# =========================================

@app.get(
    "/api/patients/{patient_id}/sessions",
    response_model=list[SessionResponse],
)
def get_patient_sessions(
    patient_id: int,
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    sessions = (
        db.query(SessionModel)
        .filter(
            SessionModel.patient_id == patient_id
        )
        .order_by(SessionModel.id.desc())
        .all()
    )

    return sessions


# =========================================
# GET SINGLE SESSION
# =========================================

@app.get(
    "/api/sessions/{session_id}",
    response_model=SessionResponse,
)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
):
    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.id == session_id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return session


# =========================================
# ADD TELEMETRY READING
# =========================================

@app.post(
    "/api/sessions/{session_id}/telemetry",
    response_model=TelemetryResponse,
    status_code=201,
)
def add_telemetry(
    session_id: int,
    telemetry_data: TelemetryCreate,
    db: Session = Depends(get_db),
):
    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.id == session_id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    new_telemetry = Telemetry(
        session_id=session_id,
        timestamp=telemetry_data.timestamp,
        inputs=telemetry_data.inputs,
        direction=telemetry_data.direction,
    )

    db.add(new_telemetry)
    db.commit()
    db.refresh(new_telemetry)

    return new_telemetry


# =========================================
# GET SESSION TELEMETRY
# =========================================

@app.get(
    "/api/sessions/{session_id}/telemetry",
    response_model=list[TelemetryResponse],
)
def get_session_telemetry(
    session_id: int,
    db: Session = Depends(get_db),
):
    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.id == session_id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    telemetry = (
        db.query(Telemetry)
        .filter(
            Telemetry.session_id == session_id
        )
        .order_by(Telemetry.id)
        .all()
    )

    return telemetry