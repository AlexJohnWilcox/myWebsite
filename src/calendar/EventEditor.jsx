import { useState } from 'react'
import styles from './EventEditor.module.css'
import { DateTimePicker } from './DateTimePicker'
import { fmtTime } from './datetime'

const FREQS = [['none', 'None'], ['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']]
const REMINDER_CHOICES = [5, 10, 30, 60, 1440]

function toDate(s) { return s.slice(0, 10) }
function fmtField(s, allDay) { return allDay ? toDate(s) : `${toDate(s)} · ${fmtTime(s)}` }

export function EventEditor({ initial, onSave, onCancel, onDelete }) {
  const [f, setF] = useState({
    ...initial,
    location: initial.location || '',
    notes: initial.notes || '',
    reminders: initial.reminders || [],
  })
  const [picking, setPicking] = useState(null) // 'start' | 'end' | null
  const [saving, setSaving] = useState(false)
  const set = (patch) => setF((prev) => ({ ...prev, ...patch }))
  const freq = f.recurrence ? f.recurrence.freq : 'none'

  function toggleAllDay() {
    const allDay = !f.allDay
    set({ allDay, start: allDay ? toDate(f.start) : `${toDate(f.start)}T09:00`, end: allDay ? toDate(f.end) : `${toDate(f.end)}T10:00` })
  }

  function setFreq(value) {
    set({ recurrence: value === 'none' ? null : { freq: value, interval: 1, until: f.recurrence?.until || null } })
  }

  function toggleReminder(min) {
    const has = f.reminders.includes(min)
    set({ reminders: has ? f.reminders.filter((r) => r !== min) : [...f.reminders, min].sort((a, b) => a - b) })
  }

  async function save() {
    if (saving) return // guard against double-submit creating duplicate events
    setSaving(true)
    try {
      await onSave({
        ...(f.id ? { id: f.id } : {}),
        title: f.title, location: f.location || null, allDay: f.allDay,
        start: f.start, end: f.end, notes: f.notes || null,
        recurrence: f.recurrence, reminders: f.reminders,
      })
    } catch {
      // onSave surfaces the error; keep the editor open with the user's input
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{f.id ? 'Edit event' : 'New event'}</h3>

        <label className={styles.label} htmlFor="ev-title">Title</label>
        <input id="ev-title" className={`${styles.input} ${styles.titleInput}`} value={f.title}
          onChange={(e) => set({ title: e.target.value })} autoFocus />

        <label className={styles.label} htmlFor="ev-loc">Location · optional</label>
        <input id="ev-loc" className={styles.input} value={f.location}
          onChange={(e) => set({ location: e.target.value })} />

        <label className={styles.toggleRow}>
          <span>All day</span>
          <input type="checkbox" checked={f.allDay} onChange={toggleAllDay} aria-label="All day" />
        </label>

        <div className={styles.two}>
          <div>
            <label className={styles.label}>Starts</label>
            <button className={styles.input} onClick={() => setPicking('start')}>{fmtField(f.start, f.allDay)}</button>
          </div>
          <div>
            <label className={styles.label}>Ends</label>
            <button className={styles.input} onClick={() => setPicking('end')}>{fmtField(f.end, f.allDay)}</button>
          </div>
        </div>

        {picking && (
          <DateTimePicker value={picking === 'start' ? f.start : f.end} allDay={f.allDay}
            onChange={(v) => set({ [picking]: v })} onClose={() => setPicking(null)} />
        )}

        <label className={styles.label}>Repeat</label>
        <div className={styles.seg}>
          {FREQS.map(([v, lbl]) => (
            <button key={v} className={freq === v ? styles.segOn : styles.segItem} onClick={() => setFreq(v)}>{lbl}</button>
          ))}
        </div>
        {f.recurrence && (
          <div>
            <label className={styles.label}>Until · optional</label>
            <input className={styles.input} type="date" value={f.recurrence.until || ''}
              onChange={(e) => set({ recurrence: { ...f.recurrence, until: e.target.value || null } })} />
          </div>
        )}

        <label className={styles.label}>Reminders (in-app)</label>
        <div className={styles.chips}>
          {REMINDER_CHOICES.map((min) => (
            <button key={min} className={f.reminders.includes(min) ? styles.chipOn : styles.chip} onClick={() => toggleReminder(min)}>
              {min < 60 ? `${min} min` : `${min / 60} hr`} before
            </button>
          ))}
        </div>

        <label className={styles.label} htmlFor="ev-notes">Notes</label>
        <textarea id="ev-notes" className={styles.textarea} value={f.notes}
          onChange={(e) => set({ notes: e.target.value })} />

        <div className={styles.buttons}>
          {(f.id ?? initial.id) && <button className={styles.delBtn} onClick={() => onDelete(f.id ?? initial.id)}>Delete</button>}
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? '…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
