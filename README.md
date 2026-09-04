# 🏥 Patient Management System

A full-stack clinic appointment booking system built for the Software Engineer assignment.

The application lets patients register, log in, search doctors by specialty, view available time slots, book appointments, view upcoming appointments, reschedule, delete, and cancel bookings. Doctors can log in separately, manage their profile and availability, view their own schedule, see appointments, mark appointments completed, and review patient/record summaries.

Docker is intentionally not included because it was a bonus requirement and not needed for this submission.

## 🚀 Tech Stack

- 🐍 Backend: FastAPI
- 🗄️ ORM: SQLAlchemy 2
- ✅ Validation: Pydantic
- 🔐 Authentication: JWT + password hashing
- 🧬 Migrations: Alembic
- 🐘 Database: PostgreSQL for application use
- ⚛️ Frontend: React with hooks + Vite
- 🌐 HTTP Client: Axios
- 🎨 Icons/UI: lucide-react + custom CSS
- 🧪 Tests: pytest + FastAPI TestClient

## 📌 Main Features

### 👤 Patient Features

- Register as a patient
- Log in with email and password
- View authenticated patient session
- Search doctors by name, specialty, hospital, and date availability
- Filter doctors by specialty
- View doctor profile details
- View doctor weekly availability as bookable slots
- Book a valid appointment slot
- View upcoming booked appointments
- View appointment history
- Cancel own appointment
- Reschedule own appointment
- Delete own appointment record
- Download appointment receipt as PDF from the frontend
- Update patient profile information
- Protected patient routes so doctors cannot use patient-only actions

### 🩺 Doctor Features

- Register as a doctor
- Log in with email and password
- View authenticated doctor session
- Create initial weekly availability
- Edit doctor profile details
- Edit weekly availability
- View own schedule by day, week, or month
- View own appointments
- Filter appointments by status
- Search appointments by patient name
- Mark booked appointments as completed
- View patient list based on appointments
- View basic consultation records
- View dashboard stats
- Protected doctor routes so patients cannot use doctor-only actions

### 📅 Appointment Features

- Appointment connects a patient, doctor, date/time slot, and status
- Supported statuses:
  - `BOOKED`
  - `CANCELLED`
  - `COMPLETED`
- Patients cannot book past slots
- Patients cannot book outside doctor availability
- Patients cannot book invalid 30-minute boundaries
- Patients cannot cancel, update, or delete another patient's appointment
- Doctors can only view their own schedule
- Cancelled appointments free the slot for another booking

### 🛡️ Correctness & Safety

- Double-booking is prevented at the database level
- Appointment creation does not accept `patient_id` from the frontend
- Patient identity is taken from the JWT token
- SQLAlchemy query expressions avoid raw SQL injection risks
- Request-scoped database sessions are closed properly
- Clear HTTP status codes are used for errors:
  - `401` invalid/expired token
  - `403` forbidden role or ownership
  - `404` missing doctor/appointment
  - `409` already booked or invalid state conflict
  - `422` validation error

## 📁 Project Structure

```text
Patient Management System/
├── patient_management_system_BE/
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── appointments.py
│   │   │   ├── auth.py
│   │   │   ├── dependencies.py
│   │   │   ├── doctors.py
│   │   │   └── patients.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── services.py
│   ├── tests/
│   ├── requirements.txt
│   └── alembic.ini
├── patient_management_syetem_FE/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── api.js
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## ⚙️ Backend Setup

Open a terminal in the project root.

```bash
cd patient_management_system_BE
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `patient_management_system_BE/.env` if your PostgreSQL connection is different:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/patient_management
SECRET_KEY=replace-with-a-long-random-secret
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

For local development without PostgreSQL installed, you can use a project-local SQLite database:

```env
DATABASE_URL=sqlite:///./patient_management.db
```

When SQLite is used, the backend creates the local tables automatically on startup.

Run database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

If you prefer to stay in the project root, run:

```bash
alembic -c patient_management_system_BE/alembic.ini upgrade head
uvicorn app.main:app --reload --app-dir patient_management_system_BE
```

Backend URLs:

- API base: `http://localhost:8000/api/v1`
- Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

## 🎨 Frontend Setup

Open a second terminal in the project root.

