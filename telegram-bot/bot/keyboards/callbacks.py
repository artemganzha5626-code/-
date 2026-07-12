"""Единые константы callback_data.

Держим строки в одном месте, чтобы клавиатуры и хендлеры не расходились.
Формат: "<prefix>:<value>".
"""

from __future__ import annotations

# Языки
LANG_PREFIX = "lang"          # lang:ru | lang:uk | lang:en

# Главное меню
MENU_LEAD = "menu:lead"
MENU_FAQ = "menu:faq"
MENU_MANAGER = "menu:manager"
MENU_LANG = "menu:lang"

# Навигация (доступна на шагах воронки)
NAV_BACK = "nav:back"
NAV_MENU = "nav:menu"
NAV_MANAGER = "nav:manager"

# Воронка
CAT_PREFIX = "cat"            # cat:women ... cat:other
SIZE_PREFIX = "size"          # size:S ... size:own | size:skip
BUDGET_PREFIX = "budget"      # budget:lt1000 ... | budget:skip
COMMENT_SKIP = "comment:skip"

# Подтверждение
CONFIRM_SEND = "confirm:send"
CONFIRM_EDIT = "confirm:edit"
