const dt = require('./datetime')

const MAX_OCCURRENCES = 1000

// The k-th occurrence start, always measured from the original anchor (ev.start)
// so monthly clamping does not compound (Jan 31 -> Feb 28 -> Mar 31, not -> Mar 28).
function nthStart(ev, k) {
  const { freq, interval } = ev.recurrence
  const step = Math.max(1, interval || 1) * k
  if (freq === 'daily') return dt.addDays(ev.start, step)
  if (freq === 'weekly') return dt.addWeeks(ev.start, step)
  if (freq === 'monthly') return dt.addMonths(ev.start, step)
  throw new Error(`unknown freq: ${freq}`)
}

function occurrence(ev, start) {
  const duration = dt.toMs(ev.end) - dt.toMs(ev.start)
  const end = dt.fromMs(dt.toMs(start) + duration, dt.isDateOnly(ev.start))
  // Carry the original series anchor so a whole-series edit can preserve it
  // instead of shifting the series to the edited occurrence's date.
  return { ...ev, start, end, occurrenceId: `${ev.id}@${start}`, seriesStart: ev.start, seriesEnd: ev.end }
}

// An occurrence overlaps the window when it starts on/before `to` and ends on/after `from`.
// Same test for one-off and recurring occurrences.
function overlaps(occ, fromNaive, toNaive) {
  return dt.cmp(occ.start, toNaive) <= 0 && dt.cmp(occ.end, fromNaive) >= 0
}

function expandEvents(events, fromNaive, toNaive) {
  const out = []
  for (const ev of events) {
    if (!ev.recurrence) {
      const occ = occurrence(ev, ev.start)
      if (overlaps(occ, fromNaive, toNaive)) out.push(occ)
      continue
    }
    const { until } = ev.recurrence
    for (let k = 0; k < MAX_OCCURRENCES; k++) {
      const start = nthStart(ev, k)
      if (dt.cmp(start, toNaive) > 0) break
      // A date-only `until` is inclusive through the end of that day, so compare
      // only the date portion of the occurrence start against it.
      if (until && dt.cmp(dt.isDateOnly(until) ? start.slice(0, 10) : start, until) > 0) break
      const occ = occurrence(ev, start)
      if (overlaps(occ, fromNaive, toNaive)) out.push(occ)
    }
  }
  out.sort((a, b) => dt.cmp(a.start, b.start))
  return out
}

module.exports = { expandEvents }
