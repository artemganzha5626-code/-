"""Модель пользователя Telegram."""

from __future__ import annotations

from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base


class User(Base):
    """Пользователь бота. Храним выбранный язык, чтобы не переспрашивать."""

    __tablename__ = "users"

    # Telegram user id (может превышать int32 → BigInteger)
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=False)
    username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Язык интерфейса: ru / uk / en
    language: Mapped[str] = mapped_column(String(2), default="ru", nullable=False)
