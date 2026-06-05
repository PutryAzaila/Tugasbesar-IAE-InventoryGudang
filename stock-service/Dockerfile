FROM ghcr.io/astral-sh/uv:python3.12-alpine AS builder

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1
COPY pyproject.toml ./
RUN uv sync --no-dev
COPY app ./app

FROM python:3.12-alpine
WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
COPY --from=builder /app/.venv ./.venv
COPY app ./app
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app
EXPOSE 3004
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3004", "--proxy-headers"]
