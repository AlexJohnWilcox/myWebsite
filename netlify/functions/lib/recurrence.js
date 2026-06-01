const dt = require('./datetime')

const MAX_OCCURRENCES = 1000

function stepper(freq, interval) {
  if (freq === 'daily') return (s) => dt.addDays(s, interval)
  if (freq === 'weekly') return (s) => dt.addWeeks(s, interval)
  if (freq === 'monthly') return (s) => dt.addMonths(s, interval)
  throw new Error(`unknown freq: ${freq}`)
}

function occurrence(ev, start) {
  const duration = dt.toMs(ev.end) - dt.toMs(ev.start)
  const end = dt.fromMs(dt.toMs(start) + duration, dt.isDateOnly(ev.start))
  return { ...ev, start, end, occurrenceId: `${ev.id}@${start}` }
}

function expandEvents(events, fromNaive, toNaive) {
  const out = []
  for (const ev of events) {
    if (!ev.recurrence) {
      if (dt.cmp(ev.start, toNaive) <= 0 && dt.cmp(ev.end, fromNaive) >= 0) {
        out.push(occurrence(ev, ev.start))
      }
      continue
    }
    const { freq, interval, until } = ev.recurrence
    const next = stepper(freq, Math.max(1, interval || 1))
    let cur = ev.start
    let count = 0
    while (count < MAX_OCCURRENCES) {
      if (dt.cmp(cur, toNaive) > 0) break
      // A date-only `until` is inclusive through the end of that day, so compare
      // only the date portion of the current occurrence against it.
      if (until && dt.cmp(dt.isDateOnly(until) ? cur.slice(0, 10) : cur, until) > 0) break
      if (dt.cmp(cur, fromNaive) >= 0) out.push(occurrence(ev, cur))
      cur = next(cur)
      count++
    }
  }
  out.sort((a, b) => dt.cmp(a.start, b.start))
  return out
}

module.exports = { expandEvents }
