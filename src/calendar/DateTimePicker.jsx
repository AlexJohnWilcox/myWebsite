import { useState } from 'react'
import styles from './EventEditor.module.css'
import { monthMatrix, fmtMonthYear } from './datetime'

const HOURS = Array.from({ length: 24 }, (_, h) => h)
const MINS = [0, 15, 30, 45]
const pad = (n) => String(n).padStart(2, '0')

export function DateTimePicker({ value, allDay, onChange, onClose }) {
  const initDate = value.slice(0, 10)
  const [y, m] = initDate.split('-').map(Number)
  const [year, setYear] = useState(y)
  const [month, setMonth] = useState(m)
  const [date, setDate] = useState(initDate)
  const initTime = value.includes('T') ? value.slice(11) : '09:00'
  const [hour, setHour] = useState(Number(initTime.slice(0, 2)))
  const [minute, setMinute] = useState(Number(initTime.slice(3, 5)))
  const [step, setStep] = useState('day')

  function stepMonth(delta) {
    let nm = month + delta, ny = year
    if (nm < 1) { nm = 12; ny-- } else if (nm > 12) { nm = 1; ny++ }
    setMonth(nm); setYear(ny)
  }

  function pickDay(d) {
    setDate(d)
    if (allDay) { onChange(d); onClose() } else { setStep('time') }
  }

  function pickHour(h) { setHour(h); onChange(`${date}T${pad(h)}:${pad(minute)}`) }
  function pickMinute(mi) { setMinute(mi); onChange(`${date}T${pad(hour)}:${pad(mi)}`) }

  const cells = monthMatrix(year, month)

  return (
    <div className={styles.popover}>
      <div className={styles.stepDots}>
        <span className={step === 'day' ? styles.dotOn : styles.dot} />
        {!allDay && <span className={step === 'time' ? styles.dotOn : styles.dot} />}
      </div>

      {step === 'day' && (
        <div>
          <div className={styles.pickerHead}>
            <button className={styles.iconBtn} onClick={() => stepMonth(-1)} aria-label="Previous month">‹</button>
            <span>{fmtMonthYear(year, month)}</span>
            <button className={styles.iconBtn} onClick={() => stepMonth(1)} aria-label="Next month">›</button>
          </div>
          <div className={styles.dayGrid}>
            {cells.map((c) => (
              c.inMonth ? (
                <button key={c.date}
                  className={`${styles.dayCell} ${c.date === date ? styles.daySel : ''}`}
                  onClick={() => pickDay(c.date)}>{c.day}</button>
              ) : (
                <span key={c.date} className={`${styles.dayCell} ${styles.dayMut}`}>{c.day}</span>
              )
            ))}
          </div>
        </div>
      )}

      {step === 'time' && !allDay && (
        <div>
          <button className={styles.backLink} onClick={() => setStep('day')}>‹ back to day</button>
          <div className={styles.timeBig}>{pad(hour)}:{pad(minute)}</div>
          <div className={styles.wheels}>
            <div className={styles.wheel}>
              {HOURS.map((h) => (
                <button key={h} className={h === hour ? styles.wheelOn : styles.wheelItem} onClick={() => pickHour(h)}>{pad(h)}</button>
              ))}
            </div>
            <div className={styles.wheel}>
              {MINS.map((mi) => (
                <button key={mi} className={mi === minute ? styles.wheelOn : styles.wheelItem} onClick={() => pickMinute(mi)}>:{pad(mi)}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
