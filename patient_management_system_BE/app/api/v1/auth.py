from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, joinedload

from app.api.v1.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas import LoginRequest, RegisterDoctor, RegisterPatient, Token, UserRead
from app.services import authenticate, register_doctor, register_patient, user_to_read


router = APIRouter()


@router.post("/register/patient", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_patient_endpoint(payload: RegisterPatient, db: Session = Depends(get_db)):
    user = register_patient(db, payload)
    token, user = authenticate(db, user.email, payload.password)
    return Token(access_token=token, user=user_to_read(user))


@router.post("/register/doctor", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_doctor_endpoint(payload: RegisterDoctor, db: Session = Depends(get_db)):
    user = register_doctor(db, payload)
    token, user = authenticate(db, user.email, payload.password)
    return Token(access_token=token, user=user_to_read(user))


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    token, user = authenticate(db, payload.email, payload.password)
    return Token(access_token=token, user=user_to_read(user))


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.refresh(user)
    return user_to_read(user)
