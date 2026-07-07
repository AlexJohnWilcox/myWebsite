const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const pad = (n) => String(n).padStart(2, '0')

export function ymd(y, m, d) { return `${y}-${pad(m)}-${pad(d)}` }

// Day-of-week (0=Sun) for a naive date, computed in UTC to avoid drift.
export function dow(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function addDaysDate(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d) + n * 86400000
  const dte = new Date(t)
  return ymd(dte.getUTCFullYear(), dte.getUTCMonth() + 1, dte.getUTCDate())
}

export function monthMatrix(year, month) {
  const first = ymd(year, month, 1)
  const start = addDaysDate(first, -dow(first)) // back up to Sunday
  const cells = []
  for (let i = 0; i < 42; i++) {
    const date = addDaysDate(start, i)
    cells.push({ date, inMonth: date.slice(0, 7) === `${year}-${pad(month)}`, day: Number(date.slice(8, 10)) })
  }
  return cells
}

export function weekDates(dateStr) {
  const start = addDaysDate(dateStr, -dow(dateStr))
  return Array.from({ length: 7 }, (_, i) => addDaysDate(start, i))
}

export function fmtTime(naive) {
  const [, time] = naive.split('T')
  let [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${pad(m)} ${ampm}`
}

export function fmtMonthYear(year, month) { return `${MONTHS[month - 1]} ${year}` }

// Naive datetime ("YYYY-MM-DD" or "YYYY-MM-DDTHH:MM") <-> UTC ms, for duration math.
export function naiveToMs(naive) {
  const [date, time = '00:00'] = naive.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  return Date.UTC(y, m - 1, d, h, min)
}

export function msToNaive(ms, allDay) {
  const t = new Date(ms)
  const date = ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())
  return allDay ? date : `${date}T${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`
}
