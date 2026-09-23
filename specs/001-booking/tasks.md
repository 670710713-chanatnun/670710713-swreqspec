# Feature: จองคิวตรวจสุขภาพ (Booking)
- Spec ID: SPEC-BKG-001
- อ้างอิง plan.md: specs/001-booking/plan.md (plan v1)
- วันที่: 2569-09-23

สรุป: ทำ 12 task, มี 2 task ที่ต้องรอ Open Questions (Q-02)

### T-01 สร้างโครงข้อมูลและ migration ฐานข้อมูล
- รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-01
- ไฟล์ที่แตะ: backend/app/db/models.py, backend/app/db/session.py, backend/app/db/migrations/001_init.py, backend/app/config.py
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง slots, bookings, audit_logs และ session เชื่อม PostgreSQL ได้ตามข้อจำกัดของโครงการ
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 สร้าง API ค้นช่วงเวลาว่างและคำนวณที่นั่งคงเหลือ
- รองรับ: FR-BKG-01, FR-BKG-06, NFR-PERF-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: backend/app/slots/router.py, backend/app/slots/service.py, backend/tests/test_slots.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: GET /slots คืนรายชื่อช่วงเวลาและจำนวนที่นั่งคงเหลือตามแพ็กเกจ ได้ response ภายใน p95 ไม่เกิน 2 วินาที ที่ 200 คนพร้อมกัน
- สถานะ: พร้อมทำ

### T-03 สร้าง API จองคิวพื้นฐานและตัดจำนวนที่นั่ง
- รองรับ: FR-BKG-04, IF-HIS-01
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: backend/app/booking/router.py, backend/app/booking/service.py, backend/tests/test_booking_core.py
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: POST /bookings บันทึกการจอง ตัด remaining ของช่วงเวลา และคืนหมายเลขคิวแบบ placeholder จนกว่าจะมีคำตอบ Q-02
- สถานะ: รอ Q-02

### T-04 ป้องกันการจองซ้ำในวันเดียวกัน
- รองรับ: FR-BKG-02
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/tests/test_booking_duplicate.py
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: เมื่อมีคิวที่ยังไม่ได้ใช้ในวันเดียวกัน การจองใหม่ถูกปฏิเสธ และส่งกลับหมายเลขคิวเดิม
- สถานะ: พร้อมทำ

### T-05 สร้างกลไกแนะนำช่วงว่างเมื่อช่วงที่เลือกเต็ม
- รองรับ: FR-BKG-03
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: backend/app/slots/service.py, backend/app/booking/service.py, backend/tests/test_booking_alternatives.py
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: ถ้าช่วงเวลาที่เลือกเต็ม ระบบคืน 409 พร้อม 3 ตัวเลือกที่ใกล้ที่สุดภายในวันเดียวกันและวันถัดไป และไม่มีการจองซ้อนเกิดขึ้น
- สถานะ: พร้อมทำ

### T-06 สร้างคิวส่งข้อความและการส่งซ้ำ
- รองรับ: FR-BKG-05, IF-NOT-01, NFR-REL-02
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: backend/app/notify/queue.py, backend/app/booking/service.py, backend/tests/test_notification_retry.py
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: การจองยังถูกบันทึกแม้ส่งข้อความไม่สำเร็จ และมีรายการค้างส่งที่ต้องส่งซ้ำภายใน 5 นาที
- สถานะ: พร้อมทำ

### T-07 เพิ่ม audit log ทุกครั้งที่เข้าถึงข้อมูลการจอง
- รองรับ: DOM-PDPA-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: backend/app/audit/middleware.py, backend/app/booking/router.py, backend/tests/test_audit_log.py
- ต้องทำหลัง: T-01, T-03
- เสร็จเมื่อ: ทุก request ที่เข้าถึงข้อมูลการจอง บันทึก actor_id, access time และ hn ลง audit log
- สถานะ: พร้อมทำ

