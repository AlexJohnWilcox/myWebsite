const bcrypt = require('bcryptjs')
const { signSession, serializeCookie } = require('./lib/auth')

const json = (statusCode, body, cookie) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...(cookie ? { 'Set-Cookie': cookie } : {}) },
  body: JSON.stringify(body),
})

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method not allowed' })
  let password
  try { password = JSON.parse(event.body || '{}').password } catch { return json(400, { error: 'bad request' }) }
  if (!password) return json(400, { error: 'password required' })

  const hash = process.env.CALENDAR_PASSWORD_HASH
  if (!hash) return json(500, { error: 'server not configured' })

  const ok = bcrypt.compareSync(password, hash)
  if (!ok) return json(401, { error: 'invalid password' })

  return json(200, { authenticated: true }, serializeCookie(signSession()))
}
