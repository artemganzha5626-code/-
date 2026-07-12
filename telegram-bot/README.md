# CRMino_bot — Telegram-бот лидогенерации для интернет-магазина одежды

Production-ready бот на **aiogram 3.x**: собирает лид (имя, контакт, запрос),
квалифицирует коротким диалогом и передаёт менеджеру + в CRM (**Google Sheets**).
Многоязычный (🇷🇺 / 🇺🇦 / 🇬🇧), с FSM, валидацией, rate limiting и
отказоустойчивой синхронизацией.

---

## ✨ Возможности

- **FSM-воронка** (aiogram.fsm): категория → размер → бюджет → имя → контакт →
  комментарий → подтверждение. Бот помнит шаг и не переспрашивает.
- **Мультиязычность** — русский, украинский, английский (переключается кнопкой).
- **Валидация** имени, телефона, email с понятными подсказками.
- **Intent-matching** — если пользователь пишет текстом, бот распознаёт намерение
  по ключевым словам, а не сразу отвечает «не понял».
- **Выход к менеджеру** в любой момент (`/manager` или кнопка): карточка лида
  уходит в чат менеджеров с указанием шага, на котором остановился клиент.
- **Авто-эскалация**: после 3 непониманий подряд бот сам предлагает менеджера.
- **Rate limiting** от спама + троттлинг рассылок под лимит Telegram (30 msg/sec).
- **Отказоустойчивость CRM**: если Google Sheets недоступен — лид сохраняется в
  очередь `pending_sync` и досинхронизируется фоновым воркером. Данные не теряются.
- **Таймауты 3с** на все внешние вызовы + fallback, индикатор «печатает…».
- **Глобальный обработчик ошибок**: никакой «тишины», всегда вежливый ответ.

## 🧱 Стек

Python 3.11+ · aiogram 3.x · SQLAlchemy 2 (async) · aiosqlite (MVP) · Alembic ·
pydantic-settings · gspread + google-auth · Docker.

## 📂 Структура

```
telegram-bot/
├── bot/
│   ├── main.py            # точка входа: сборка бота, middleware, воркеры
│   ├── config.py          # настройки из .env (pydantic-settings)
│   ├── logger.py          # логирование
│   ├── states/            # FSM-состояния воронки
│   ├── keyboards/         # inline/reply клавиатуры + callback-константы
│   ├── handlers/          # common, lead (воронка), manager, faq, errors, ui
│   ├── middlewares/       # context (сессия БД + язык), throttling
│   ├── services/          # crm (Sheets), leads (БД), sync, notifier, intent
│   ├── models/            # ORM: User, Lead, PendingSync + движок БД
│   ├── locales/           # ru / uk / en + переводчик i18n
│   └── utils/             # валидаторы
├── alembic/               # миграции БД
├── Dockerfile · docker-compose.yml
├── requirements.txt · .env.example
└── TESTING_CHECKLIST.md   # ручной чеклист перед сдачей
```

---

## 🚀 Быстрый старт (локально)

### 1. Получить токен бота у @BotFather

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram.
2. `/newbot` → задайте имя и username (`CRMino_bot`).
3. Скопируйте **токен** вида `123456789:AAaBbCc...`.

### 2. Узнать `MANAGER_CHAT_ID`

