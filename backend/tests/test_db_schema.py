from sqlalchemy import create_engine, inspect

from app.db.models import Base
from app.db.session import get_engine, init_db


def test_db_schema_creates_required_tables_and_fields():
    engine = create_engine("sqlite:///:memory:")

    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    assert "slots" in tables
    assert "bookings" in tables
    assert "audit_logs" in tables 

    slots_columns = {col["name"] for col in inspector.get_columns("slots")}
    bookings_columns = {col["name"] for col in inspector.get_columns("bookings")}
    audit_columns = {col["name"] for col in inspector.get_columns("audit_logs")}

    assert {"id", "slot_date", "start_time", "package_code", "capacity", "remaining"}.issubset(slots_columns)
    assert {"id", "hn", "slot_id", "booking_date", "queue_no", "status", "created_at"}.issubset(bookings_columns)
    assert {"id", "actor_id", "action", "hn", "accessed_at"}.issubset(audit_columns)
    assert "national_id" not in bookings_columns

    assert get_engine() is not None
    init_db()