```bash
cd patient_management_syetem_FE
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

If the backend URL is different, create/update a frontend environment variable:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 🧪 Running Tests

From the backend folder:

```bash
cd patient_management_system_BE
pytest
```

Current verified result:

```text
16 passed
```

The test suite uses SQLite for speed and isolation. The application configuration and migrations target PostgreSQL.

## 🏗️ Build Frontend

From the frontend folder:

```bash
cd patient_management_syetem_FE
npm run build
```

Current verified result:

```text
vite build completed successfully
```

## 🗄️ Database Design

### `users`

Stores shared authentication information.

- `id`
- `email`
- `password_hash`
- `role`
- `created_at`

Roles:

- `PATIENT`
- `DOCTOR`

### `patients`

Stores patient profile information.

- `id`
- `user_id`
- `first_name`
- `last_name`
- `phone`

### `doctors`

Stores doctor profile information.

- `id`
- `user_id`
- `first_name`
- `last_name`
- `specialty`
- `phone`
- `hospital`
- `registration_number`
- `bio`
- `experience_years`
- `consultation_fee`
- `room_number`
- `rating`

### `doctor_availability`

Stores recurring weekly availability windows.

- `doctor_id`
- `day_of_week`
- `start_time`
- `end_time`

`day_of_week` follows Python weekday numbering:

- `0` Monday
- `1` Tuesday
- `2` Wednesday
- `3` Thursday
- `4` Friday
- `5` Saturday
- `6` Sunday

### `appointments`

Stores patient bookings.

- `id`
- `patient_id`
- `doctor_id`
- `slot_time`
- `status`
- `created_at`
- `cancelled_at`

Double-booking protection:

```text
Unique active booking index on doctor_id + slot_time
where status = BOOKED
```

This means one doctor cannot have two active bookings for the same slot, but a cancelled slot can be booked again.

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register/patient` | Register patient |
| `POST` | `/api/v1/auth/register/doctor` | Register doctor |
| `POST` | `/api/v1/auth/login` | Login and receive JWT |
| `GET` | `/api/v1/auth/me` | Get current user |

### Doctors

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/doctors` | List doctors |
| `GET` | `/api/v1/doctors?specialty=Cardiology` | Search doctors by specialty |
| `GET` | `/api/v1/doctors/{doctor_id}` | View doctor detail |
| `GET` | `/api/v1/doctors/{doctor_id}/slots?date=2026-09-07` | View available slots |
| `GET` | `/api/v1/doctors/me/profile` | Doctor profile |
| `PUT` | `/api/v1/doctors/me/profile` | Update doctor profile and availability |
| `GET` | `/api/v1/doctors/me/schedule?view=day&on=2026-09-07` | Doctor schedule |
| `GET` | `/api/v1/doctors/me/appointments` | Doctor appointments |
| `PATCH` | `/api/v1/doctors/me/appointments/{appointment_id}/complete` | Mark appointment completed |
| `GET` | `/api/v1/doctors/me/patients` | Doctor patient list |
| `GET` | `/api/v1/doctors/me/records` | Doctor appointment records |
| `GET` | `/api/v1/doctors/me/stats` | Doctor dashboard stats |

Schedule `view` supports:

- `day`
- `week`
- `month`

### Patients

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/patients/me/profile` | Patient profile |
| `PUT` | `/api/v1/patients/me/profile` | Update patient profile |

