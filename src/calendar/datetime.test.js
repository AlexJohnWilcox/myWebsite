import * as dt from './datetime'

describe('client datetime', () => {
  it('builds a 6x7 month matrix starting on Sunday', () => {
    const cells = dt.monthMatrix(2026, 6) // June 2026
    expect(cells).toHaveLength(42)
    expect(cells[0].date).toBe('2026-05-31') // grid starts on the Sunday before
    expect(cells.find(c => c.date === '2026-06-01').inMonth).toBe(true)
    expect(cells[0].inMonth).toBe(false)
  })

  it('returns the 7 dates of the week containing a date', () => {
    const week = dt.weekDates('2026-06-03') // a Wednesday
    expect(week).toEqual(['2026-05-31', '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06'])
  })

  it('formats a time for display from a naive string', () => {
    expect(dt.fmtTime('2026-06-02T09:05')).toBe('9:05 AM')
    expect(dt.fmtTime('2026-06-02T13:00')).toBe('1:00 PM')
  })

  it('formats a month-year heading', () => {
    expect(dt.fmtMonthYear(2026, 6)).toBe('June 2026')
  })
})
