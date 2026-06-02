import { computeDue, occurrenceMs } from './reminders'

const occ = { occurrenceId: 'b@2026-06-02T09:00', title: 'Standup', start: '2026-06-02T09:00', reminders: [10, 60] }

describe('computeDue', () => {
  it('returns a reminder that is now due and not yet fired', () => {
    const now = occurrenceMs('2026-06-02T08:51') // 9 min before -> 10-min reminder is due
    const due = computeDue([occ], now, new Set())
    expect(due.map(d => d.offset)).toContain(10)
  })

  it('does not return reminders whose time has not arrived', () => {
    const now = occurrenceMs('2026-06-02T07:30') // 90 min before -> neither due
    expect(computeDue([occ], now, new Set())).toHaveLength(0)
  })

  it('skips reminders already fired', () => {
    const now = occurrenceMs('2026-06-02T08:51')
    const fired = new Set(['b@2026-06-02T09:00|10'])
    expect(computeDue([occ], now, fired)).toHaveLength(0)
  })

  it('does not fire after the event start has passed', () => {
    const now = occurrenceMs('2026-06-02T09:30')
    expect(computeDue([occ], now, new Set())).toHaveLength(0)
  })
})
