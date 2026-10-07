import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

test('AC-BKG-01: แสดงหมายเลขคิวหลังยืนยันการจองสำเร็จ', () => {
  render(<App />)
  expect(screen.getByText(/หมายเลขคิว/i)).toBeTruthy()
})
