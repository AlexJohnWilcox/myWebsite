import { useState, useEffect } from 'react'
import { api } from '@/calendar/api'
import { Login } from '@/calendar/Login'
import { CalendarApp } from '@/calendar/CalendarApp'

export function Calendar() {
  const [status, setStatus] = useState('loading') // 'loading' | 'in' | 'out'

  useEffect(() => {
    api.me().then((r) => setStatus(r.authenticated ? 'in' : 'out')).catch(() => setStatus('out'))
  }, [])

  if (status === 'loading') return <div style={{ minHeight: '60vh' }} />
  if (status === 'out') return <Login login={api.login} onAuthed={() => setStatus('in')} />
  return <CalendarApp onAuthExpired={() => setStatus('out')} />
}
