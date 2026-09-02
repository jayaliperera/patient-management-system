from datetime import time
from sqlalchemy import select
from .auth import hash_password
from .db import SessionLocal
from .models import Availability, Role, User

DOCTORS = [("Dr. Maya Chen", "Cardiology"), ("Dr. James Wilson", "Dermatology"), ("Dr. Amara Silva", "General Medicine")]


def run():
    with SessionLocal() as db:
        for index, (name, specialty) in enumerate(DOCTORS, 1):
            email = f"doctor{index}@clinic.test"
            doctor = db.scalar(select(User).where(User.email == email))
            if not doctor:
                doctor = User(name=name, email=email, password_hash=hash_password("Doctor123!"), role=Role.doctor, specialty=specialty)
                db.add(doctor); db.flush()
                for weekday in range(5): db.add(Availability(doctor_id=doctor.id, weekday=weekday, start_time=time(9), end_time=time(17), slot_minutes=30))
        db.commit()


if __name__ == "__main__": run()

