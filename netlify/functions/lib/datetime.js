// Naive wall-clock datetime helpers. Strings are "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM".
// All math goes through Date.UTC to avoid any local-timezone drift.

function parts(s) {
  const [date, time] = s.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time ? time.split(':').map(Number) : [0, 0]
  return { y, m, d, hh, mm }
}

function toMs(s) {
  const { y, m, d, hh, mm } = parts(s)
  return Date.UTC(y, m - 1, d, hh, mm)
}

function pad(n) { return String(n).padStart(2, '0') }

function fromMs(ms, dateOnly = false) {
  const dte = new Date(ms)
  const base = `${dte.getUTCFullYear()}-${pad(dte.getUTCMonth() + 1)}-${pad(dte.getUTCDate())}`
  if (dateOnly) return base
  return `${base}T${pad(dte.getUTCHours())}:${pad(dte.getUTCMinutes())}`
}

function isDateOnly(s) { return !s.includes('T') }

function addDays(s, n) { return fromMs(toMs(s) + n * 86400000, isDateOnly(s)) }
function addWeeks(s, n) { return addDays(s, n * 7) }

function addMonths(s, n) {
  const { y, m, d, hh, mm } = parts(s)
  const total = (y * 12 + (m - 1)) + n
  const ny = Math.floor(total / 12)
  const nm = total % 12
  const lastDay = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate()
  const nd = Math.min(d, lastDay)
  return fromMs(Date.UTC(ny, nm, nd, hh, mm), isDateOnly(s))
}

function cmp(a, b) { return toMs(a) - toMs(b) }

module.exports = { toMs, fromMs, addDays, addWeeks, addMonths, cmp, isDateOnly }