Чат/группа, куда падают лиды:
- Создайте группу менеджеров, добавьте туда бота.
- Напишите в группе любое сообщение и посмотрите `chat.id` (например, через
  [@getmyid_bot](https://t.me/getmyid_bot) или логи бота). У групп ID
  отрицательный, например `-1001234567890`.
- Для личных сообщений менеджеру — используйте его user id (положительный).

### 3. Настроить окружение

```bash
cd telegram-bot
cp .env.example .env
# отредактируйте .env: BOT_TOKEN, MANAGER_CHAT_ID (Google Sheets — опционально)

python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Запуск

```bash
python -m bot.main
```

Таблицы SQLite создадутся автоматически (файл `data/bot.db`). Бот начнёт
long polling. Откройте бота в Telegram и нажмите `/start`.

> Без настроенного Google Sheets бот полностью работает: лиды сохраняются в БД
> и уходят менеджеру. Запись в таблицу включается кредами (шаг ниже).

---

## 📊 Подключение Google Sheets (CRM)

1. В [Google Cloud Console](https://console.cloud.google.com/) создайте проект,
   включите **Google Sheets API** и **Google Drive API**.
2. Создайте **Service Account**, скачайте JSON-ключ.
3. Положите ключ в `telegram-bot/credentials/google-service-account.json`.
4. Создайте Google-таблицу, скопируйте её **ID** из URL
   (`docs.google.com/spreadsheets/d/`**`ЭТОТ_ID`**`/edit`).
5. **Дайте сервис-аккаунту доступ** к таблице: откройте «Настройки доступа» и
   добавьте email сервис-аккаунта (из JSON, поле `client_email`) как редактора.
6. Заполните в `.env`:
   ```
   GOOGLE_CREDENTIALS_FILE=./credentials/google-service-account.json
   GOOGLE_SHEET_ID=<ID таблицы>
   GOOGLE_SHEET_WORKSHEET=Leads
   ```

Лист `Leads` и строка заголовков создадутся автоматически при первом лиде.

---

## 🐳 Деплой через Docker (Railway / VPS)

```bash
cd telegram-bot
cp .env.example .env        # заполнить значения
docker compose up -d --build
docker compose logs -f bot  # смотреть логи
```

- SQLite-файл персистится в `./data` (volume), креды Google — в `./credentials`.
- Перезапуск при падении — `restart: unless-stopped`.

**Railway:** подключите репозиторий, укажите корень `telegram-bot/`, задайте
переменные окружения из `.env.example` в настройках проекта. Railway соберёт
`Dockerfile` автоматически.

---

## 🗄 Миграции (Alembic)

Для MVP схема создаётся автоматически на старте (`init_models`). Когда перейдёте
на PostgreSQL или начнёте менять схему — используйте Alembic:

```bash
# накатить существующие миграции
alembic upgrade head

# создать новую миграцию после правки моделей
alembic revision --autogenerate -m "описание изменения"
alembic upgrade head
```

Переход на PostgreSQL: поменяйте `DATABASE_URL` на
`postgresql+asyncpg://user:pass@host:5432/db`, раскомментируйте `asyncpg` в
`requirements.txt` и сервис `db` в `docker-compose.yml`.

---

## 🧪 Тесты

```bash
pip install -r requirements-dev.txt
pytest
```

79 тестов (pytest + pytest-asyncio): валидаторы, intent-matching, i18n
(в т.ч. паритет ключей ru/uk/en), слой БД, CRM-фолбэк, фоновая синхронизация
и **интеграционные прогоны диалога** через реальный диспетчер с mock-ботом
(полная воронка, переключение языка, 3 непонимания → менеджер, хендофф,
валидация, навигация «назад», сброс по `/start`). Сеть и Telegram API не
требуются — бот подменяется заглушкой.

## 🔧 Переменные окружения

| Переменная | Обязательна | Описание |
|---|---|---|
| `BOT_TOKEN` | ✅ | Токен от @BotFather |
| `MANAGER_CHAT_ID` | ✅ | Чат/группа менеджеров для карточек лидов |
| `MANAGER_RESPONSE_MINUTES` | — | Обещанное время ответа (по умолч. 15) |
| `DATABASE_URL` | — | По умолчанию SQLite; для Postgres — `postgresql+asyncpg://…` |
| `GOOGLE_CREDENTIALS_FILE` | — | Путь к JSON сервис-аккаунта |
| `GOOGLE_SHEET_ID` | — | ID Google-таблицы |
| `GOOGLE_SHEET_WORKSHEET` | — | Имя листа (по умолч. `Leads`) |
| `EXTERNAL_TIMEOUT` | — | Таймаут внешних вызовов, сек (по умолч. 3) |
| `SYNC_INTERVAL` | — | Период досинхронизации очереди, сек (по умолч. 60) |
| `THROTTLE_RATE` | — | Анти-спам интервал, сек (по умолч. 0.5) |
| `LOG_LEVEL` | — | INFO / DEBUG / WARNING |

---

## 🧭 Карта диалога

`/start` → выбор языка → главное меню → воронка заявки (категория → размер →
бюджет → имя → контакт → комментарий → подтверждение → готово) с ветками
«FAQ», «Сменить язык» и «Связаться с менеджером» из любой точки.
Полная версия — в описании проекта и `TESTING_CHECKLIST.md`.

## 🛑 Команды

- `/start` — запустить / начать заново (сброс FSM)
- `/menu` — главное меню
- `/manager` — связаться с менеджером
- `/faq` — частые вопросы
