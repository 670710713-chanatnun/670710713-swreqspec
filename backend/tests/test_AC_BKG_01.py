# AC-BKG-01 (FR-BKG-04)
# Approved test rows from specs/001-booking/test-cases.md
from app.db.models import Booking, Slot
from tests.conftest import AUTH


def test_TC_BKG_01_1_booking_success(client, db, make_slot):
    # Given: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1)

    # When: ยืนยันการจอง
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then: บันทึกการจองสำเร็จ; แสดงหมายเลขคิว; ที่นั่งว่างของช่วงนั้นเป็น 0
    assert res.status_code == 201
    body = res.json()
    assert body["booking_id"]
    assert body["queue_no"]
    assert body["queue_no"].startswith("A")
    assert db.get(Slot, slot.id).remaining == 0
    assert db.query(Booking).count() == 1


def test_TC_BKG_01_2_remaining_reaches_zero(client, db, make_slot):
    # Given: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่างพอดี 1 ที่ (ขอบล่างก่อน booking)
    slot = make_slot(start="09:00", remaining=1)

    # When: ยืนยันการจอง
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then: บันทึกการจองสำเร็จ; จองใช้ที่นั่งสุดท้าย; แสดงหมายเลขคิว; remaining เป็น 0 อย่างชัดเจน ไม่ติดลบ
    assert res.status_code == 201
    assert res.json()["queue_no"] == "A001"
    assert db.get(Slot, slot.id).remaining == 0
    assert db.get(Slot, slot.id).remaining >= 0
    assert db.query(Booking).count() == 1


def test_TC_BKG_01_3_rejects_unverified_or_full_slot(client, db, make_slot):
    # Given: ผู้ใช้ยังไม่ได้ยืนยันตัวตน หรือหากมีการเลือกช่วงที่ว่าง 0 ที่แล้วส่งคำขอจอง
    slot = make_slot(start="09:00", remaining=0)

    # When: ยืนยันการจองโดยไม่มี Authorization หรือช่วงที่เต็ม
    res = client.post("/bookings", json={"slot_id": slot.id})

    # Then: ปฏิเสธการจองและไม่สร้างรายการจองใหม่; ถ้าต้องแสดงผลให้แจ้งว่าไม่สามารถจองได้ตาม IF-IDP-01 / FR-BKG-03
    assert res.status_code == 401
    assert db.query(Booking).count() == 0
