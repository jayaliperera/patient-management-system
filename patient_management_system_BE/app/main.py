from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

from app.api.v1 import appointments, auth, doctors, patients
from app.core.config import settings
from app.db.database import init_local_sqlite_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_local_sqlite_db()
    yield


app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["doctors"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["appointments"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["patients"])


@app.exception_handler(OperationalError)
async def database_connection_error_handler(request: Request, exc: OperationalError):
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": "Database connection failed. Check DATABASE_URL and make sure PostgreSQL is running."},
    )


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}
