const jwt = require('jsonwebtoken')

const COOKIE = 'cal_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function secret() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not set')
  return s
}

function signSession() {
  return jwt.sign({ sub: 'alex' }, secret(), { expiresIn: '30d' })
}

function verifySession(token) {
  try { return jwt.verify(token, secret()) } catch { return null }
}

function serializeCookie(token) {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`
}

function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}

function tokenFromEvent(event) {
  const raw = (event.headers && (event.headers.cookie || event.headers.Cookie)) || ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === COOKIE) return v.join('=')
  }
  return null
}

function requireAuth(event) {
  const token = tokenFromEvent(event)
  return token ? verifySession(token) : null
}

module.exports = { COOKIE, signSession, verifySession, serializeCookie, clearCookie, tokenFromEvent, requireAuth }
