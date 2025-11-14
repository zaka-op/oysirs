import uuid
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import UniqueConstraint

from .base import Base


class Upload(Base):
    __tablename__ = 'uploads'
    year: Mapped[int] = mapped_column(nullable=False)
    bank: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(nullable=False)
    progress: Mapped[int] = mapped_column(default=0)
    message: Mapped[str] = mapped_column()
    __table_args__ = (UniqueConstraint('year', 'bank', name='_year_bank_uc'),)