### Appointments

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/appointments` | Book appointment |
| `GET` | `/api/v1/appointments/my` | View upcoming booked appointments |
| `GET` | `/api/v1/appointments/history` | View all patient appointments |
| `GET` | `/api/v1/appointments/{appointment_id}` | View appointment detail |
| `PUT` | `/api/v1/appointments/{appointment_id}` | Reschedule appointment |
| `PATCH` | `/api/v1/appointments/{appointment_id}/cancel` | Cancel appointment |
| `DELETE` | `/api/v1/appointments/{appointment_id}` | Delete appointment |

## 🧭 User Flow

### Patient Booking Flow

1. Patient registers or logs in.
2. Patient searches doctors by specialty/name/hospital.
3. Patient selects a doctor.
4. Patient chooses a date.
5. Frontend calls the slots API.
6. Backend generates 30-minute slots from doctor availability.
7. Already booked slots are marked unavailable.
8. Patient selects an available slot.
9. Backend validates:
   - doctor exists
   - slot is in the future
   - slot is on a 30-minute boundary
   - slot fits the doctor's availability
   - slot is not already booked
10. Appointment is created with `BOOKED` status.
11. Patient can view, cancel, reschedule, delete, or download a receipt.

### Doctor Schedule Flow

1. Doctor registers or logs in.
2. Doctor can edit profile and weekly availability.
3. Doctor opens schedule.
4. Backend returns only that doctor's appointments.
5. Doctor can switch day/week/month view.
6. Doctor can view appointments and mark booked appointments as completed.

## ✅ Assignment Checklist

| Requirement | Status |
|---|---|
| Backend source | ✅ Done |
| Frontend source | ✅ Done |
| PostgreSQL database configuration | ✅ Done |
| Database migrations | ✅ Done |
| Patient registration/login | ✅ Done |
| Doctor registration/login | ✅ Done |
| Doctor search by specialty | ✅ Done |
| View open time slots | ✅ Done |
| Book appointment | ✅ Done |
| Prevent double-booking | ✅ Done |
| Patient upcoming appointments | ✅ Done |
| Cancel appointment | ✅ Done |
| Doctor own schedule | ✅ Done |
| Edge case tests | ✅ Done |
| Part 2 fixed implementation | ✅ Done |
| Part 2 written explanation | ✅ Done |
| README setup instructions | ✅ Done |
| Bonus auth/authorization | ✅ Done |

## 🧩 Key Architecture Decisions

- Patients and doctors share the `users` table because authentication behavior is common.
- Patient and doctor profile data is separated into `patients` and `doctors` tables.
- Appointment creation uses the authenticated patient from the JWT token instead of trusting a frontend `patient_id`.
- Doctor schedule routes use `/doctors/me/...` so doctors cannot request another doctor's private schedule.
- Doctor availability is stored as weekly recurring windows.
- Slots are generated dynamically for a selected date instead of storing every possible slot in the database.
- 30-minute slots are enforced consistently.
- Active double-booking is prevented with a database-level partial unique index.
- Cancelled appointments remain in history but no longer block that slot.
- Backend business logic is kept in `services.py`; API files mainly handle routing and dependencies.

## 🧪 Test Coverage Summary

Tests cover:

- Patient registration and login
- JWT `/me` endpoint
- Doctor search
- Slot generation
- Doctor schedule access
- Doctor profile update
- Doctor availability update
- Appointment booking
- Appointment cancellation
- Appointment rescheduling
- Appointment deletion
- Double-booking conflict
- Rescheduling into booked slot conflict
- Rejection of past slots
- Rejection of unavailable slots
- Preventing patients from managing someone else's appointment
- Doctor dashboard data endpoints

## 🐞 Part 2: Debugging Exercise

The assignment included a fictional FastAPI booking snippet with unsafe raw SQL and production bugs. This project fixes those issues through the implemented API and service layer.

### 1. SQL Injection

Problem:

The original snippet inserted `doctor_id`, `patient_id`, and `slot_time` directly into SQL strings.

Why this is dangerous:

Malicious input could modify the SQL query and expose, change, or delete data.

Fix:

This project uses SQLAlchemy query expressions and Pydantic request validation instead of string-built SQL.

### 2. Race Condition During Booking

Problem:

The original snippet first checked whether a slot existed, then inserted a booking later.

Why this is dangerous:

Two patients could book the same doctor slot at the same time. Both requests might pass the check before either insert finishes.

Fix:

This project adds a database-level unique index on active booked appointments:

```text
doctor_id + slot_time where status = BOOKED
```

If two requests race, the database accepts one and rejects the other. The API returns `409 Conflict`.

### 3. Missing Transaction Handling

Problem:

The original code executed inserts without a clear commit/rollback flow.

Why this is dangerous:

Failures can leave inconsistent behavior, unclear persistence, or partial work.

Fix:

This project commits successful operations and rolls back failed operations, especially around appointment booking and profile updates.

### 4. Connection Leak

Problem:

The original snippet opened a database connection but did not close it.

Why this is dangerous:

Under traffic, open connections can accumulate and eventually break the app.

Fix:

This project uses FastAPI dependency-managed sessions in `get_db()`, which closes the session in `finally`.

### 5. Trusting `patient_id` From Request

Problem:

The original endpoint allowed the caller to pass any `patient_id`.

Why this is dangerous:

A user could book appointments on behalf of another patient.

Fix:

The appointment API requires a patient JWT token and uses `current_user.patient.id`.

### 6. No Authorization On Doctor Schedule

Problem:

The original schedule endpoint used `/doctors/{doctor_id}/schedule`.

Why this is dangerous:

Anyone could request another doctor's schedule if the route were public or weakly protected.

Fix:

This project uses `/doctors/me/schedule` and requires a doctor token.

### 7. Booking Past Slots

Problem:

The original code accepted any `slot_time`.

Why this is wrong:

Patients should not book appointments in the past.

Fix:

`ensure_slot_is_bookable()` rejects slots that are earlier than or equal to the current time.

### 8. Booking Outside Availability

Problem:

The original code did not check the doctor's availability.

Why this is wrong:

A patient could book a doctor at midnight or outside clinic hours.

Fix:

The backend checks `doctor_availability` before creating or rescheduling appointments.

### 9. Weak Error Response

Problem:

The original snippet returned `{"error": "Slot already booked"}` with a normal successful response.

Why this is wrong:

Clients need proper HTTP status codes to handle failures correctly.

Fix:

This project returns proper FastAPI `HTTPException` responses such as `400`, `403`, `404`, and `409`.

### 10. Bad Date Filtering

Problem:

The original schedule query used `LIKE` on a datetime string.

Why this is weak:

It depends on string formatting and does not use database datetime behavior properly.

Fix:

The schedule endpoint uses datetime ranges:

```text
slot_time >= start
slot_time < end
```

## Final Notes

This submission focuses on the required end-to-end booking workflow, correctness, authorization, database constraints, tests, and clear code structure. The main assignment requirements are implemented, tested, and documented.
