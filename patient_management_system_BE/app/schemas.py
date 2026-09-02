from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from .models import AppointmentStatus, Role


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Role = Role.patient

    @field_validator("role")
    @classmethod
    def patients_self_register_only(cls, value: Role) -> Role:
        if value != Role.patient:
            raise ValueError("Only patients can self-register")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    specialty: Optional[str]
    model_config = {"from_attributes": True}


class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class DoctorOut(BaseModel):
    id: int
    name: str
    specialty: Optional[str]
    model_config = {"from_attributes": True}


class SlotOut(BaseModel):
    starts_at: datetime


class AppointmentCreate(BaseModel):
    doctor_id: int
    slot_time: datetime


class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    slot_time: datetime
    status: AppointmentStatus
    patient_name: str
    doctor_name: str
    specialty: Optional[str]

