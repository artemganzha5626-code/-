"""Настройка логирования для всего приложения.

Используем стандартный logging (не print), единый формат.
"""

from __future__ import annotations

import logging
import sys


def setup_logging(level: str = "INFO") -> None:
    """Инициализировать корневой логгер.

    :param level: уровень логирования (DEBUG/INFO/WARNING/ERROR).
    """
    logging.basicConfig(
        level=getattr(logging, level, logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout,
    )
    # Приглушаем слишком болтливые библиотеки
    logging.getLogger("aiogram.event").setLevel(logging.WARNING)
    logging.getLogger("aiosqlite").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Получить именованный логгер модуля."""
    return logging.getLogger(name)
