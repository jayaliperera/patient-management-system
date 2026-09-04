from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo


SRI_LANKA_TZ = ZoneInfo("Asia/Colombo")


def sri_lanka_now() -> datetime:
    return datetime.now(SRI_LANKA_TZ)


def sri_lanka_day_bounds_utc(value: date) -> tuple[datetime, datetime]:
    start = datetime.combine(value, time.min, tzinfo=SRI_LANKA_TZ)
    end = start + timedelta(days=1)
    return start.astimezone(timezone.utc), end.astimezone(timezone.utc)


def sri_lanka_datetime_to_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=SRI_LANKA_TZ)
    return value.astimezone(timezone.utc)
