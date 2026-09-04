from datetime import date, datetime, time, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.security import create_access_token, hash_password, verify_password
from app.core.timezone import SRI_LANKA_TZ, sri_lanka_datetime_to_utc, sri_lanka_day_bounds_utc, sri_lanka_now
from app.db.models import Appointment, AppointmentStatus, Doctor, DoctorAvailability, Patient, User, UserRole
from app.schemas import AppointmentRead, AppointmentUpdate, DoctorPatientRead, DoctorRecordRead, DoctorStatsRead, DoctorUpdate, PatientUpdate, RegisterDoctor, RegisterPatient, UserRead


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
    validate_specialty(payload.specialty)
    doctor = Doctor(
        first_name=payload.first_name,
        last_name=payload.last_name,
        specialty=payload.specialty,
        phone=payload.phone,
        hospital=payload.hospital,
        registration_number=payload.registration_number,
        bio=payload.bio,
        experience_years=payload.experience_years,
        consultation_fee=payload.consultation_fee,
        room_number=payload.room_number,
    )
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
    validate_specialty(payload.specialty)
    doctor.first_name = payload.first_name
    doctor.last_name = payload.last_name
    doctor.specialty = payload.specialty
    doctor.phone = payload.phone
    doctor.hospital = payload.hospital
    doctor.registration_number = payload.registration_number
    doctor.bio = payload.bio
    doctor.experience_years = payload.experience_years
    doctor.consultation_fee = payload.consultation_fee
    doctor.room_number = payload.room_number
    doctor.availability.clear()
    db.flush()
    seen_windows: set[tuple[int, time, time]] = set()
    for item in payload.availability:
        if item.start_time >= item.end_time:
            raise HTTPException(status_code=422, detail="Availability start_time must be before end_time")
        key = (item.day_of_week, item.start_time, item.end_time)
        if key in seen_windows:
            continue
        seen_windows.add(key)
        doctor.availability.append(
            DoctorAvailability(day_of_week=item.day_of_week, start_time=item.start_time, end_time=item.end_time)
        )
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Availability already exists for this doctor") from exc
    db.refresh(doctor)
    return doctor


def update_patient_profile(db: Session, patient: Patient, payload: PatientUpdate) -> Patient:
    patient.first_name = payload.first_name
    patient.last_name = payload.last_name
    patient.phone = payload.phone
    db.commit()
    db.refresh(patient)
    return patient


def validate_specialty(value: str) -> None:
    if not any(character.isalpha() for character in value):
        raise HTTPException(status_code=422, detail="Specialty must be a valid medical specialty name")


def generate_slots_for_date(db: Session, doctor: Doctor, slot_date: date) -> list[dict]:
    windows = [item for item in doctor.availability if item.day_of_week == slot_date.weekday()]
    if not windows:
        return []
    start_of_day, end_of_day = sri_lanka_day_bounds_utc(slot_date)
    booked = set(
        as_utc(value)
        for value in db.scalars(
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
        cursor = datetime.combine(slot_date, window.start_time, tzinfo=SRI_LANKA_TZ)
        window_end = datetime.combine(slot_date, window.end_time, tzinfo=SRI_LANKA_TZ)
        while cursor + timedelta(minutes=SLOT_MINUTES) <= window_end:
            slot_time = cursor.astimezone(timezone.utc)
            slots.append({"slot_time": slot_time, "available": slot_time > now and slot_time not in booked})
            cursor += timedelta(minutes=SLOT_MINUTES)
    return slots


def ensure_slot_is_bookable(db: Session, doctor: Doctor, slot_time: datetime) -> None:
    slot_time = as_utc(slot_time)
    if slot_time <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Cannot book a past slot")
    local_slot = slot_time.astimezone(SRI_LANKA_TZ)
    if local_slot.minute % SLOT_MINUTES != 0 or local_slot.second or local_slot.microsecond:
        raise HTTPException(status_code=400, detail="Slot must align to a 30 minute boundary")
    slot_clock = local_slot.time().replace(tzinfo=None)
    matches = [
        item
        for item in doctor.availability
        if item.day_of_week == local_slot.weekday()
        and item.start_time <= slot_clock
        and (datetime.combine(local_slot.date(), slot_clock) + timedelta(minutes=SLOT_MINUTES)).time() <= item.end_time
    ]
    if not matches:
        raise HTTPException(status_code=400, detail="Slot is outside doctor's availability")


def book_appointment(db: Session, patient: Patient, doctor_id: int, slot_time: datetime) -> Appointment:
    doctor = get_doctor_or_404(db, doctor_id)
    normalized_slot = sri_lanka_datetime_to_utc(slot_time)
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


def get_patient_appointment_or_404(db: Session, patient: Patient, appointment_id: int) -> Appointment:
    appointment = db.scalar(
        select(Appointment)
        .where(Appointment.id == appointment_id)
        .options(joinedload(Appointment.patient), joinedload(Appointment.doctor))
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.patient_id != patient.id:
        raise HTTPException(status_code=403, detail="Cannot manage another patient's appointment")
    return appointment


def update_appointment(db: Session, patient: Patient, appointment_id: int, payload: AppointmentUpdate) -> Appointment:
    appointment = get_patient_appointment_or_404(db, patient, appointment_id)
    if appointment.status != AppointmentStatus.BOOKED:
        raise HTTPException(status_code=409, detail="Only booked appointments can be rescheduled")
    doctor = get_doctor_or_404(db, payload.doctor_id)
    normalized_slot = sri_lanka_datetime_to_utc(payload.slot_time)
    ensure_slot_is_bookable(db, doctor, normalized_slot)
    appointment.doctor_id = doctor.id
    appointment.doctor = doctor
    appointment.slot_time = normalized_slot
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="This appointment slot is already booked.") from exc
    db.refresh(appointment)
    return appointment


def cancel_appointment(db: Session, appointment_id: int, patient: Patient) -> Appointment:
    appointment = get_patient_appointment_or_404(db, patient, appointment_id)
    if appointment.status != AppointmentStatus.BOOKED:
        raise HTTPException(status_code=409, detail="Appointment is already cancelled or completed")
    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(appointment)
    return appointment


def delete_appointment(db: Session, patient: Patient, appointment_id: int) -> None:
    appointment = get_patient_appointment_or_404(db, patient, appointment_id)
    db.delete(appointment)
    db.commit()


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
    now = sri_lanka_now()
    today = now.date()
    today_start, today_end = sri_lanka_day_bounds_utc(today)
    week_start, _ = sri_lanka_day_bounds_utc(today - timedelta(days=today.weekday()))
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
        slot_time=as_utc(appointment.slot_time),
        status=appointment.status,
        doctor_name=f"Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}",
        patient_name=f"{appointment.patient.first_name} {appointment.patient.last_name}",
    )


def as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)
