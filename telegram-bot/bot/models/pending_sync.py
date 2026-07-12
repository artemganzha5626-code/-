"""Очередь отложенной синхронизации с CRM.

Если Google Sheets недоступен в момент создания лида — кладём задачу сюда,
фоновый воркер (services/sync.py) досинхронизирует при восстановлении связи.
Так мы не теряем данные клиента.
"""

from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base


class PendingSync(Base):
    """Задача на отправку лида в CRM, ожидающая ретрая."""

    __tablename__ = "pending_sync"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    # Сколько раз пытались отправить (для наблюдаемости и backoff)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_error: Mapped[str | None] = mapped_column(String(500), nullable=True)
