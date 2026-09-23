import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SlotPicker from '../pages/SlotPicker.jsx'

const fakeSlots = [
  { id: 1, slot_date: '2026-09-23', start_time: '09:00', remaining: 3, package_code: 'basic' },
  { id: 2, slot_date: '2026-09-23', start_time: '10:00', remaining: 1, package_code: 'basic' },
  { id: 3, slot_date: '2026-09-23', start_time: '13:00', remaining: 2, package_code: 'standard' },
]

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    const query = new URL(url, 'http://localhost')
    const packageCode = query.searchParams.get('package_code') ?? 'basic'
    const filtered = fakeSlots.filter((slot) => slot.package_code === packageCode)
    return Promise.resolve({
      json: async () => filtered,
    })
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('AC-BKG-05: แสดงช่วงเวลาและจำนวนที่นั่งคงเหลือตรงตามแพ็กเกจที่เลือก', async () => {
  render(<SlotPicker />)

  await waitFor(() => {
    expect(screen.getByText('เลือกวันและช่วงเวลาตรวจ')).toBeTruthy()
  })

  expect(screen.getByText('09:00')).toBeTruthy()
  expect(screen.getByText('10:00')).toBeTruthy()
  expect(screen.getByText(/เหลือ 3 ที่/i)).toBeTruthy()

  fireEvent.change(screen.getByLabelText('แพ็กเกจ'), { target: { value: 'standard' } })

  await waitFor(() => {
    expect(screen.getByText('13:00')).toBeTruthy()
  })

  expect(screen.queryByText('09:00')).toBeNull()
})
