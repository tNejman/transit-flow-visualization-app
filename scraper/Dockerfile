FROM python:3.12-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/root/.cargo/bin:/root/.local/bin:/app/.venv/bin:$PATH"

WORKDIR /app

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

COPY scraper/requirements.txt ./scraper/

RUN uv venv .venv --python 3.12 && \
    uv pip install -r scraper/requirements.txt && \
    uv pip install curl_cffi && \
    uv pip install pymysql

RUN playwright install --with-deps

COPY scraper/DBConnector.py ./scraper/DBConnector.py
COPY scraper/Exceptions.py ./scraper/Exceptions.py
COPY scraper/Objects.py ./scraper/Objects.py
COPY scraper/Scraper.py ./scraper/Scraper.py
COPY scraper/Timer.py ./scraper/Timer.py
COPY .env .env

CMD ["python", "scraper/Scraper.py"]