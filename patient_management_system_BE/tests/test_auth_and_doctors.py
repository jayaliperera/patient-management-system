from datetime import datetime, timedelta, timezone

from conftest import register_doctor, register_patient


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_register_login_and_me(client):
    register_patient(client)
    response = client.post("/api/v1/auth/login", json={"email": "patient@example.com", "password": "password123"})
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "PATIENT"

    me = client.get("/api/v1/auth/me", headers=auth(response.json()["access_token"]))
    assert me.status_code == 200
    assert me.json()["name"] == "Maya Silva"


def test_patient_profile_reads_and_updates_db_data(client):
    patient = register_patient(client)

    profile = client.get("/api/v1/patients/me/profile", headers=auth(patient["access_token"]))
    assert profile.status_code == 200
    assert profile.json()["first_name"] == "Maya"

    updated = client.put(
        "/api/v1/patients/me/profile",
        headers=auth(patient["access_token"]),
        json={"first_name": "Jayali", "last_name": "Perera", "phone": "0771234567"},
    )
    assert updated.status_code == 200

    profile = client.get("/api/v1/patients/me/profile", headers=auth(patient["access_token"]))
    assert profile.json()["phone"] == "0771234567"


def test_doctor_search_slots_and_schedule(client):
    doctor = register_doctor(client)
    response = client.get("/api/v1/doctors?specialty=cardio")
    assert response.status_code == 200
    assert len(response.json()) == 1

    today = datetime.now(timezone.utc).date()
    days = (0 - today.weekday()) % 7 or 7
    monday = today + timedelta(days=days)
    slots = client.get(f"/api/v1/doctors/{doctor['user']['profile_id']}/slots?date={monday.isoformat()}")
    assert slots.status_code == 200
    assert len(slots.json()) == 6

    schedule = client.get("/api/v1/doctors/me/schedule?view=week", headers=auth(doctor["access_token"]))
    assert schedule.status_code == 200


def test_doctor_can_edit_profile_and_availability(client):
    doctor = register_doctor(client)

    response = client.put(
        "/api/v1/doctors/me/profile",
        headers=auth(doctor["access_token"]),
        json={
            "first_name": "Nimali",
            "last_name": "Fernando",
            "specialty": "Neurology",
            "phone": "+94 71 555 1212",
            "hospital": "CareSlot Neuro Clinic",
            "registration_number": "SLMC 70011",
            "bio": "Neurology consultant.",
            "experience_years": 9,
            "consultation_fee": 3000,
            "room_number": "Room 8",
            "availability": [{"day_of_week": 2, "start_time": "10:00", "end_time": "13:00"}],
        },
    )

    assert response.status_code == 200
    assert response.json()["first_name"] == "Nimali"
    assert response.json()["specialty"] == "Neurology"
    assert response.json()["phone"] == "+94 71 555 1212"
    assert response.json()["hospital"] == "CareSlot Neuro Clinic"
    assert response.json()["registration_number"] == "SLMC 70011"
    assert response.json()["availability"][0]["day_of_week"] == 2


def test_doctor_specialty_must_be_a_name(client):
    response = client.post(
        "/api/v1/auth/register/doctor",
        json={
            "email": "invalid-specialty@example.com",
            "password": "password123",
            "first_name": "Bad",
            "last_name": "Data",
            "specialty": "0767823808",
            "availability": [{"day_of_week": 0, "start_time": "09:00", "end_time": "12:00"}],
        },
    )

    assert response.status_code == 422


def test_doctor_profile_save_deduplicates_availability(client):
    doctor = register_doctor(client)

    response = client.put(
        "/api/v1/doctors/me/profile",
        headers=auth(doctor["access_token"]),
        json={
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
            "availability": [
                {"day_of_week": 0, "start_time": "09:00", "end_time": "12:00"},
                {"day_of_week": 0, "start_time": "09:00", "end_time": "12:00"},
            ],
        },
    )

    assert response.status_code == 200
    assert len(response.json()["availability"]) == 1


def test_doctor_pages_use_real_appointment_data(client):
    patient = register_patient(client, "doctor-page-patient@example.com")
    doctor = register_doctor(client, "doctor-page-doctor@example.com")
    today = datetime.now(timezone.utc).date()
    days = (0 - today.weekday()) % 7 or 7
    slot = datetime.combine(today + timedelta(days=days), datetime.min.time()).replace(hour=10, tzinfo=timezone.utc)

    booked = client.post(
        "/api/v1/appointments",
        headers=auth(patient["access_token"]),
        json={"doctor_id": doctor["user"]["profile_id"], "slot_time": slot.isoformat()},
    )
    assert booked.status_code == 201

    patients = client.get("/api/v1/doctors/me/patients", headers=auth(doctor["access_token"]))
    assert patients.status_code == 200
    assert patients.json()[0]["patient_name"] == "Maya Silva"

    records = client.get("/api/v1/doctors/me/records", headers=auth(doctor["access_token"]))
    assert records.status_code == 200
    assert records.json()[0]["appointment_id"] == booked.json()["id"]

    completed = client.patch(
        f"/api/v1/doctors/me/appointments/{booked.json()['id']}/complete",
        headers=auth(doctor["access_token"]),
    )
    assert completed.status_code == 200
    assert completed.json()["status"] == "COMPLETED"

    stats = client.get("/api/v1/doctors/me/stats", headers=auth(doctor["access_token"]))
    assert stats.status_code == 200
    assert stats.json()["total_patients"] == 1
    assert stats.json()["completed_consultations"] == 1
