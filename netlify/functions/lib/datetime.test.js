const dt = require('./datetime')

describe('datetime', () => {
  it('parses a naive datetime to a UTC instant', () => {
    const ms = dt.toMs('2026-06-02T09:00')
    expect(ms).toBe(Date.UTC(2026, 5, 2, 9, 0))
  })

  it('parses a naive date (all-day) at midnight', () => {
    expect(dt.toMs('2026-06-02')).toBe(Date.UTC(2026, 5, 2, 0, 0))
  })

  it('formats a UTC instant back to a naive datetime string', () => {
    expect(dt.fromMs(Date.UTC(2026, 5, 2, 9, 5))).toBe('2026-06-02T09:05')
  })

  it('adds days without timezone drift', () => {
    expect(dt.addDays('2026-06-02T09:00', 3)).toBe('2026-06-05T09:00')
  })

  it('adds weeks', () => {
    expect(dt.addWeeks('2026-06-02T09:00', 2)).toBe('2026-06-16T09:00')
  })

  it('adds months and clamps overflowing day-of-month', () => {
    expect(dt.addMonths('2026-01-31T09:00', 1)).toBe('2026-02-28T09:00')
  })

  it('compares two naive strings chronologically', () => {
    expect(dt.cmp('2026-06-02T09:00', '2026-06-02T10:00')).toBeLessThan(0)
    expect(dt.cmp('2026-06-02T10:00', '2026-06-02T10:00')).toBe(0)
  })
})
