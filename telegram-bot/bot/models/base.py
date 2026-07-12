"""Базовый класс для всех ORM-моделей."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    """Текущее время в UTC (timezone-aware)."""
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    """Общий базовый класс. Добавляет created_at ко всем таблицам."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
