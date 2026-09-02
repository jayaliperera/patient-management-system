from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/patient_management"
    jwt_secret: str = "change-me-in-production"
    access_token_minutes: int = 60
    cors_origins: str = "http://localhost:5173,http://localhost:5174"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

