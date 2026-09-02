from datetime import date, datetime, time, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import Appointment, AppointmentStatus, Doctor, DoctorAvailability, Patient, User, UserRole
from app.schemas import AppointmentRead, DoctorPatientRead, DoctorRecordRead, DoctorStatsRead, DoctorUpdate, PatientUpdate, RegisterDoctor, RegisterPatient, UserRead


SLOT_MINUTES = 30


def user_to_read(user: User) -> UserRead:
    if user.role == UserRole.PATIENT and user.patient:
        return UserRead(
            id=user.id,
            email=user.email,
            role=user.role,
            profile_id=user.patient.id,
            name=f"{user.patient.first_name} {user.patient.last_name}",
        )
    if user.role == UserRole.DOCTOR and user.doctor:
        return UserRead(
            id=user.id,
            email=user.email,
            role=user.role,
            profile_id=user.doctor.id,
            name=f"Dr. {user.doctor.first_name} {user.doctor.last_name}",
        )
    raise HTTPException(status_code=500, detail="User profile is incomplete")


def register_patient(db: Session, payload: RegisterPatient) -> User:
    user = User(email=payload.email.lower(), password_hash=hash_password(payload.password), role=UserRole.PATIENT)
    user.patient = Patient(first_name=payload.first_name, last_name=payload.last_name, phone=payload.phone)
    db.add(user)
    commit_or_email_conflict(db)
    db.refresh(user)
    return user


def register_doctor(db: Session, payload: RegisterDoctor) -> User:
    doctor = Doctor(first_name=payload.first_name, last_name=payload.last_name, specialty=payload.specialty)
    for item in payload.availability:
        if item.start_time >= item.end_time:
            raise HTTPException(status_code=422, detail="Availability start_time must be before end_time")
        doctor.availability.append(
            DoctorAvailability(day_of_week=item.day_of_week, start_time=item.start_time, end_time=item.end_time)
        )
    user = User(email=payload.email.lower(), password_hash=hash_password(payload.password), role=UserRole.DOCTOR)
    user.doctor = doctor
    db.add(user)
    commit_or_email_conflict(db)
    db.refresh(user)
    return user


def commit_or_email_conflict(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email is already registered") from exc


def authenticate(db: Session, email: str, password: str) -> tuple[str, User]:
    user = db.scalar(
        select(User)
        .where(func.lower(User.email) == email.lower())
        .options(joinedload(User.patient), joinedload(User.doctor))
    )
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return create_access_token(str(user.id)), user


def list_doctors(db: Session, specialty: str | None = None) -> list[Doctor]:
    query = select(Doctor).options(joinedload(Doctor.availability)).order_by(Doctor.last_name)
    if specialty:
        query = query.where(Doctor.specialty.ilike(f"%{specialty}%"))
    return list(db.scalars(query).unique())


def get_doctor_or_404(db: Session, doctor_id: int) -> Doctor:
    doctor = db.scalar(select(Doctor).where(Doctor.id == doctor_id).options(joinedload(Doctor.availability)))
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


def update_doctor_profile(db: Session, doctor: Doctor, payload: DoctorUpdate) -> Doctor:
    doctor.first_name = payload.first_name
    doctor.last_name = payload.last_name
    doctor.specialty = payload.specialty
    doctor.availability.clear()
    for item in payload.availability:
        if item.start_time >= item.end_time:
            raise HTTPException(status_code=422, detail="Availability start_time must be before end_time")
        doctor.availability.append(
            DoctorAvailability(day_of_week=item.day_of_week, start_time=item.start_time, end_time=item.end_time)
        )
    db.commit()
    db.refresh(doctor)
    return doctor


def update_patient_profile(db: Session, patient: Patient, payload: PatientUpdate) -> Patient:
    patient.first_name = payload.first_name
    patient.last_name = payload.last_name
    patient.phone = payload.phone
    db.commit()
    db.refresh(patient)
    return patient


def generate_slots_for_date(db: Session, doctor: Doctor, slot_date: date) -> list[dict]:
    windows = [item for item in doctor.availability if item.day_of_week == slot_date.weekday()]
    if not windows:
        return []
    start_of_day = datetime.combine(slot_date, time.min).replace(tzinfo=timezone.utc)
    end_of_day = start_of_day + timedelta(days=1)
    booked = set(
        db.scalars(
            select(Appointment.slot_time).where(
                Appointment.doctor_id == doctor.id,
                Appointment.status == AppointmentStatus.BOOKED,
                Appointment.slot_time >= start_of_day,
                Appointment.slot_time < end_of_day,
            )
        )
    )
    now = datetime.now(timezone.utc)
    slots = []
    for window in windows:
        cursor = datetime.combine(slot_date, window.start_time).replace(tzinfo=timezone.utc)
        window_end = datetime.combine(slot_date, window.end_time).replace(tzinfo=timezone.utc)
        while cursor + timedelta(minutes=SLOT_MINUTES) <= window_end:
            slots.append({"slot_time": cursor, "available": cursor > now and cursor not in booked})
            cursor += timedelta(minutes=SLOT_MINUTES)
    return slots


def ensure_slot_is_bookable(db: Session, doctor: Doctor, slot_time: datetime) -> None:
    slot_time = as_utc(slot_time)
    if slot_time <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Cannot book a past slot")
    if slot_time.minute % SLOT_MINUTES != 0 or slot_time.second or slot_time.microsecond:
        raise HTTPException(status_code=400, detail="Slot must align to a 30 minute boundary")
    slot_clock = slot_time.time().replace(tzinfo=None)
    matches = [
        item
        for item in doctor.availability
        if item.day_of_week == slot_time.weekday()
        and item.start_time <= slot_clock
        and (datetime.combine(slot_time.date(), slot_clock) + timedelta(minutes=SLOT_MINUTES)).time() <= item.end_time
    ]
    if not matches:
        raise HTTPException(status_code=400, detail="Slot is outside doctor's availability")


def book_appointment(db: Session, patient: Patient, doctor_id: int, slot_time: datetime) -> Appointment:
    doctor = get_doctor_or_404(db, doctor_id)
    normalized_slot = as_utc(slot_time)
    ensure_slot_is_bookable(db, doctor, normalized_slot)
    appointment = Appointment(patient_id=patient.id, doctor_id=doctor.id, slot_time=normalized_slot)
    db.add(appointment)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="This appointment slot is already booked.") from exc
    db.refresh(appointment)
    return appointment


