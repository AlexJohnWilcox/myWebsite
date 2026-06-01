const dt = require('./datetime')

const FREQS = new Set(['daily', 'weekly', 'monthly'])
const NAIVE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/

function validateEvent(input) {
  const errors = []
  const i = input || {}

  const title = typeof i.title === 'string' ? i.title.trim() : ''
  if (!title) errors.push('title is required')

  const start = i.start
  const end = i.end
  if (!NAIVE.test(start || '')) errors.push('start is invalid')
  if (!NAIVE.test(end || '')) errors.push('end is invalid')
  if (NAIVE.test(start || '') && NAIVE.test(end || '') && dt.cmp(end, start) < 0) {
    errors.push('end must be on or after start')
  }

  let recurrence = null
  if (i.recurrence) {
    if (!FREQS.has(i.recurrence.freq)) errors.push('invalid recurrence freq')
    const interval = Number(i.recurrence.interval)
    if (!Number.isInteger(interval) || interval < 1) errors.push('recurrence interval must be a positive integer')
    const until = i.recurrence.until || null
    if (until && !NAIVE.test(until)) errors.push('recurrence until is invalid')
    if (errors.length === 0) recurrence = { freq: i.recurrence.freq, interval, until }
  }

  let reminders = []
  if (i.reminders != null) {
    if (!Array.isArray(i.reminders) || !i.reminders.every((n) => Number.isInteger(n) && n >= 0)) {
      errors.push('reminders must be non-negative integers')
    } else {
      reminders = i.reminders
    }
  }

  if (errors.length) return { ok: false, errors }

  return {
    ok: true,
    value: {
      title,
      location: typeof i.location === 'string' && i.location.trim() ? i.location.trim() : null,
      allDay: i.allDay === true,
      start,
      end,
      notes: typeof i.notes === 'string' && i.notes.trim() ? i.notes.trim() : null,
      recurrence,
      reminders,
    },
  }
}

module.exports = { validateEvent }
