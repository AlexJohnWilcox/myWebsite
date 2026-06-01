import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { DateTimePicker } from './DateTimePicker'

describe('DateTimePicker', () => {
  it('picks a day then a time and emits a naive datetime', () => {
    const onChange = vi.fn()
    render(<DateTimePicker value="2026-06-02T09:00" allDay={false} onChange={onChange} onClose={vi.fn()} />)
    // Step 1: pick day 5
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    // Step 2: time wheel visible — pick hour 10 then minute 30
    fireEvent.click(screen.getByRole('button', { name: '10' }))
    fireEvent.click(screen.getByRole('button', { name: ':30' }))
    expect(onChange).toHaveBeenLastCalledWith('2026-06-05T10:30')
  })

  it('emits a date only when allDay is true (no time step)', () => {
    const onChange = vi.fn()
    render(<DateTimePicker value="2026-06-02" allDay={true} onChange={onChange} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '7' }))
    expect(onChange).toHaveBeenLastCalledWith('2026-06-07')
  })
})
