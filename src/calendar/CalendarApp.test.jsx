import { toEditable } from './CalendarApp'

describe('toEditable', () => {
  it('edits a recurring occurrence from its series anchor, not the clicked date', () => {
    const occ = {
      id: 'b', occurrenceId: 'b@2026-06-15T09:00', title: 'Standup',
      start: '2026-06-15T09:00', end: '2026-06-15T09:15',
      seriesStart: '2026-06-01T09:00', seriesEnd: '2026-06-01T09:15',
      recurrence: { freq: 'weekly', interval: 1, until: null },
    }
    const edit = toEditable(occ)
    expect(edit.start).toBe('2026-06-01T09:00') // anchor, NOT the clicked 06-15
    expect(edit.end).toBe('2026-06-01T09:15')
  })

  it('leaves a one-off event unchanged', () => {
    const occ = { id: 'a', title: 'X', start: '2026-06-10T09:00', end: '2026-06-10T10:00', recurrence: null }
    expect(toEditable(occ)).toBe(occ)
  })
})
