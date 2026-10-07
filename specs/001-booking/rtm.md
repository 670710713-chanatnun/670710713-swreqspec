# RTM: จองคิวตรวจสุขภาพ (Booking)
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-07 08:40 | test: 6 ผ่าน 1 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-BKG-01 | AC-BKG-05 | T-02 | backend/app/slots/service.py: list_available_slots | backend/tests/test_AC_BKG_05.py: PASSED | ช่องโหว่ |
| FR-BKG-02 | AC-BKG-02 | T-04 | backend/app/booking/service.py: create_booking | ไม่มี test ในโค้ด | ยังไม่ถึง |
| FR-BKG-03 | AC-BKG-03 | T-05, T-11, T-12 | ไม่มี implementation ที่พบ | ไม่มี test | ยังไม่ถึง |
| FR-BKG-04 | AC-BKG-01 | T-03, T-06 | backend/app/booking/service.py: create_booking, next_queue_no; backend/app/booking/router.py: create_booking | backend/tests/test_AC_BKG_01.py: 3 tests PASSED (backend) | ช่องโหว่ |
| FR-BKG-05 | AC-BKG-04 | T-07 | ไม่มี notify queue/logic ที่พบ | ไม่มี test | ยังไม่ถึง |
| FR-BKG-06 | ไม่มี AC | T-10 | backend/app/slots/service.py: list_available_slots (filter package_code) | ไม่มี test สำหรับ AC | ช่องโหว่ |
| NFR-PERF-01 | AC-BKG-05 | T-02 | backend/app/slots/service.py: list_available_slots | backend/tests/test_AC_BKG_05.py: PASSED | ครบ |
| NFR-SEC-01 | ไม่มี AC | ไม่มี task | ไม่มี implementation ที่พบ | ไม่มี test | ยังไม่ถึง |
| NFR-REL-02 | AC-BKG-04 | T-07 | ไม่มี notify queue/logic ที่พบ | ไม่มี test | ยังไม่ถึง |
| NFR-USE-01 | ไม่มี AC | ไม่มี task | ไม่มี implementation ที่พบ | ไม่มี test | ยังไม่ถึง |
| CON-TECH-01 | ไม่มี AC | T-01 | backend/app/config.py: DATABASE_URL; backend/app/db/session.py: engine | backend/tests/test_T01_schema.py: PASSED (schema only) | ช่องโหว่ |
| DOM-PDPA-01 | AC-BKG-06 | T-08 | ไม่มี audit middleware / audit table usage | ไม่มี test | ยังไม่ถึง |
| IF-IDP-01 | AC-BKG-01 | T-03 | backend/app/auth/idp.py: get_verified_hn | backend/tests/test_AC_BKG_01.py::test_TC_BKG_01_3... PASSED | ครบ |
| IF-HIS-01 | ไม่มี AC | T-09 | ไม่มี HIS client / lookup logic ที่พบ | ไม่มี test | ยังไม่ถึง |
| IF-NOT-01 | AC-BKG-04 | T-07 | ไม่มี notify queue / async sender ที่พบ | ไม่มี test | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| backend/app/slots/router.py: GET /slots | FR-BKG-01, FR-BKG-06 | ไม่ครบ | คืนช่วงเวลาที่ว่างแบบรายวัน แต่ใช้ 14 วัน ไม่ใช่ 30 วันตาม spec |
| backend/app/booking/router.py: POST /bookings | FR-BKG-04, IF-IDP-01 | บางส่วน | ยืนยันตัวตนทำได้ แต่ยังไม่แสดงหมายเลขคิวบนหน้าจอ และ queue_no ถูกสร้างจากการเดา Q-02 |
| backend/app/booking/service.py: next_queue_no | FR-BKG-04 | ไม่ตรง | มีการระบุรูปแบบ queue_no เป็น A001 โดยไม่รอคำตอบ Q-02 |
| backend/app/config.py: DATABASE_URL | CON-TECH-01 | ไม่ตรง | default เป็น SQLite แม้ spec บังคับ PostgreSQL ในระบบจริง |
| backend/app/db/models.py: Booking | IF-HIS-01 | ตรง | บันทึกเฉพาะ hn ไม่เก็บ national_id ตาม spec |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | ตัวเลขไม่ตรง spec | backend/app/slots/service.py: DAYS_AHEAD = 14 | FR-BKG-01 | spec ระบุ "ภายใน 30 วันข้างหน้า" แต่โค้ดแสดงเพียง 14 วัน |  |
| F-002 | เดา Q-xx | backend/app/booking/service.py: next_queue_no | FR-BKG-04, Q-02 | โค้ดกำหนดรูปแบบ queue_no เป็น A001 และนับใหม่ทุกวัน โดยไม่รอคำตอบจากเจ้าหน้าที่เวชระเบียน |  |
| F-003 | FR ไม่มี AC | spec.md: FR-BKG-06 | FR-BKG-06 | มี requirement ที่เปลี่ยนแพ็กเกจแล้วคำนวณช่วงว่างใหม่ แต่ไม่มี AC ใด ๆ ใน spec ตรวจความถูกต้อง |  |
| F-004 | ละเมิด Constraint | backend/app/config.py: DATABASE_URL | CON-TECH-01 | default app config ยังเป็น SQLite แม้ spec บังคับ PostgreSQL ในระบบจริง |  |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| — | ไม่มีข้อค้นพบที่ทีมยืนยันแก้แล้ว | — |
