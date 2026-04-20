import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './ChatBubble.module.css'

const DAILY_LIMIT = 3
const COOLDOWN_MS = 10000
const STORAGE_KEY = 'alex_chat'
const ENDPOINT = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api/chat'
  : '/.netlify/functions/chat'

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const today = new Date().toDateString()
    if (raw.day !== today) return { day: today, count: 0, lastMsg: 0 }
    return { day: today, count: raw.count || 0, lastMsg: raw.lastMsg || 0 }
  } catch {
    return { day: new Date().toDateString(), count: 0, lastMsg: 0 }
  }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

export function ChatBubble({ embedded = false }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(embedded)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [remaining, setRemaining] = useState(DAILY_LIMIT)
  const msgsRef = useRef(null)

  useEffect(() => {
    setRemaining(Math.max(0, DAILY_LIMIT - loadState().count))
  }, [])

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages, busy])

  useEffect(() => {
    if (embedded) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [embedded])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    if (busy) return
    const state = loadState()
    if (state.count >= DAILY_LIMIT) return
    if (Date.now() - state.lastMsg < COOLDOWN_MS) {
      setMessages(m => [...m, { cls: 'err', text: 'Please wait a moment before asking another question.' }])
      return
    }
    const val = input.trim()
    if (!val) return
    setMessages(m => [...m, { cls: 'user', text: val }])
    setInput('')
    setBusy(true)
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: val }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessages(m => [...m, { cls: 'err', text: data.error || 'Something went wrong.' }])
      } else {
        setMessages(m => [...m, { cls: 'bot', text: data.reply }])
        const s = loadState()
        s.count += 1
        s.lastMsg = Date.now()
        saveState(s)
        setRemaining(Math.max(0, DAILY_LIMIT - s.count))
      }
    } catch {
      setMessages(m => [...m, { cls: 'err', text: 'Could not reach the server. Try again later.' }])
    } finally {
      setBusy(false)
    }
  }, [busy, input])

  if (!embedded && pathname === '/contact') return null

  const panel = (
    <div className={styles.panel}>
      {!embedded && (
        <div className={styles.header}>
          <span>&gt; alex.chat · {remaining} left today</span>
          <button onClick={() => setOpen(false)} aria-label="Close">CLOSE</button>
        </div>
      )}
      <div ref={msgsRef} className={styles.messages}>
        {messages.length === 0 && (
          <div className={`${styles.msg} ${styles.msgBot}`}>
            Ask me anything about Alex — projects, skills, experience.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.msg} ${m.cls === 'user' ? styles.msgUser : m.cls === 'err' ? styles.msgErr : styles.msgBot}`}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className={styles.typing}>
            <span /><span /><span />
          </div>
        )}
      </div>
      <form className={styles.form} onSubmit={submit}>
        <input
          className={styles.input}
          type="text"
          value={input}
          maxLength={300}
          disabled={remaining <= 0 || busy}
          placeholder={remaining > 0 ? 'Ask me anything...' : 'No questions left today'}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className={styles.send} disabled={remaining <= 0 || busy}>[ SEND ]</button>
      </form>
      <div className={styles.remaining}>{remaining} / {DAILY_LIMIT} QUESTIONS LEFT TODAY</div>
    </div>
  )

  if (embedded) return panel

  return (
    <div className={styles.bubble}>
      {open && panel}
      <button className={styles.toggle} onClick={() => setOpen(o => !o)} aria-label="Open chat">&gt;_</button>
    </div>
  )
}
