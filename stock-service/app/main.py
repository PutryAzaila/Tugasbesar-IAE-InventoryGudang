from fastapi import FastAPI

from app.routes import health, stock

app = FastAPI(title="stock-service", docs_url=None, redoc_url=None)
app.include_router(health.router)
app.include_router(stock.router)
