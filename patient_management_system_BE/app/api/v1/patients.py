from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.dependencies import require_patient
from app.db.database import get_db
from app.db.models import User
from app.schemas import PatientUpdate, UserRead
from app.services import update_patient_profile, user_to_read


router = APIRouter()


@router.put("/me/profile", response_model=UserRead)
def edit_my_profile(
    payload: PatientUpdate,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    update_patient_profile(db, current_user.patient, payload)
    return user_to_read(current_user)
