const BASE = '/.netlify/functions'
const opts = (extra = {}) => ({ credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...extra })

async function asJson(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error || (Array.isArray(data.errors) && data.errors.join(', ')) || 'request failed'
    throw Object.assign(new Error(msg), { status: res.status, data })
  }
  return data
}

export const api = {
  async me() { return asJson(await fetch(`${BASE}/auth-me`, opts())) },
  async login(password) { return asJson(await fetch(`${BASE}/auth-login`, opts({ method: 'POST', body: JSON.stringify({ password }) }))) },
  async logout() { return asJson(await fetch(`${BASE}/auth-logout`, opts({ method: 'POST' }))) },
  async list(from, to) { return asJson(await fetch(`${BASE}/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, opts())) },
  async create(ev) { return asJson(await fetch(`${BASE}/events`, opts({ method: 'POST', body: JSON.stringify(ev) }))) },
  async update(ev) { return asJson(await fetch(`${BASE}/events`, opts({ method: 'PUT', body: JSON.stringify(ev) }))) },
  async remove(id) { return asJson(await fetch(`${BASE}/events?id=${encodeURIComponent(id)}`, opts({ method: 'DELETE' }))) },
}
