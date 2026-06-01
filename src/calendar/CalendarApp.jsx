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

export function CalendarApp() {
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(todayStr()) // anchor date
  const [events, setEvents] = useState([])
  const [editing, setEditing] = useState(null) // event object or null
  const today = todayStr()
  const fired = useRef(new Set())

  const [year, month] = [Number(cursor.slice(0, 4)), Number(cursor.slice(5, 7))]

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
    const { events } = await api.list(from, to)
    setEvents(events)
  }, [rangeFor])

  useEffect(() => { reload() }, [reload])

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

  async function handleSave(ev) {
    if (ev.id) await api.update(ev); else await api.create(ev)
    setEditing(null)
    reload()
  }
  async function handleDelete(id) { await api.remove(id); setEditing(null); reload() }

  function newOn(date) {
    setEditing({ title: '', location: '', allDay: false, start: `${date}T09:00`, end: `${date}T10:00`, notes: '', recurrence: null, reminders: [] })
  }

  return (
    <div className={styles.page}>
      <Toolbar heading={heading} view={view} onView={setView}
        onPrev={() => shift(-1)} onNext={() => shift(1)} onToday={() => setCursor(today)}
        onNew={() => newOn(today)} />

      {view === 'month' && <MonthView year={year} month={month} today={today} events={events} onOpenEvent={setEditing} onNewOn={newOn} />}
      {view === 'week' && <WeekView anchorDate={cursor} events={events} onOpenEvent={setEditing} />}
      {view === 'day' && <DayView date={cursor} events={events} onOpenEvent={setEditing} />}

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
