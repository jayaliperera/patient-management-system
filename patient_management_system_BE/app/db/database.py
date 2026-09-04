from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def engine_options(database_url: str) -> dict:
    options = {"pool_pre_ping": True}
    if make_url(database_url).drivername.startswith("sqlite"):
        options["connect_args"] = {"check_same_thread": False}
    return options


engine = create_engine(settings.DATABASE_URL, **engine_options(settings.DATABASE_URL))
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def init_local_sqlite_db() -> None:
    if make_url(settings.DATABASE_URL).drivername.startswith("sqlite"):
        from app.db import models

        Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
