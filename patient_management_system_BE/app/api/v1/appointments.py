from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from fastapi import APIRouter, Depends, Response, status

from app.api.v1.dependencies import require_patient
from app.db.database import get_db
from app.db.models import Appointment, AppointmentStatus, User
from app.schemas import AppointmentCreate, AppointmentRead, AppointmentUpdate
from app.services import appointment_to_read, book_appointment, cancel_appointment, delete_appointment, get_patient_appointment_or_404, update_appointment


router = APIRouter()


@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    appointment = book_appointment(db, current_user.patient, payload.doctor_id, payload.slot_time)
    return appointment_to_read(appointment)


@router.get("/my", response_model=list[AppointmentRead])
def my_appointments(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    query = (
        select(Appointment)
        .where(Appointment.patient_id == current_user.patient.id, Appointment.status == AppointmentStatus.BOOKED)
        .options(joinedload(Appointment.doctor), joinedload(Appointment.patient))
        .order_by(Appointment.slot_time)
    )
    return [appointment_to_read(item) for item in db.scalars(query)]


@router.get("/history", response_model=list[AppointmentRead])
def appointment_history(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    query = (
        select(Appointment)
        .where(Appointment.patient_id == current_user.patient.id)
        .options(joinedload(Appointment.doctor), joinedload(Appointment.patient))
        .order_by(Appointment.slot_time.desc())
    )
    return [appointment_to_read(item) for item in db.scalars(query)]


@router.get("/{appointment_id}", response_model=AppointmentRead)
def detail(appointment_id: int, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    appointment = get_patient_appointment_or_404(db, current_user.patient, appointment_id)
    return appointment_to_read(appointment)


@router.patch("/{appointment_id}/cancel", response_model=AppointmentRead)
def cancel(appointment_id: int, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    appointment = cancel_appointment(db, appointment_id, current_user.patient)
    return appointment_to_read(appointment)


@router.put("/{appointment_id}", response_model=AppointmentRead)
def update(
    appointment_id: int,
    payload: AppointmentUpdate,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    appointment = update_appointment(db, current_user.patient, appointment_id, payload)
    return appointment_to_read(appointment)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(appointment_id: int, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    delete_appointment(db, current_user.patient, appointment_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
