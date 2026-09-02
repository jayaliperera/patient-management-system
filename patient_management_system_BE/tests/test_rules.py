from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
import jwt
from app.auth import create_token, hash_password, verify_password
from app.config import settings
from app.models import Role


def test_password_is_hashed_and_verifiable():
    encoded = hash_password("strong-password")
    assert encoded != "strong-password"
    assert verify_password("strong-password", encoded)
    assert not verify_password("wrong-password", encoded)


def test_access_token_contains_user_and_role():
    token = create_token(SimpleNamespace(id=42, role=Role.patient))
    claims = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    assert claims["sub"] == "42"
    assert claims["role"] == "patient"
    assert datetime.fromtimestamp(claims["exp"], timezone.utc) > datetime.now(timezone.utc) + timedelta(minutes=1)

