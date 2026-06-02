import styles from './Calendar.module.css'
import { weekDates, fmtTime } from './datetime'

const HOURS = Array.from({ length: 24 }, (_, h) => h)

export function WeekView({ anchorDate, events, onOpenEvent }) {
  const days = weekDates(anchorDate)
  const byDate = {}
  for (const ev of events) { (byDate[ev.start.slice(0, 10)] ||= []).push(ev) }
  return (
    <div className={styles.timeGrid}>
      <div className={styles.timeCol}>
        <div className={styles.dayColHead}> </div>
        {HOURS.map((h) => <div key={h} className={styles.hourRow}>{h}:00</div>)}
      </div>
      <div className={styles.dayCols} style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
        {days.map((d) => (
          <div key={d}>
            <div className={styles.dayColHead}>{d.slice(5)}</div>
            {(byDate[d] || []).map((ev) => (
              <div key={ev.occurrenceId} className={styles.tEvent} onClick={() => onOpenEvent(ev)}>
                {ev.allDay ? 'all-day' : fmtTime(ev.start)} {ev.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
