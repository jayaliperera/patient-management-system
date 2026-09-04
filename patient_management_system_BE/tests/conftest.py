import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))
os.environ["DATABASE_URL"] = "sqlite:///./test_patient_management.db"
os.environ["SECRET_KEY"] = "test-secret"

import pytest
from fastapi.testclient import TestClient

from app.db.database import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def register_patient(client, email="patient@example.com"):
    response = client.post(
        "/api/v1/auth/register/patient",
        json={"email": email, "password": "password123", "first_name": "Maya", "last_name": "Silva"},
    )
    assert response.status_code == 201
    return response.json()


def register_doctor(client, email="doctor@example.com"):
    response = client.post(
        "/api/v1/auth/register/doctor",
        json={
            "email": email,
            "password": "password123",
            "first_name": "Anil",
            "last_name": "Perera",
            "specialty": "Cardiology",
            "phone": "+94 77 123 4567",
            "hospital": "CareSlot Medical Center",
            "registration_number": "SLMC 67823",
            "bio": "Consultant cardiologist focused on patient-centered care.",
            "experience_years": 7,
            "consultation_fee": 2500,
            "room_number": "Room 121",
            "availability": [{"day_of_week": 0, "start_time": "09:00", "end_time": "12:00"}],
        },
    )
    assert response.status_code == 201
    return response.json()
