import styles from './Calendar.module.css'
import { fmtTime, fmtHour } from './datetime'

const HOURS = Array.from({ length: 24 }, (_, h) => h)

export function DayView({ date, events, onOpenEvent }) {
  const todays = events.filter((e) => e.start.slice(0, 10) === date)
  return (
    <div className={styles.timeGrid}>
      <div className={styles.timeCol}>
        <div className={styles.dayColHead}> </div>
        {HOURS.map((h) => <div key={h} className={styles.hourRow}>{fmtHour(h)}</div>)}
      </div>
      <div>
        <div className={styles.dayColHead}>{date}</div>
        {todays.length === 0 && <p style={{ padding: '12px', color: 'var(--ink-mute)' }}>No events.</p>}
        {todays.map((ev) => (
          <div key={ev.occurrenceId} className={styles.tEvent} onClick={() => onOpenEvent(ev)}>
            {ev.allDay ? 'all-day' : fmtTime(ev.start)} {ev.title}
          </div>
        ))}
      </div>
    </div>
  )
}
