from functools import lru_cache
from os import getenv


class Settings:
    port = int(getenv("PORT", "3004"))
    jwt_secret = getenv("JWT_SECRET", "change-me-in-production")
    item_service_url = getenv("ITEM_SERVICE_URL", "http://localhost:3002").rstrip("/")
    db_host = getenv("DB_HOST", "localhost")
    db_port = int(getenv("DB_PORT", "3306"))
    db_name = getenv("DB_NAME", "stock_db")
    db_user = getenv("DB_USER", "stock_user")
    db_password = getenv("DB_PASSWORD", "stock_pass")

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
