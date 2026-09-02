from datetime import datetime, time

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.db.models import AppointmentStatus, UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserRead"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterPatient(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str
    last_name: str
    phone: str | None = None


class AvailabilityCreate(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    start_time: time
    end_time: time


class RegisterDoctor(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str
    last_name: str
    specialty: str
    availability: list[AvailabilityCreate] = []


class PatientUpdate(BaseModel):
    first_name: str
    last_name: str
    phone: str | None = None


class DoctorUpdate(BaseModel):
    first_name: str
    last_name: str
    specialty: str
    availability: list[AvailabilityCreate] = []


class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    profile_id: int
    name: str


class AvailabilityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    day_of_week: int
    start_time: time
    end_time: time


class DoctorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    specialty: str
    availability: list[AvailabilityRead] = []


class SlotRead(BaseModel):
    slot_time: datetime
    available: bool


class AppointmentCreate(BaseModel):
    doctor_id: int
    slot_time: datetime


class AppointmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    doctor_id: int
    patient_id: int
    slot_time: datetime
    status: AppointmentStatus
    doctor_name: str
    patient_name: str


class DoctorPatientRead(BaseModel):
    patient_id: int
    patient_name: str
    phone: str | None = None
    email: EmailStr
    total_visits: int
    next_visit: datetime | None = None
    last_visit: datetime | None = None


class DoctorRecordRead(BaseModel):
    appointment_id: int
    patient_id: int
    patient_name: str
    slot_time: datetime
    status: AppointmentStatus
    summary: str


class DoctorStatsRead(BaseModel):
    today_appointments: int
    week_appointments: int
    total_patients: int
    completed_consultations: int


Token.model_rebuild()
