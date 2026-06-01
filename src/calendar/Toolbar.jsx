import styles from './Calendar.module.css'

const VIEWS = ['month', 'week', 'day']

export function Toolbar({ heading, view, onView, onPrev, onNext, onToday, onNew }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.navGroup}>
        <button className={styles.iconBtn} onClick={onPrev} aria-label="Previous">‹</button>
        <button className={styles.iconBtn} onClick={onNext} aria-label="Next">›</button>
        <button className={styles.todayBtn} onClick={onToday}>Today</button>
        <h2 className={styles.heading}>{heading}</h2>
      </div>
      <div className={styles.rightGroup}>
        <div className={styles.switcher}>
          {VIEWS.map((v) => (
            <button key={v} className={v === view ? styles.segOn : styles.seg} onClick={() => onView(v)}>
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button className={styles.newBtn} onClick={onNew}>+ New</button>
      </div>
    </div>
  )
}
