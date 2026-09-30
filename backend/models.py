from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    patient_code = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    status = Column(String, default="Active")

    sessions = relationship(
        "Session",
        back_populates="patient",
        cascade="all, delete-orphan",
    )


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)

    session_code = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
    )

    date = Column(String, nullable=False)
    duration = Column(String, nullable=False)

    total_inputs = Column(Integer, default=0)
    peak_inputs_per_minute = Column(Integer, default=0)

    dominant_direction = Column(String)
    status = Column(String, default="Completed")

    patient = relationship(
        "Patient",
        back_populates="sessions",
    )

    telemetry = relationship(
        "Telemetry",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("sessions.id"),
        nullable=False,
    )

    timestamp = Column(String, nullable=False)

    inputs = Column(Integer, nullable=False, default=0)

    direction = Column(String, nullable=False)

    session = relationship(
        "Session",
        back_populates="telemetry",
    )