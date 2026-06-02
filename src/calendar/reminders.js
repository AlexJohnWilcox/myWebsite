// Naive string -> ms (UTC-based, drift-free). Mirrors the backend convention.
export function occurrenceMs(naive) {
  const [date, time] = naive.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time ? time.split(':').map(Number) : [0, 0]
  return Date.UTC(y, m - 1, d, hh, mm)
}

export function reminderKey(occurrenceId, offset) { return `${occurrenceId}|${offset}` }

// Returns reminders whose fire-time (start - offset) has arrived within the
// current 1-minute polling window, the start has not yet passed, and which
// have not already fired.
// A reminder fires when: start - offset*60s <= now <= start - (offset-1)*60s
export function computeDue(occurrences, nowMs, firedSet) {
  const due = []
  for (const occ of occurrences) {
    const startMs = occurrenceMs(occ.start)
    if (nowMs >= startMs) continue
    for (const offset of occ.reminders || []) {
      const fireAt = startMs - offset * 60000
      const windowEnd = startMs - (offset - 1) * 60000
      const key = reminderKey(occ.occurrenceId, offset)
      if (nowMs >= fireAt && nowMs <= windowEnd && !firedSet.has(key))
        due.push({ occurrenceId: occ.occurrenceId, offset, event: occ, key })
    }
  }
  return due
}
