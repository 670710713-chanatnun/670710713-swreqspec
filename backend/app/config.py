import os

# รองรับ: CON-TECH-01
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///:memory:")


def get_database_url() -> str:
    return DATABASE_URL
