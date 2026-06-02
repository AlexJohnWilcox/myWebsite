import { useState } from 'react'
import styles from './Login.module.css'

export function Login({ login, onAuthed }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await login(password)
      onAuthed()
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={submit}>
        <h1 className={styles.title}>Calendar</h1>
        <label className={styles.label} htmlFor="pw">Passphrase</label>
        <input id="pw" className={styles.input} type="password" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.button} type="submit" disabled={busy}>{busy ? '…' : 'Unlock'}</button>
      </form>
    </div>
  )
}
