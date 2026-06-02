import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { MonthView } from './MonthView'

const events = [{ occurrenceId: 'a@1', id: 'a', title: 'Dentist', start: '2026-06-10T09:00', end: '2026-06-10T10:00' }]

describe('MonthView', () => {
  it('renders an event chip on its day and opens it on click', () => {
    const onOpen = vi.fn()
    render(<MonthView year={2026} month={6} today="2026-06-01" events={events} onOpenEvent={onOpen} onNewOn={vi.fn()} />)
    const chip = screen.getByText('Dentist')
    expect(chip).toBeInTheDocument()
    fireEvent.click(chip)
    expect(onOpen).toHaveBeenCalledWith(events[0])
  })

  it('calls onNewOn with the date when an empty cell is clicked', () => {
    const onNewOn = vi.fn()
    render(<MonthView year={2026} month={6} today="2026-06-01" events={[]} onOpenEvent={vi.fn()} onNewOn={onNewOn} />)
    fireEvent.click(screen.getByText('15').closest('[data-date]'))
    expect(onNewOn).toHaveBeenCalledWith('2026-06-15')
  })
})
