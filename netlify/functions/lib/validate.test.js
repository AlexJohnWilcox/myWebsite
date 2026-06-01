const { validateEvent } = require('./validate')

const good = {
  title: 'Dentist', location: '42 King St', allDay: false,
  start: '2026-06-02T09:00', end: '2026-06-02T10:00',
  notes: 'card', recurrence: null, reminders: [10, 60],
}

describe('validateEvent', () => {
  it('accepts a well-formed event and normalizes it', () => {
    const r = validateEvent(good)
    expect(r.ok).toBe(true)
    expect(r.value.title).toBe('Dentist')
    expect(r.value.reminders).toEqual([10, 60])
  })

  it('rejects an empty title', () => {
    const r = validateEvent({ ...good, title: '  ' })
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('title is required')
  })

  it('rejects end before start', () => {
    const r = validateEvent({ ...good, start: '2026-06-02T10:00', end: '2026-06-02T09:00' })
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('end must be on or after start')
  })

  it('rejects an unknown recurrence freq', () => {
    const r = validateEvent({ ...good, recurrence: { freq: 'yearly', interval: 1, until: null } })
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('invalid recurrence freq')
  })

  it('defaults missing optional fields', () => {
    const r = validateEvent({ title: 'X', start: '2026-06-02T09:00', end: '2026-06-02T09:30' })
    expect(r.ok).toBe(true)
    expect(r.value.location).toBeNull()
    expect(r.value.notes).toBeNull()
    expect(r.value.recurrence).toBeNull()
    expect(r.value.reminders).toEqual([])
    expect(r.value.allDay).toBe(false)
  })

  it('rejects negative or non-integer reminders', () => {
    const r = validateEvent({ ...good, reminders: [-5] })
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('reminders must be non-negative integers')
  })
})
