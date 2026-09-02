from __future__ import annotations
from datetime import date, datetime, time, timedelta, timezone
from typing import Optional
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from .auth import create_token, current_user, hash_password, require_role, verify_password
from .config import settings
from .db import get_db
from .models import Appointment, AppointmentStatus, Availability, Role, User
from .schemas import AppointmentCreate, AppointmentOut, AuthOut, DoctorOut, LoginRequest, RegisterRequest, SlotOut, UserOut

app = FastAPI(title="ClinicFlow API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in settings.cors_origins.split(",")], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health() -> dict[str, str]: return {"status": "ok"}


@app.post("/api/auth/register", response_model=AuthOut, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> AuthOut:
    email = body.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="Email is already registered")
    user = User(name=body.name.strip(), email=email, password_hash=hash_password(body.password), role=Role.patient)
    db.add(user)
    try: db.commit()
    except IntegrityError:
        db.rollback(); raise HTTPException(status_code=409, detail="Email is already registered")
    db.refresh(user)
    return AuthOut(access_token=create_token(user), user=UserOut.model_validate(user))


@app.post("/api/auth/login", response_model=AuthOut)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> AuthOut:
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return AuthOut(access_token=create_token(user), user=UserOut.model_validate(user))


@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(current_user)) -> User: return user


@app.get("/api/doctors", response_model=list[DoctorOut])
def doctors(specialty: Optional[str] = Query(default=None, max_length=120), _: User = Depends(require_role(Role.patient)), db: Session = Depends(get_db)) -> list[User]:
    query = select(User).where(User.role == Role.doctor, User.active.is_(True))
    if specialty: query = query.where(User.specialty.ilike(f"%{specialty}%"))
    return list(db.scalars(query.order_by(User.name)))


def day_bounds(value: date) -> tuple[datetime, datetime]:
    start = datetime.combine(value, time.min, tzinfo=timezone.utc)
    return start, start + timedelta(days=1)


@app.get("/api/doctors/{doctor_id}/slots", response_model=list[SlotOut])
def open_slots(doctor_id: int, on: date = Query(alias="date"), _: User = Depends(require_role(Role.patient)), db: Session = Depends(get_db)) -> list[SlotOut]:
    doctor = db.get(User, doctor_id)
    if not doctor or doctor.role != Role.doctor or not doctor.active: raise HTTPException(status_code=404, detail="Doctor not found")
    windows = db.scalars(select(Availability).where(Availability.doctor_id == doctor_id, Availability.weekday == on.weekday())).all()
    start, end = day_bounds(on)
    booked = set(db.scalars(select(Appointment.slot_time).where(Appointment.doctor_id == doctor_id, Appointment.status == AppointmentStatus.booked, Appointment.slot_time >= start, Appointment.slot_time < end)))
    now, result = datetime.now(timezone.utc), []
    for window in windows:
        slot, finish = datetime.combine(on, window.start_time, tzinfo=timezone.utc), datetime.combine(on, window.end_time, tzinfo=timezone.utc)
        while slot + timedelta(minutes=window.slot_minutes) <= finish:
            if slot > now and slot not in booked: result.append(SlotOut(starts_at=slot))
            slot += timedelta(minutes=window.slot_minutes)
    return sorted(result, key=lambda item: item.starts_at)


def appointment_out(item: Appointment) -> AppointmentOut:
    return AppointmentOut(id=item.id, patient_id=item.patient_id, doctor_id=item.doctor_id, slot_time=item.slot_time, status=item.status, patient_name=item.patient.name, doctor_name=item.doctor.name, specialty=item.doctor.specialty)


@app.post("/api/appointments", response_model=AppointmentOut, status_code=201)
def book(body: AppointmentCreate, patient: User = Depends(require_role(Role.patient)), db: Session = Depends(get_db)) -> AppointmentOut:
    if body.slot_time.tzinfo is None: raise HTTPException(status_code=422, detail="slot_time must include a timezone")
    slot = body.slot_time.astimezone(timezone.utc)
    if slot <= datetime.now(timezone.utc): raise HTTPException(status_code=422, detail="Appointments must be in the future")
    doctor = db.get(User, body.doctor_id)
    if not doctor or doctor.role != Role.doctor or not doctor.active: raise HTTPException(status_code=404, detail="Doctor not found")
    windows = db.scalars(select(Availability).where(Availability.doctor_id == doctor.id, Availability.weekday == slot.weekday())).all()
    valid = any(window.start_time <= slot.time().replace(tzinfo=None) and slot + timedelta(minutes=window.slot_minutes) <= datetime.combine(slot.date(), window.end_time, tzinfo=timezone.utc) and ((slot.hour*60+slot.minute)-(window.start_time.hour*60+window.start_time.minute)) % window.slot_minutes == 0 for window in windows)
    if not valid: raise HTTPException(status_code=422, detail="Selected time is not an available slot")
    item = Appointment(patient_id=patient.id, doctor_id=doctor.id, slot_time=slot)
    db.add(item)
    try: db.commit()
    except IntegrityError:
        db.rollback(); raise HTTPException(status_code=409, detail="This slot was just booked")
    db.refresh(item); return appointment_out(item)


@app.get("/api/appointments/mine", response_model=list[AppointmentOut])
def my_appointments(patient: User = Depends(require_role(Role.patient)), db: Session = Depends(get_db)) -> list[AppointmentOut]:
    items = db.scalars(select(Appointment).where(Appointment.patient_id == patient.id, Appointment.slot_time >= datetime.now(timezone.utc)).order_by(Appointment.slot_time)).all()
    return [appointment_out(item) for item in items]


@app.delete("/api/appointments/{appointment_id}", response_model=AppointmentOut)
def cancel(appointment_id: int, patient: User = Depends(require_role(Role.patient)), db: Session = Depends(get_db)) -> AppointmentOut:
    item = db.get(Appointment, appointment_id)
    if not item: raise HTTPException(status_code=404, detail="Appointment not found")
    if item.patient_id != patient.id: raise HTTPException(status_code=403, detail="You can only cancel your own appointments")
    if item.status != AppointmentStatus.booked: raise HTTPException(status_code=409, detail="Appointment is not booked")
    if item.slot_time <= datetime.now(timezone.utc): raise HTTPException(status_code=409, detail="Past appointments cannot be cancelled")
    item.status = AppointmentStatus.cancelled; db.commit(); db.refresh(item)
    return appointment_out(item)


@app.get("/api/doctor/schedule", response_model=list[AppointmentOut])
def schedule(on: Optional[date] = Query(default=None, alias="date"), doctor: User = Depends(require_role(Role.doctor)), db: Session = Depends(get_db)) -> list[AppointmentOut]:
    query = select(Appointment).where(Appointment.doctor_id == doctor.id, Appointment.status == AppointmentStatus.booked)
    if on:
        start, end = day_bounds(on); query = query.where(Appointment.slot_time >= start, Appointment.slot_time < end)
    else: query = query.where(Appointment.slot_time >= datetime.now(timezone.utc))
    return [appointment_out(item) for item in db.scalars(query.order_by(Appointment.slot_time))]

