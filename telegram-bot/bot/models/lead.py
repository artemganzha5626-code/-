"""Модель лида — результат прохождения воронки."""

from __future__ import annotations

from sqlalchemy import BigInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base


class Lead(Base):
    """Собранная заявка клиента.

    Поля квалификации (category/size/budget/comment) необязательные —
    пользователь мог их пропустить. Имя и контакт — обязательны.
    """

    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # Кто оставил заявку
    tg_user_id: Mapped[int] = mapped_column(BigInteger, index=True, nullable=False)
    tg_username: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Данные лида
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    contact: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    size: Mapped[str | None] = mapped_column(String(40), nullable=True)
    budget: Mapped[str | None] = mapped_column(String(60), nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Язык, на котором общался клиент
    language: Mapped[str] = mapped_column(String(2), default="ru", nullable=False)

    # Статус синхронизации с CRM: synced / pending
    crm_status: Mapped[str] = mapped_column(
        String(16), default="pending", nullable=False
    )
