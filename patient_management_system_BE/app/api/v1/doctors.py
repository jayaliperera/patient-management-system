from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.v1.dependencies import require_doctor
from app.db.database import get_db
from app.db.models import Appointment, AppointmentStatus, Doctor, User
from app.schemas import AppointmentRead, DoctorPatientRead, DoctorRead, DoctorRecordRead, DoctorStatsRead, DoctorUpdate, SlotRead
from app.services import appointment_to_read, complete_doctor_appointment, doctor_patients, doctor_records, doctor_stats, generate_slots_for_date, get_doctor_or_404, list_doctors, update_doctor_profile


router = APIRouter()


@router.get("/me/profile", response_model=DoctorRead)
def my_profile(current_user: User = Depends(require_doctor)):
    return current_user.doctor


@router.put("/me/profile", response_model=DoctorRead)
def edit_my_profile(
    payload: DoctorUpdate,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    return update_doctor_profile(db, current_user.doctor, payload)


@router.get("/me/schedule", response_model=list[AppointmentRead])
def my_schedule(
    view: str = Query(default="day", pattern="^(day|week|month)$"),
    on: date | None = None,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    selected = on or date.today()
    if view == "day":
        start_date = selected
        days = 1
    elif view == "week":
        start_date = selected - timedelta(days=selected.weekday())
        days = 7
    else:
        start_date = selected.replace(day=1)
        next_month = start_date.replace(year=start_date.year + 1, month=1) if start_date.month == 12 else start_date.replace(month=start_date.month + 1)
        days = (next_month - start_date).days
    start = datetime.combine(start_date, time.min).replace(tzinfo=timezone.utc)
    end = start + timedelta(days=days)
    query = (
        select(Appointment)
        .where(
            Appointment.doctor_id == current_user.doctor.id,
            Appointment.slot_time >= start,
            Appointment.slot_time < end,
        )
        .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
        .order_by(Appointment.slot_time)
    )
    return [appointment_to_read(item) for item in db.scalars(query)]


@router.get("/me/appointments", response_model=list[AppointmentRead])
def my_appointments(
    status_filter: AppointmentStatus | None = Query(default=None, alias="status"),
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    query = (
        select(Appointment)
        .where(Appointment.doctor_id == current_user.doctor.id)
        .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
        .order_by(Appointment.slot_time.desc())
    )
    if status_filter:
        query = query.where(Appointment.status == status_filter)
    return [appointment_to_read(item) for item in db.scalars(query)]


@router.patch("/me/appointments/{appointment_id}/complete", response_model=AppointmentRead)
def complete_appointment(
    appointment_id: int,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    appointment = complete_doctor_appointment(db, current_user.doctor, appointment_id)
    return appointment_to_read(appointment)


@router.get("/me/patients", response_model=list[DoctorPatientRead])
def my_patients(current_user: User = Depends(require_doctor), db: Session = Depends(get_db)):
    return doctor_patients(db, current_user.doctor)


@router.get("/me/records", response_model=list[DoctorRecordRead])
def my_records(current_user: User = Depends(require_doctor), db: Session = Depends(get_db)):
    return doctor_records(db, current_user.doctor)


@router.get("/me/stats", response_model=DoctorStatsRead)
def my_stats(current_user: User = Depends(require_doctor), db: Session = Depends(get_db)):
    return doctor_stats(db, current_user.doctor)


@router.get("", response_model=list[DoctorRead])
def doctors(specialty: str | None = None, db: Session = Depends(get_db)):
    return list_doctors(db, specialty)


@router.get("/{doctor_id}", response_model=DoctorRead)
def doctor_detail(doctor_id: int, db: Session = Depends(get_db)):
    return get_doctor_or_404(db, doctor_id)


@router.get("/{doctor_id}/slots", response_model=list[SlotRead])
def doctor_slots(doctor_id: int, slot_date: date = Query(alias="date"), db: Session = Depends(get_db)):
    doctor = get_doctor_or_404(db, doctor_id)
    return generate_slots_for_date(db, doctor, slot_date)
