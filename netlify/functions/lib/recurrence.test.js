const { expandEvents } = require('./recurrence')

const oneOff = { id: 'a', title: 'One', start: '2026-06-10T09:00', end: '2026-06-10T10:00', recurrence: null }
const weekly = { id: 'b', title: 'Standup', start: '2026-06-01T09:00', end: '2026-06-01T09:15', recurrence: { freq: 'weekly', interval: 1, until: null } }

describe('expandEvents', () => {
  it('includes a one-off event when it overlaps the range', () => {
    const out = expandEvents([oneOff], '2026-06-01T00:00', '2026-06-30T23:59')
    expect(out).toHaveLength(1)
    expect(out[0].occurrenceId).toBe('a@2026-06-10T09:00')
  })

  it('excludes a one-off event outside the range', () => {
    expect(expandEvents([oneOff], '2026-07-01T00:00', '2026-07-31T23:59')).toHaveLength(0)
  })

  it('expands a weekly event into each occurrence in range', () => {
    const out = expandEvents([weekly], '2026-06-01T00:00', '2026-06-30T23:59')
    expect(out.map(o => o.start)).toEqual([
      '2026-06-01T09:00', '2026-06-08T09:00', '2026-06-15T09:00', '2026-06-22T09:00', '2026-06-29T09:00',
    ])
  })

  it('preserves duration on each occurrence', () => {
    const out = expandEvents([weekly], '2026-06-01T00:00', '2026-06-07T23:59')
    expect(out[0].end).toBe('2026-06-01T09:15')
  })

  it('respects the until bound', () => {
    const bounded = { ...weekly, recurrence: { freq: 'weekly', interval: 1, until: '2026-06-15' } }
    const out = expandEvents([bounded], '2026-06-01T00:00', '2026-06-30T23:59')
    expect(out.map(o => o.start)).toEqual(['2026-06-01T09:00', '2026-06-08T09:00', '2026-06-15T09:00'])
  })

  it('gives every occurrence a unique occurrenceId but shares the series id', () => {
    const out = expandEvents([weekly], '2026-06-01T00:00', '2026-06-15T23:59')
    expect(out.every(o => o.id === 'b')).toBe(true)
    expect(new Set(out.map(o => o.occurrenceId)).size).toBe(out.length)
  })

  it('anchors monthly recurrence to the original day, not the clamped one', () => {
    const m = { id: 'm', title: 'Rent', start: '2026-01-31T09:00', end: '2026-01-31T09:30', recurrence: { freq: 'monthly', interval: 1, until: null } }
    const out = expandEvents([m], '2026-01-01T00:00', '2026-05-31T23:59')
    expect(out.map(o => o.start)).toEqual([
      '2026-01-31T09:00', '2026-02-28T09:00', '2026-03-31T09:00', '2026-04-30T09:00', '2026-05-31T09:00',
    ])
  })

  it('includes a recurring occurrence that starts before the range but overlaps it', () => {
    const overnight = { id: 'n', title: 'Night', start: '2026-06-01T23:00', end: '2026-06-02T01:00', recurrence: { freq: 'weekly', interval: 1, until: null } }
    const out = expandEvents([overnight], '2026-06-02T00:00', '2026-06-02T12:00')
    expect(out.map(o => o.start)).toEqual(['2026-06-01T23:00'])
  })
})
