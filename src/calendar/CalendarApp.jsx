import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './Calendar.module.css'
import { api } from './api'
import { Toolbar } from './Toolbar'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import { EventEditor } from './EventEditor'
import { monthMatrix, weekDates, fmtMonthYear, addDaysDate } from './datetime'
import { computeDue } from './reminders'

function todayStr() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function nowNaiveMs() {
  const d = new Date()
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes())
}

// A grid click hands back an expanded occurrence whose `start` is the occurrence's
// date. Editing is whole-series, so edit from the series anchor (seriesStart/End) —
// otherwise saving a recurring event would shift the whole series to that date.
export function toEditable(occ) {
  return occ.recurrence && occ.seriesStart
    ? { ...occ, start: occ.seriesStart, end: occ.seriesEnd }
    : occ
}

export function CalendarApp({ onAuthExpired }) {
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(todayStr()) // anchor date
  const [events, setEvents] = useState([])
  const [editing, setEditing] = useState(null) // event object or null
  const [error, setError] = useState('')
  const today = todayStr()
  const fired = useRef(new Set())

  const [year, month] = [Number(cursor.slice(0, 4)), Number(cursor.slice(5, 7))]

  const onError = useCallback((err) => {
    if (err && err.status === 401) onAuthExpired?.()
    else setError(err?.message || 'Something went wrong')
  }, [onAuthExpired])

  const rangeFor = useCallback(() => {
    if (view === 'month') {
      const cells = monthMatrix(year, month)
      return [cells[0].date + 'T00:00', cells[41].date + 'T23:59']
    }
    if (view === 'week') {
      const w = weekDates(cursor)
      return [w[0] + 'T00:00', w[6] + 'T23:59']
    }
    return [cursor + 'T00:00', cursor + 'T23:59']
  }, [view, year, month, cursor])

  const reload = useCallback(async () => {
    const [from, to] = rangeFor()
    try {
      const { events } = await api.list(from, to)
      setEvents(events)
    } catch (err) {
      onError(err)
    }
  }, [rangeFor, onError])

  useEffect(() => { reload() }, [reload])

  // Refetch when the tab regains focus so changes made elsewhere (e.g. the
  // desktop quick-add) show up without a manual refresh.
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) reload() }
    window.addEventListener('focus', onVisible)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onVisible)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [reload])

  // In-app reminders: check once a minute while mounted.
  useEffect(() => {
    function check() {
      const due = computeDue(events, nowNaiveMs(), fired.current)
      for (const d of due) {
        fired.current.add(d.key)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(d.event.title, { body: `in ${d.offset} min` })
        }
      }
    }
    const id = setInterval(check, 60000)
    check()
    return () => clearInterval(id)
  }, [events])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
  }, [])

  function shift(delta) {
    if (view === 'month') {
      let nm = month + delta, ny = year
      if (nm < 1) { nm = 12; ny-- } else if (nm > 12) { nm = 1; ny++ }
      setCursor(`${ny}-${String(nm).padStart(2, '0')}-01`)
    } else {
      setCursor(addDaysDate(cursor, delta * (view === 'week' ? 7 : 1)))
    }
  }

  const heading = view === 'month' ? fmtMonthYear(year, month) : cursor

  // Throws on failure so the editor can keep its input and surface the error.
  async function handleSave(ev) {
    setError('')
    try {
      if (ev.id) await api.update(ev); else await api.create(ev)
      setEditing(null)
      reload()
    } catch (err) {
      onError(err)
      throw err
    }
  }
  async function handleDelete(id) {
    setError('')
    try {
      await api.remove(id)
      setEditing(null)
      reload()
    } catch (err) {
      onError(err)
    }
  }

  function openEvent(occ) { setEditing(toEditable(occ)) }

  function newOn(date) {
    setEditing({ title: '', location: '', allDay: false, start: `${date}T09:00`, end: `${date}T10:00`, notes: '', recurrence: null, reminders: [] })
  }

  return (
    <div className={styles.page}>
      <Toolbar heading={heading} view={view} onView={setView}
        onPrev={() => shift(-1)} onNext={() => shift(1)} onToday={() => setCursor(today)}
        onNew={() => newOn(today)} />

      {error && <p className={styles.errorBanner} role="alert">{error}</p>}

      {view === 'month' && <MonthView year={year} month={month} today={today} events={events} onOpenEvent={openEvent} onNewOn={newOn} />}
      {view === 'week' && <WeekView anchorDate={cursor} events={events} onOpenEvent={openEvent} />}
      {view === 'day' && <DayView date={cursor} events={events} onOpenEvent={openEvent} />}

      {editing && (
        <EventEditor
          key={editing.occurrenceId || editing.id || 'new'}
          initial={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
