import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'

// รองรับ: FR-BKG-01, FR-BKG-06
const formatDateInput = (date) => date.toISOString().slice(0, 10)

const defaultSlots = [
  { id: 1, slot_date: '2026-09-23', start_time: '09:00', remaining: 3, package_code: 'basic' },
  { id: 2, slot_date: '2026-09-23', start_time: '10:00', remaining: 1, package_code: 'basic' },
  { id: 3, slot_date: '2026-09-23', start_time: '13:00', remaining: 2, package_code: 'standard' },
]

export default function SlotPicker() {
  const [packageCode, setPackageCode] = useState('basic')
  const [dateFrom, setDateFrom] = useState(() => formatDateInput(new Date()))
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadSlots = async () => {
      setLoading(true)
      setError('')

      try {
        const payload = await api.getSlots({ dateFrom, packageCode })
        const safeSlots = Array.isArray(payload) ? payload : payload.slots ?? defaultSlots
        if (active) {
          setSlots(safeSlots)
        }
      } catch (err) {
        if (active) {
          setSlots(defaultSlots.filter((slot) => slot.package_code === packageCode))
          setError('ไม่สามารถโหลดช่วงเวลาได้ชั่วคราว กรุณาลองใหม่')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSlots()
    return () => {
      active = false
    }
  }, [dateFrom, packageCode])

  const slotSummary = useMemo(
    () =>
      slots.map((slot) => ({
        ...slot,
        label: `${slot.start_time} • เหลือ ${slot.remaining} ที่`,
      })),
    [slots],
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">เลือกแพ็กเกจ</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">เลือกวันและช่วงเวลาตรวจ</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600" htmlFor="packageCode">
            แพ็กเกจ
          </label>
          <select
            id="packageCode"
            value={packageCode}
            onChange={(event) => setPackageCode(event.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="basic">พื้นฐาน</option>
            <option value="standard">มาตรฐาน</option>
            <option value="premium">พรีเมียม</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="dateFrom">
          เริ่มต้นจากวันที่
        </label>
        <input
          id="dateFrom"
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">กำลังโหลดช่วงเวลาที่ว่าง...</p>
      ) : error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{error}</p>
      ) : (
        <div className="grid gap-3">
          {slotSummary.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-slate-500">
              ไม่มีช่วงเวลาว่างสำหรับแพ็กเกจนี้ในวันที่เลือก
            </p>
          ) : (
            slotSummary.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-left transition hover:border-teal-400 hover:bg-teal-100"
              >
                <span>
                  <span className="block text-lg font-semibold text-slate-800">{slot.start_time}</span>
                  <span className="text-sm text-slate-600">{slot.slot_date}</span>
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-teal-700">
                  เหลือ {slot.remaining} ที่
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </section>
  )
}
