import styles from './Calendar.module.css'
import { monthMatrix } from './datetime'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MonthView({ year, month, today, events, onOpenEvent, onNewOn }) {
  const cells = monthMatrix(year, month)
  const byDate = {}
  for (const ev of events) {
    const d = ev.start.slice(0, 10)
    ;(byDate[d] ||= []).push(ev)
  }
  return (
    <div>
      <div className={styles.monthGrid}>
        {DOW.map((d) => <div key={d} className={styles.dowHead}>{d}</div>)}
      </div>
      <div className={styles.monthGrid}>
        {cells.map((c) => (
          <div key={c.date} data-date={c.date}
            className={`${styles.cell} ${c.inMonth ? '' : styles.cellOut} ${c.date === today ? styles.cellToday : ''}`}
            onClick={() => onNewOn(c.date)}>
            <div className={styles.cellNum}>{c.day}</div>
            {(byDate[c.date] || []).map((ev) => (
              <button key={ev.occurrenceId} className={styles.chip}
                onClick={(e) => { e.stopPropagation(); onOpenEvent(ev) }}>{ev.title}</button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
