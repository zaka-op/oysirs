import uuid
from sqlalchemy.orm import relationship, DeclarativeBase, Mapped, mapped_column
from sqlalchemy import UniqueConstraint, ForeignKey, Uuid
from sqlalchemy.sql import text
from datetime import datetime, timezone, timedelta


def tz_now(hours_offset: int = 1) -> datetime:
    """
    Get the current datetime with a specified timezone offset.
    Args:
        hours_offset (int): The timezone offset in hours from UTC. Default is 1 (Africa/Lagos).
    Returns:
        datetime: The current datetime with the specified timezone.
    """
    return datetime.now(timezone(timedelta(hours=hours_offset)))

class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(default=tz_now)
    updated_at: Mapped[datetime] = mapped_column(default=tz_now, onupdate=tz_now)

# Import all schemas to register them with the Base
from . import customer, upload