# Лёгкий образ на Python 3.11
FROM python:3.11-slim

# Не создавать .pyc, не буферизовать stdout (логи сразу видны)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Сначала зависимости — лучше кешируется при пересборках
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Затем код
COPY . .

# Каталог для файла SQLite (монтируется как volume в compose)
RUN mkdir -p /app/data

# Запуск от непривилегированного пользователя
RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

# Запуск бота
CMD ["python", "-m", "bot.main"]
