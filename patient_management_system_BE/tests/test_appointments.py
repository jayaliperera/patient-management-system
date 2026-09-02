from datetime import datetime, timedelta, timezone

from conftest import register_doctor, register_patient


def next_monday_at(hour: int, minute: int = 0) -> str:
    today = datetime.now(timezone.utc).date()
    days = (0 - today.weekday()) % 7
    if days == 0:
        days = 7
    target = datetime.combine(today + timedelta(days=days), datetime.min.time()).replace(
        hour=hour, minute=minute, tzinfo=timezone.utc
    )
    return target.isoformat()


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_patient_can_book_and_cancel(client):
    patient = register_patient(client)
    doctor = register_doctor(client)
    doctor_id = doctor["user"]["profile_id"]

    booked = client.post(
        "/api/v1/appointments",
        json={"doctor_id": doctor_id, "slot_time": next_monday_at(9)},
        headers=auth(patient["access_token"]),
    )

    assert booked.status_code == 201
    assert booked.json()["status"] == "BOOKED"

    appointments = client.get("/api/v1/appointments/my", headers=auth(patient["access_token"]))
    assert appointments.status_code == 200
    assert len(appointments.json()) == 1

    cancelled = client.patch(f"/api/v1/appointments/{booked.json()['id']}/cancel", headers=auth(patient["access_token"]))
    assert cancelled.status_code == 200
    assert cancelled.json()["status"] == "CANCELLED"


def test_double_booking_returns_conflict(client):
    first_patient = register_patient(client, "first@example.com")
    second_patient = register_patient(client, "second@example.com")
    doctor = register_doctor(client)
    doctor_id = doctor["user"]["profile_id"]
    payload = {"doctor_id": doctor_id, "slot_time": next_monday_at(9, 30)}

    assert client.post("/api/v1/appointments", json=payload, headers=auth(first_patient["access_token"])).status_code == 201
    conflict = client.post("/api/v1/appointments", json=payload, headers=auth(second_patient["access_token"]))

    assert conflict.status_code == 409


def test_rejects_past_or_unavailable_slots(client):
    patient = register_patient(client)
    doctor = register_doctor(client)
    doctor_id = doctor["user"]["profile_id"]

    past = (datetime.now(timezone.utc) - timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
    assert (
        client.post(
            "/api/v1/appointments",
            json={"doctor_id": doctor_id, "slot_time": past.isoformat()},
            headers=auth(patient["access_token"]),
        ).status_code
        == 400
    )

    unavailable = client.post(
        "/api/v1/appointments",
        json={"doctor_id": doctor_id, "slot_time": next_monday_at(20)},
        headers=auth(patient["access_token"]),
    )
    assert unavailable.status_code == 400


def test_patient_cannot_cancel_someone_elses_appointment(client):
    owner = register_patient(client, "owner@example.com")
    intruder = register_patient(client, "intruder@example.com")
    doctor = register_doctor(client)
    booked = client.post(
        "/api/v1/appointments",
        json={"doctor_id": doctor["user"]["profile_id"], "slot_time": next_monday_at(10)},
        headers=auth(owner["access_token"]),
    ).json()

    response = client.patch(f"/api/v1/appointments/{booked['id']}/cancel", headers=auth(intruder["access_token"]))
    assert response.status_code == 403
