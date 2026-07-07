import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { EventEditor } from './EventEditor'

const base = { title: '', location: '', allDay: false, start: '2026-06-02T09:00', end: '2026-06-02T10:00', notes: '', recurrence: null, reminders: [] }

describe('EventEditor', () => {
  it('saves the edited title and current fields', () => {
    const onSave = vi.fn()
    render(<EventEditor initial={base} onSave={onSave} onCancel={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Dentist' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Dentist', start: '2026-06-02T09:00' }))
  })

  it('toggles all-day and switches start to a date', () => {
    const onSave = vi.fn()
    render(<EventEditor initial={base} onSave={onSave} onCancel={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByLabelText(/all day/i))
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Holiday' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ allDay: true, start: '2026-06-02' }))
  })

  it('shows Delete only when editing an existing event', () => {
    const { rerender } = render(<EventEditor initial={base} onSave={vi.fn()} onCancel={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull()
    rerender(<EventEditor initial={{ ...base, id: 'x' }} onSave={vi.fn()} onCancel={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})

describe('EventEditor start/end coupling', () => {
  const base = { title: 'x', location: '', allDay: false, start: '2026-07-08T09:00', end: '2026-07-08T10:00', notes: '', recurrence: null, reminders: [] }

  it('sets the end to one hour after a newly picked start', () => {
    const onSave = vi.fn()
    render(<EventEditor initial={base} onSave={onSave} onCancel={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('2026-07-08 · 9:00 AM')) // open start picker
    fireEvent.click(screen.getAllByText('8')[0]) // pick July 8 in the day grid (a trailing Aug 8 cell also shows '8')
    fireEvent.click(screen.getByText('2 PM'))
    fireEvent.click(screen.getByText(':30'))
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ start: '2026-07-08T14:30', end: '2026-07-08T15:30' }))
  })
})