### T-08 ตรวจยืนยันตัวตนและค้น HN จาก HIS
- รองรับ: IF-IDP-01, IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-08
- ไฟล์ที่แตะ: backend/app/auth/idp.py, backend/app/his/client.py, backend/app/booking/router.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: endpoint ที่ต้องการข้อมูลผู้รับบริการตรวจผลยืนยันตัวตนก่อน และค้น HN จาก HIS โดยส่งเลขบัตรไปที่ระบบภายนอก แต่ไม่เก็บเลขบัตรในตาราง bookings
- สถานะ: พร้อมทำ

### T-09 สร้างหน้าเลือกแพ็กเกจและช่วงเวลา
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09
- ไฟล์ที่แตะ: frontend/src/pages/SlotPicker.jsx, frontend/src/App.jsx, frontend/src/api/client.js
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: ผู้ใช้เลือกแพ็กเกจและดูรายการช่วงเวลา พร้อมจำนวนที่นั่งคงเหลือ และเปลี่ยนแพ็กเกจแล้วโหลดช่วงเวลาว่างใหม่ได้
- สถานะ: เสร็จ รอทีมตรวจ

### T-10 สร้างหน้้ายืนยันพร้อมข้อผิดพลาดช่วงเวลาเต็ม
- รองรับ: FR-BKG-03, FR-BKG-04
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: frontend/src/pages/ConfirmBooking.jsx, frontend/src/__tests__/AC-BKG-03.test.jsx
- ต้องทำหลัง: T-05, T-09
- เสร็จเมื่อ: เมื่อ API คืน 409 หน้าแสดงข้อความ “ช่วงเวลาเต็ม” พร้อม 3 ตัวเลือกที่ใกล้ที่สุด และให้ผู้ใช้กดเลือกต่อได้
- สถานะ: พร้อมทำ

### T-11 สร้างหน้าแสดงผลการจองและการแจ้งเตือน
- รองรับ: FR-BKG-04, FR-BKG-05
- ตรวจด้วย: AC-BKG-01, AC-BKG-04
- ไฟล์ที่แตะ: frontend/src/pages/BookingResult.jsx, frontend/src/__tests__/AC-BKG-04.test.jsx
- ต้องทำหลัง: T-03, T-06, T-10
- เสร็จเมื่อ: แสดงหมายเลขคิวบนหน้าจอ แม้ส่งข้อความแจ้งเตือนไม่สำเร็จ และผู้ใช้เห็นผลจองตามสถานะการส่งข้อความ
- สถานะ: รอ Q-02

### T-12 ต่อหน้าจอกับ API จริงและตรวจการบูรณาการ
- รองรับ: FR-BKG-01, FR-BKG-03, FR-BKG-04
- ตรวจด้วย: AC-BKG-03, AC-BKG-05
- ไฟล์ที่แตะ: frontend/src/api/client.js, frontend/src/App.jsx, frontend/src/__tests__/integration.test.jsx
- ต้องทำหลัง: T-02, T-05, T-10
- เสร็จเมื่อ: หน้าเลือกและยืนยันใช้งานกับ API จริงได้ โดยยังคงแสดง error state และตัวเลือกแทนช่วงเวลาเต็มตามสัญญา API
- สถานะ: พร้อมทำ

## ตารางตรวจความครบ

### 1. AC ID | task ที่ตรวจ AC นี้
| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-03, T-11 |
| AC-BKG-02 | T-04 |
| AC-BKG-03 | T-05, T-10, T-12 |
| AC-BKG-04 | T-06, T-11 |
| AC-BKG-05 | T-02, T-12 |
| AC-BKG-06 | T-07 |

### 2. Constraint ID | task ที่ทำให้เป็นจริง
| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01 |
| DOM-PDPA-01 | T-01, T-07 |
| IF-IDP-01 | T-08 |
| IF-HIS-01 | T-08 |
| IF-NOT-01 | T-06 |

## สิ่งที่ยังไม่ทำ
- Q-02 หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง และมีรูปแบบอย่างไร (เช่น A001)? -> ถามเจ้าหน้าที่เวชระเบียน
  - task ที่รอ: T-03, T-11

