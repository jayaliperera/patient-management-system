from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    PROJECT_NAME: str = "Patient Management System"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/patient_management"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", case_sensitive=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