def cancel_appointment(db: Session, appointment_id: int, patient: Patient) -> Appointment:
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.patient_id != patient.id:
        raise HTTPException(status_code=403, detail="Cannot cancel another patient's appointment")
    if appointment.status != AppointmentStatus.BOOKED:
        raise HTTPException(status_code=409, detail="Appointment is already cancelled or completed")
    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(appointment)
    return appointment


def get_doctor_appointment_or_404(db: Session, doctor: Doctor, appointment_id: int) -> Appointment:
    appointment = db.scalar(
        select(Appointment)
        .where(Appointment.id == appointment_id, Appointment.doctor_id == doctor.id)
        .options(joinedload(Appointment.patient).joinedload(Patient.user), joinedload(Appointment.doctor))
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


def complete_doctor_appointment(db: Session, doctor: Doctor, appointment_id: int) -> Appointment:
    appointment = get_doctor_appointment_or_404(db, doctor, appointment_id)
    if appointment.status != AppointmentStatus.BOOKED:
        raise HTTPException(status_code=409, detail="Only booked appointments can be completed")
    appointment.status = AppointmentStatus.COMPLETED
    db.commit()
    db.refresh(appointment)
    return appointment


def doctor_patients(db: Session, doctor: Doctor) -> list[DoctorPatientRead]:
    appointments = list(
        db.scalars(
            select(Appointment)
            .where(Appointment.doctor_id == doctor.id)
            .options(joinedload(Appointment.patient).joinedload(Patient.user))
            .order_by(Appointment.slot_time.desc())
        )
    )
    grouped: dict[int, list[Appointment]] = {}
    for appointment in appointments:
        grouped.setdefault(appointment.patient_id, []).append(appointment)

    rows = []
    now = datetime.now(timezone.utc)
    for patient_id, items in grouped.items():
        patient = items[0].patient
        booked = [item for item in items if item.status == AppointmentStatus.BOOKED and as_utc(item.slot_time) >= now]
        completed = [item for item in items if as_utc(item.slot_time) < now or item.status == AppointmentStatus.COMPLETED]
        rows.append(
            DoctorPatientRead(
                patient_id=patient_id,
                patient_name=f"{patient.first_name} {patient.last_name}",
                phone=patient.phone,
                email=patient.user.email,
                total_visits=len(items),
                next_visit=min((item.slot_time for item in booked), default=None),
                last_visit=max((item.slot_time for item in completed), default=None),
            )
        )
    return sorted(rows, key=lambda row: row.next_visit or row.last_visit or datetime.min.replace(tzinfo=timezone.utc), reverse=True)


def doctor_records(db: Session, doctor: Doctor) -> list[DoctorRecordRead]:
    appointments = list(
        db.scalars(
            select(Appointment)
            .where(Appointment.doctor_id == doctor.id)
            .options(joinedload(Appointment.patient))
            .order_by(Appointment.slot_time.desc())
        )
    )
    return [
        DoctorRecordRead(
            appointment_id=item.id,
            patient_id=item.patient_id,
            patient_name=f"{item.patient.first_name} {item.patient.last_name}",
            slot_time=item.slot_time,
            status=item.status,
            summary=f"{item.status.value.title()} consultation with {item.patient.first_name} {item.patient.last_name}",
        )
        for item in appointments
    ]


def doctor_stats(db: Session, doctor: Doctor) -> DoctorStatsRead:
    now = datetime.now(timezone.utc)
    today_start = datetime.combine(now.date(), time.min).replace(tzinfo=timezone.utc)
    today_end = today_start + timedelta(days=1)
    week_start = today_start - timedelta(days=today_start.weekday())
    week_end = week_start + timedelta(days=7)
    appointments = list(db.scalars(select(Appointment).where(Appointment.doctor_id == doctor.id)))
    return DoctorStatsRead(
        today_appointments=sum(1 for item in appointments if today_start <= as_utc(item.slot_time) < today_end),
        week_appointments=sum(1 for item in appointments if week_start <= as_utc(item.slot_time) < week_end),
        total_patients=len({item.patient_id for item in appointments}),
        completed_consultations=sum(1 for item in appointments if item.status == AppointmentStatus.COMPLETED),
    )


def appointment_to_read(appointment: Appointment) -> AppointmentRead:
    return AppointmentRead(
        id=appointment.id,
        doctor_id=appointment.doctor_id,
        patient_id=appointment.patient_id,
        slot_time=appointment.slot_time,
        status=appointment.status,
        doctor_name=f"Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}",
        patient_name=f"{appointment.patient.first_name} {appointment.patient.last_name}",
    )


def as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)
