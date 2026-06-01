# Calendar App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, single-user calendar at `alexjwilcox.com/calendar` — month/week/day views, recurring events (whole-series), in-app reminders, JWT login — served from the existing Netlify site.

**Architecture:** A new `/calendar` React route (layout B: toolbar + full-width grid) talks to Netlify serverless functions (`auth-*`, `events`) that store one blob per event in Netlify Blobs. Recurring events are expanded server-side within the requested range. Auth is a single passphrase (bcryptjs hash in env) → signed JWT in an httpOnly cookie. Times use a fixed home-timezone convention: event times are stored and rendered as **naive wall-clock ISO strings** (`YYYY-MM-DDTHH:MM`) with no timezone conversion, so an event always displays at the time you set it regardless of device location.

**Tech Stack:** React 18, React Router v6, Vite, CSS Modules, Framer Motion (already present); Netlify Functions (CommonJS), `@netlify/blobs`, `bcryptjs`, `jsonwebtoken`; Vitest + @testing-library/react for tests.

**Conventions to follow (from the existing repo):**
- Functions are CommonJS: `exports.handler = async (event) => ({ statusCode, headers, body })`. See `netlify/functions/chat.js`.
- Route components are named exports with a sibling `*.module.css`; import via `@/` alias. See `src/routes/Contact.jsx`.
- Frontend calls functions at `/.netlify/functions/<name>`. See `src/components/ChatBubble.jsx`.
- Function deps go in **both** `package.json` (root) and `netlify/functions/package.json` (matches the existing `@anthropic-ai/sdk` duplication; root copy lets Vitest resolve them, functions copy guarantees bundling).
- Tests are colocated `*.test.js(x)`; Vitest globals are on (no imports of `describe/it/expect` needed).

**Date/time convention (read once, applies everywhere):**
- Stored times are naive strings `"YYYY-MM-DDTHH:MM"` (e.g. `"2026-06-02T09:00"`). All-day events store a date `"YYYY-MM-DD"`.
- For arithmetic and comparison, parse into a UTC instant via `Date.UTC(...)` so there is **no** local-timezone drift. Never feed a naive string straight into `new Date(str)` (that interprets it in the browser's zone).
- For display, read the naive components directly — never convert.

---

## File Structure

**Backend (Netlify functions, CommonJS):**
- `netlify/functions/lib/datetime.js` — naive ↔ UTC parsing, add days/weeks/months, compare, format. Pure. Shared by recurrence + handlers.
- `netlify/functions/lib/recurrence.js` — `expandEvents(events, fromNaive, toNaive)`. Pure.
- `netlify/functions/lib/validate.js` — `validateEvent(input)`. Pure.
- `netlify/functions/lib/auth.js` — JWT sign/verify, cookie serialize/parse, `requireAuth(event)`. Uses `jsonwebtoken`.
- `netlify/functions/lib/blobs.js` — thin wrapper over `@netlify/blobs`: list/get/put/delete events.
- `netlify/functions/auth-login.js` — POST password → set session cookie.
- `netlify/functions/auth-logout.js` — clear cookie.
- `netlify/functions/auth-me.js` — report session validity.
- `netlify/functions/events.js` — GET/POST/PUT/DELETE event CRUD (auth-gated; GET expands recurrences).

**Frontend (`src/calendar/` feature dir + one route file):**
- `src/calendar/api.js` — fetch wrappers (cookies via `credentials:'include'`).
- `src/calendar/datetime.js` — client mirror of naive datetime helpers + month-grid/week-range builders + display formatters. Pure.
- `src/calendar/reminders.js` — `computeDue(occurrences, nowMs, firedSet)`. Pure.
- `src/calendar/Login.jsx` + `Login.module.css` — passphrase form.
- `src/calendar/CalendarApp.jsx` — view/date state, fetch-by-range, editor open state.
- `src/calendar/Toolbar.jsx` — month nav + Month/Week/Day switcher + New button.
- `src/calendar/MonthView.jsx`, `WeekView.jsx`, `DayView.jsx` — the three grids.
- `src/calendar/EventEditor.jsx` + `EventEditor.module.css` — the modal.
- `src/calendar/DateTimePicker.jsx` — day→time popover.
- `src/calendar/Calendar.module.css` — shared calendar/grid/toolbar styles.
- `src/routes/Calendar.jsx` — route wrapper: auth gate (Login vs CalendarApp).

**Config:**
- `package.json` / `netlify/functions/package.json` — add deps.
- `.env` (gitignored) + Netlify dashboard env — `CALENDAR_PASSWORD_HASH`, `JWT_SECRET`, `HOME_TZ` (informational).
- `scripts/gen-password-hash.mjs` — one-off helper to produce the bcrypt hash.
- `App.jsx` — register the `/calendar` route.

---

## Phase 0 — Setup

### Task 0.1: Install dependencies

**Files:**
- Modify: `package.json`
- Modify: `netlify/functions/package.json`

- [ ] **Step 1: Add backend deps to both package.json files**

Run from repo root:
```bash
npm install @netlify/blobs bcryptjs jsonwebtoken
npm install --prefix netlify/functions @netlify/blobs bcryptjs jsonwebtoken
```

- [ ] **Step 2: Verify they resolve from root (Vitest needs this)**

Run: `node -e "require('bcryptjs'); require('jsonwebtoken'); require('@netlify/blobs'); console.log('ok')"`
Expected: prints `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json netlify/functions/package.json netlify/functions/package-lock.json
git commit -m "Add calendar backend dependencies"
```

### Task 0.2: Password-hash helper + env

**Files:**
- Create: `scripts/gen-password-hash.mjs`
- Modify: `.gitignore` (ensure `.env` ignored)

- [ ] **Step 1: Write the hash generator**

`scripts/gen-password-hash.mjs`:
```js
// Usage: node scripts/gen-password-hash.mjs 'your-passphrase'
import bcrypt from 'bcryptjs'

const pw = process.argv[2]
if (!pw) {
  console.error("Usage: node scripts/gen-password-hash.mjs 'your-passphrase'")
  process.exit(1)
}
const hash = bcrypt.hashSync(pw, 12)
console.log(hash)
```

- [ ] **Step 2: Ensure `.env` is gitignored**

Run: `grep -q '^\.env$' .gitignore || echo '.env' >> .gitignore`
Then confirm: `grep -n '\.env' .gitignore`
Expected: shows a line `.env`

- [ ] **Step 3: Generate a hash and create local `.env` (engineer runs with a real passphrase)**

```bash
node scripts/gen-password-hash.mjs 'CHANGE-ME-strong-passphrase'
# copy the printed hash, then create .env:
```
`.env` (NOT committed):
```
CALENDAR_PASSWORD_HASH=<paste the printed hash>
JWT_SECRET=<paste output of: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
HOME_TZ=America/New_York
```

- [ ] **Step 4: Verify .env is NOT staged**

Run: `git status --porcelain .env`
Expected: empty output (ignored).

- [ ] **Step 5: Commit the helper only**

```bash
git add scripts/gen-password-hash.mjs .gitignore
git commit -m "Add password hash helper and ignore .env"
```

---

## Phase 1 — Backend pure logic (datetime, recurrence, validation)

### Task 1.1: Naive datetime helpers

**Files:**
- Create: `netlify/functions/lib/datetime.js`
- Test: `netlify/functions/lib/datetime.test.js`

- [ ] **Step 1: Write the failing tests**

`netlify/functions/lib/datetime.test.js`:
```js
const dt = require('./datetime')

describe('datetime', () => {
  it('parses a naive datetime to a UTC instant', () => {
    const ms = dt.toMs('2026-06-02T09:00')
    expect(ms).toBe(Date.UTC(2026, 5, 2, 9, 0))
  })

  it('parses a naive date (all-day) at midnight', () => {
    expect(dt.toMs('2026-06-02')).toBe(Date.UTC(2026, 5, 2, 0, 0))
  })

  it('formats a UTC instant back to a naive datetime string', () => {
    expect(dt.fromMs(Date.UTC(2026, 5, 2, 9, 5))).toBe('2026-06-02T09:05')
  })

  it('adds days without timezone drift', () => {
    expect(dt.addDays('2026-06-02T09:00', 3)).toBe('2026-06-05T09:00')
  })

  it('adds weeks', () => {
    expect(dt.addWeeks('2026-06-02T09:00', 2)).toBe('2026-06-16T09:00')
  })

  it('adds months and clamps overflowing day-of-month', () => {
    expect(dt.addMonths('2026-01-31T09:00', 1)).toBe('2026-02-28T09:00')
  })

  it('compares two naive strings chronologically', () => {
    expect(dt.cmp('2026-06-02T09:00', '2026-06-02T10:00')).toBeLessThan(0)
    expect(dt.cmp('2026-06-02T10:00', '2026-06-02T10:00')).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run netlify/functions/lib/datetime.test.js`
Expected: FAIL — cannot find module `./datetime`.

- [ ] **Step 3: Implement**

`netlify/functions/lib/datetime.js`:
```js
// Naive wall-clock datetime helpers. Strings are "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM".
// All math goes through Date.UTC to avoid any local-timezone drift.

function parts(s) {
  const [date, time] = s.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time ? time.split(':').map(Number) : [0, 0]
  return { y, m, d, hh, mm }
}

function toMs(s) {
  const { y, m, d, hh, mm } = parts(s)
  return Date.UTC(y, m - 1, d, hh, mm)
}

function pad(n) { return String(n).padStart(2, '0') }

function fromMs(ms, dateOnly = false) {
  const dte = new Date(ms)
  const base = `${dte.getUTCFullYear()}-${pad(dte.getUTCMonth() + 1)}-${pad(dte.getUTCDate())}`
  if (dateOnly) return base
  return `${base}T${pad(dte.getUTCHours())}:${pad(dte.getUTCMinutes())}`
}

function isDateOnly(s) { return !s.includes('T') }

function addDays(s, n) { return fromMs(toMs(s) + n * 86400000, isDateOnly(s)) }
function addWeeks(s, n) { return addDays(s, n * 7) }

function addMonths(s, n) {
  const { y, m, d, hh, mm } = parts(s)
  const total = (y * 12 + (m - 1)) + n
  const ny = Math.floor(total / 12)
  const nm = total % 12
  const lastDay = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate()
  const nd = Math.min(d, lastDay)
  return fromMs(Date.UTC(ny, nm, nd, hh, mm), isDateOnly(s))
}

function cmp(a, b) { return toMs(a) - toMs(b) }

module.exports = { toMs, fromMs, addDays, addWeeks, addMonths, cmp, isDateOnly }
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run netlify/functions/lib/datetime.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/lib/datetime.js netlify/functions/lib/datetime.test.js
git commit -m "Add naive datetime helpers"
```

### Task 1.2: Recurrence expansion

**Files:**
- Create: `netlify/functions/lib/recurrence.js`
- Test: `netlify/functions/lib/recurrence.test.js`

- [ ] **Step 1: Write the failing tests**

`netlify/functions/lib/recurrence.test.js`:
```js
const { expandEvents } = require('./recurrence')

const oneOff = { id: 'a', title: 'One', start: '2026-06-10T09:00', end: '2026-06-10T10:00', recurrence: null }
const weekly = { id: 'b', title: 'Standup', start: '2026-06-01T09:00', end: '2026-06-01T09:15', recurrence: { freq: 'weekly', interval: 1, until: null } }

describe('expandEvents', () => {
  it('includes a one-off event when it overlaps the range', () => {
    const out = expandEvents([oneOff], '2026-06-01T00:00', '2026-06-30T23:59')
    expect(out).toHaveLength(1)
    expect(out[0].occurrenceId).toBe('a@2026-06-10T09:00')
  })

  it('excludes a one-off event outside the range', () => {
    expect(expandEvents([oneOff], '2026-07-01T00:00', '2026-07-31T23:59')).toHaveLength(0)
  })

  it('expands a weekly event into each occurrence in range', () => {
    const out = expandEvents([weekly], '2026-06-01T00:00', '2026-06-30T23:59')
    expect(out.map(o => o.start)).toEqual([
      '2026-06-01T09:00', '2026-06-08T09:00', '2026-06-15T09:00', '2026-06-22T09:00', '2026-06-29T09:00',
    ])
  })

  it('preserves duration on each occurrence', () => {
    const out = expandEvents([weekly], '2026-06-01T00:00', '2026-06-07T23:59')
    expect(out[0].end).toBe('2026-06-01T09:15')
  })

  it('respects the until bound', () => {
    const bounded = { ...weekly, recurrence: { freq: 'weekly', interval: 1, until: '2026-06-15' } }
    const out = expandEvents([bounded], '2026-06-01T00:00', '2026-06-30T23:59')
    expect(out.map(o => o.start)).toEqual(['2026-06-01T09:00', '2026-06-08T09:00', '2026-06-15T09:00'])
  })

  it('gives every occurrence a unique occurrenceId but shares the series id', () => {
    const out = expandEvents([weekly], '2026-06-01T00:00', '2026-06-15T23:59')
    expect(out.every(o => o.id === 'b')).toBe(true)
    expect(new Set(out.map(o => o.occurrenceId)).size).toBe(out.length)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run netlify/functions/lib/recurrence.test.js`
Expected: FAIL — cannot find module `./recurrence`.

- [ ] **Step 3: Implement**

`netlify/functions/lib/recurrence.js`:
```js
const dt = require('./datetime')

const MAX_OCCURRENCES = 1000

function stepper(freq, interval) {
  if (freq === 'daily') return (s) => dt.addDays(s, interval)
  if (freq === 'weekly') return (s) => dt.addWeeks(s, interval)
  if (freq === 'monthly') return (s) => dt.addMonths(s, interval)
  throw new Error(`unknown freq: ${freq}`)
}

function occurrence(ev, start) {
  const duration = dt.toMs(ev.end) - dt.toMs(ev.start)
  const end = dt.fromMs(dt.toMs(start) + duration, dt.isDateOnly(ev.start))
  return { ...ev, start, end, occurrenceId: `${ev.id}@${start}` }
}

function expandEvents(events, fromNaive, toNaive) {
  const out = []
  for (const ev of events) {
    if (!ev.recurrence) {
      if (dt.cmp(ev.start, toNaive) <= 0 && dt.cmp(ev.end, fromNaive) >= 0) {
        out.push(occurrence(ev, ev.start))
      }
      continue
    }
    const { freq, interval, until } = ev.recurrence
    const next = stepper(freq, Math.max(1, interval || 1))
    let cur = ev.start
    let count = 0
    while (count < MAX_OCCURRENCES) {
      if (dt.cmp(cur, toNaive) > 0) break
      if (until && dt.cmp(cur, until) > 0) break
      if (dt.cmp(cur, fromNaive) >= 0) out.push(occurrence(ev, cur))
      cur = next(cur)
      count++
    }
  }
  out.sort((a, b) => dt.cmp(a.start, b.start))
  return out
}

module.exports = { expandEvents }
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run netlify/functions/lib/recurrence.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/lib/recurrence.js netlify/functions/lib/recurrence.test.js
git commit -m "Add recurrence expansion"
```

### Task 1.3: Event validation

**Files:**
- Create: `netlify/functions/lib/validate.js`
- Test: `netlify/functions/lib/validate.test.js`

- [ ] **Step 1: Write the failing tests**

`netlify/functions/lib/validate.test.js`:
```js
const { validateEvent } = require('./validate')

const good = {
  title: 'Dentist', location: '42 King St', allDay: false,
  start: '2026-06-02T09:00', end: '2026-06-02T10:00',
  notes: 'card', recurrence: null, reminders: [10, 60],
}

describe('validateEvent', () => {
  it('accepts a well-formed event and normalizes it', () => {
    const r = validateEvent(good)
    expect(r.ok).toBe(true)
    expect(r.value.title).toBe('Dentist')
    expect(r.value.reminders).toEqual([10, 60])
  })

  it('rejects an empty title', () => {
    const r = validateEvent({ ...good, title: '  ' })
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('title is required')
  })

  it('rejects end before start', () => {
    const r = validateEvent({ ...good, start: '2026-06-02T10:00', end: '2026-06-02T09:00' })
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('end must be on or after start')
  })

  it('rejects an unknown recurrence freq', () => {
    const r = validateEvent({ ...good, recurrence: { freq: 'yearly', interval: 1, until: null } })
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('invalid recurrence freq')
  })

  it('defaults missing optional fields', () => {
    const r = validateEvent({ title: 'X', start: '2026-06-02T09:00', end: '2026-06-02T09:30' })
    expect(r.ok).toBe(true)
    expect(r.value.location).toBeNull()
    expect(r.value.notes).toBeNull()
    expect(r.value.recurrence).toBeNull()
    expect(r.value.reminders).toEqual([])
    expect(r.value.allDay).toBe(false)
  })

  it('rejects negative or non-integer reminders', () => {
    const r = validateEvent({ ...good, reminders: [-5] })
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('reminders must be non-negative integers')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run netlify/functions/lib/validate.test.js`
Expected: FAIL — cannot find module `./validate`.

- [ ] **Step 3: Implement**

`netlify/functions/lib/validate.js`:
```js
const dt = require('./datetime')

const FREQS = new Set(['daily', 'weekly', 'monthly'])
const NAIVE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/

function validateEvent(input) {
  const errors = []
  const i = input || {}

  const title = typeof i.title === 'string' ? i.title.trim() : ''
  if (!title) errors.push('title is required')

  const start = i.start
  const end = i.end
  if (!NAIVE.test(start || '')) errors.push('start is invalid')
  if (!NAIVE.test(end || '')) errors.push('end is invalid')
  if (NAIVE.test(start || '') && NAIVE.test(end || '') && dt.cmp(end, start) < 0) {
    errors.push('end must be on or after start')
  }

  let recurrence = null
  if (i.recurrence) {
    if (!FREQS.has(i.recurrence.freq)) errors.push('invalid recurrence freq')
    const interval = Number(i.recurrence.interval)
    if (!Number.isInteger(interval) || interval < 1) errors.push('recurrence interval must be a positive integer')
    const until = i.recurrence.until || null
    if (until && !NAIVE.test(until)) errors.push('recurrence until is invalid')
    if (errors.length === 0) recurrence = { freq: i.recurrence.freq, interval, until }
  }

  let reminders = []
  if (i.reminders != null) {
    if (!Array.isArray(i.reminders) || !i.reminders.every((n) => Number.isInteger(n) && n >= 0)) {
      errors.push('reminders must be non-negative integers')
    } else {
      reminders = i.reminders
    }
  }

  if (errors.length) return { ok: false, errors }

  return {
    ok: true,
    value: {
      title,
      location: typeof i.location === 'string' && i.location.trim() ? i.location.trim() : null,
      allDay: i.allDay === true,
      start,
      end,
      notes: typeof i.notes === 'string' && i.notes.trim() ? i.notes.trim() : null,
      recurrence,
      reminders,
    },
  }
}

module.exports = { validateEvent }
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run netlify/functions/lib/validate.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/lib/validate.js netlify/functions/lib/validate.test.js
git commit -m "Add event validation"
```

---

## Phase 2 — Backend auth

### Task 2.1: Auth library (JWT + cookies)

**Files:**
- Create: `netlify/functions/lib/auth.js`
- Test: `netlify/functions/lib/auth.test.js`

- [ ] **Step 1: Write the failing tests**

`netlify/functions/lib/auth.test.js`:
```js
const auth = require('./auth')

beforeAll(() => { process.env.JWT_SECRET = 'test-secret-xyz' })

describe('auth', () => {
  it('signs a token that it can verify', () => {
    const token = auth.signSession()
    expect(auth.verifySession(token)).toBeTruthy()
  })

  it('rejects a tampered token', () => {
    expect(auth.verifySession('not.a.jwt')).toBeNull()
  })

  it('serializes an httpOnly Secure SameSite cookie', () => {
    const c = auth.serializeCookie('abc')
    expect(c).toMatch(/^cal_session=abc;/)
    expect(c).toMatch(/HttpOnly/)
    expect(c).toMatch(/Secure/)
    expect(c).toMatch(/SameSite=Strict/)
  })

  it('parses a token out of the request cookie header', () => {
    const event = { headers: { cookie: 'foo=1; cal_session=tok123; bar=2' } }
    expect(auth.tokenFromEvent(event)).toBe('tok123')
  })

  it('requireAuth returns payload for a valid cookie and null otherwise', () => {
    const token = auth.signSession()
    expect(auth.requireAuth({ headers: { cookie: `cal_session=${token}` } })).toBeTruthy()
    expect(auth.requireAuth({ headers: {} })).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run netlify/functions/lib/auth.test.js`
Expected: FAIL — cannot find module `./auth`.

- [ ] **Step 3: Implement**

`netlify/functions/lib/auth.js`:
```js
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run netlify/functions/lib/auth.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/lib/auth.js netlify/functions/lib/auth.test.js
git commit -m "Add auth library (JWT + cookies)"
```

### Task 2.2: Auth handlers (login, logout, me)

**Files:**
- Create: `netlify/functions/auth-login.js`
- Create: `netlify/functions/auth-logout.js`
- Create: `netlify/functions/auth-me.js`

- [ ] **Step 1: Implement `auth-login.js`**

`netlify/functions/auth-login.js`:
```js
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
```

- [ ] **Step 2: Implement `auth-logout.js`**

`netlify/functions/auth-logout.js`:
```js
const { clearCookie } = require('./lib/auth')

exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearCookie() },
  body: JSON.stringify({ authenticated: false }),
})
```

- [ ] **Step 3: Implement `auth-me.js`**

`netlify/functions/auth-me.js`:
```js
const { requireAuth } = require('./lib/auth')

exports.handler = async (event) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ authenticated: !!requireAuth(event) }),
})
```

- [ ] **Step 4: Smoke-test login logic with a generated hash**

Run:
```bash
node -e "const b=require('bcryptjs');const h=b.hashSync('pw',12);console.log(b.compareSync('pw',h), b.compareSync('nope',h))"
```
Expected: `true false`

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/auth-login.js netlify/functions/auth-logout.js netlify/functions/auth-me.js
git commit -m "Add auth handlers (login, logout, me)"
```

---

## Phase 3 — Backend events

### Task 3.1: Blobs store wrapper

**Files:**
- Create: `netlify/functions/lib/blobs.js`

- [ ] **Step 1: Implement**

`netlify/functions/lib/blobs.js`:
```js
const { getStore } = require('@netlify/blobs')
const { randomUUID } = require('crypto')

const PREFIX = 'events/'
function store() { return getStore('calendar-events') }

async function listEvents() {
  const s = store()
  const { blobs } = await s.list({ prefix: PREFIX })
  const out = []
  for (const b of blobs) {
    const ev = await s.get(b.key, { type: 'json' })
    if (ev) out.push(ev)
  }
  return out
}

async function putEvent(ev) {
  const id = ev.id || randomUUID()
  const record = { ...ev, id }
  await store().setJSON(`${PREFIX}${id}`, record)
  return record
}

async function deleteEvent(id) {
  await store().delete(`${PREFIX}${id}`)
}

module.exports = { listEvents, putEvent, deleteEvent }
```

Note: `getStore('calendar-events')` works automatically under `netlify dev` and on deployed Netlify. No tests here — this is thin I/O glue exercised via the `events` handler and manual `netlify dev` runs.

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/lib/blobs.js
git commit -m "Add Netlify Blobs event store wrapper"
```

### Task 3.2: Events handler (CRUD, auth-gated, range expansion)

**Files:**
- Create: `netlify/functions/events.js`
- Test: `netlify/functions/events.test.js`

- [ ] **Step 1: Write the failing tests (mock auth + blobs)**

`netlify/functions/events.test.js`:
```js
import { vi } from 'vitest'

vi.mock('./lib/auth', () => ({ requireAuth: vi.fn(() => ({ sub: 'alex' })) }))
const store = []
vi.mock('./lib/blobs', () => ({
  listEvents: vi.fn(async () => store.slice()),
  putEvent: vi.fn(async (ev) => { const r = { ...ev, id: ev.id || 'new-id' }; store.push(r); return r }),
  deleteEvent: vi.fn(async (id) => { const i = store.findIndex(e => e.id === id); if (i >= 0) store.splice(i, 1) }),
}))

const { handler } = require('./events')
const { requireAuth } = require('./lib/auth')

const call = (over) => handler({ httpMethod: 'GET', headers: {}, queryStringParameters: {}, body: null, ...over })

beforeEach(() => { store.length = 0; requireAuth.mockReturnValue({ sub: 'alex' }) })

describe('events handler', () => {
  it('401s when unauthenticated', async () => {
    requireAuth.mockReturnValueOnce(null)
    const res = await call({})
    expect(res.statusCode).toBe(401)
  })

  it('creates an event on POST and returns it with an id', async () => {
    const body = JSON.stringify({ title: 'X', start: '2026-06-02T09:00', end: '2026-06-02T10:00' })
    const res = await call({ httpMethod: 'POST', body })
    expect(res.statusCode).toBe(201)
    expect(JSON.parse(res.body).event.id).toBeTruthy()
  })

  it('400s on an invalid POST body', async () => {
    const res = await call({ httpMethod: 'POST', body: JSON.stringify({ title: '' }) })
    expect(res.statusCode).toBe(400)
  })

  it('GET returns expanded occurrences within the range', async () => {
    store.push({ id: 'b', title: 'S', start: '2026-06-01T09:00', end: '2026-06-01T09:15',
      recurrence: { freq: 'weekly', interval: 1, until: null } })
    const res = await call({ httpMethod: 'GET', queryStringParameters: { from: '2026-06-01T00:00', to: '2026-06-15T23:59' } })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).events).toHaveLength(3)
  })

  it('DELETE removes by id', async () => {
    store.push({ id: 'z', title: 'Q', start: '2026-06-02T09:00', end: '2026-06-02T10:00', recurrence: null })
    const res = await call({ httpMethod: 'DELETE', queryStringParameters: { id: 'z' } })
    expect(res.statusCode).toBe(200)
    expect(store).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run netlify/functions/events.test.js`
Expected: FAIL — cannot find module `./events`.

- [ ] **Step 3: Implement**

`netlify/functions/events.js`:
```js
const { requireAuth } = require('./lib/auth')
const { listEvents, putEvent, deleteEvent } = require('./lib/blobs')
const { validateEvent } = require('./lib/validate')
const { expandEvents } = require('./lib/recurrence')

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

exports.handler = async (event) => {
  if (!requireAuth(event)) return json(401, { error: 'unauthorized' })

  const method = event.httpMethod
  const q = event.queryStringParameters || {}
  let body = {}
  if (event.body) { try { body = JSON.parse(event.body) } catch { return json(400, { error: 'bad json' }) } }

  try {
    if (method === 'GET') {
      const from = q.from || '1970-01-01T00:00'
      const to = q.to || '2999-12-31T23:59'
      const all = await listEvents()
      return json(200, { events: expandEvents(all, from, to) })
    }

    if (method === 'POST') {
      const r = validateEvent(body)
      if (!r.ok) return json(400, { errors: r.errors })
      const saved = await putEvent(r.value)
      return json(201, { event: saved })
    }

    if (method === 'PUT') {
      if (!body.id) return json(400, { error: 'id required' })
      const r = validateEvent(body)
      if (!r.ok) return json(400, { errors: r.errors })
      const saved = await putEvent({ ...r.value, id: body.id })
      return json(200, { event: saved })
    }

    if (method === 'DELETE') {
      if (!q.id) return json(400, { error: 'id required' })
      await deleteEvent(q.id)
      return json(200, { ok: true })
    }

    return json(405, { error: 'method not allowed' })
  } catch (err) {
    console.error('events error:', err.message)
    return json(500, { error: 'server error' })
  }
}
```

Note the test imports `{ handler }` — add a named alias by exporting both: at the bottom the test uses `require('./events').handler`, which matches `exports.handler`. ✓

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run netlify/functions/events.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/events.js netlify/functions/events.test.js
git commit -m "Add events CRUD handler with range expansion"
```

---

## Phase 4 — Frontend pure logic

### Task 4.1: Client datetime + calendar-grid helpers

**Files:**
- Create: `src/calendar/datetime.js`
- Test: `src/calendar/datetime.test.js`

- [ ] **Step 1: Write the failing tests**

`src/calendar/datetime.test.js`:
```js
import * as dt from './datetime'

describe('client datetime', () => {
  it('builds a 6x7 month matrix starting on Sunday', () => {
    const cells = dt.monthMatrix(2026, 6) // June 2026
    expect(cells).toHaveLength(42)
    expect(cells[0].date).toBe('2026-05-31') // grid starts on the Sunday before
    expect(cells.find(c => c.date === '2026-06-01').inMonth).toBe(true)
    expect(cells[0].inMonth).toBe(false)
  })

  it('returns the 7 dates of the week containing a date', () => {
    const week = dt.weekDates('2026-06-03') // a Wednesday
    expect(week).toEqual(['2026-05-31', '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06'])
  })

  it('formats a time for display from a naive string', () => {
    expect(dt.fmtTime('2026-06-02T09:05')).toBe('9:05 AM')
    expect(dt.fmtTime('2026-06-02T13:00')).toBe('1:00 PM')
  })

  it('formats a month-year heading', () => {
    expect(dt.fmtMonthYear(2026, 6)).toBe('June 2026')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/calendar/datetime.test.js`
Expected: FAIL — cannot find module `./datetime`.

- [ ] **Step 3: Implement**

`src/calendar/datetime.js`:
```js
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const pad = (n) => String(n).padStart(2, '0')

export function ymd(y, m, d) { return `${y}-${pad(m)}-${pad(d)}` }

// Day-of-week (0=Sun) for a naive date, computed in UTC to avoid drift.
export function dow(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function addDaysDate(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d) + n * 86400000
  const dte = new Date(t)
  return ymd(dte.getUTCFullYear(), dte.getUTCMonth() + 1, dte.getUTCDate())
}

export function monthMatrix(year, month) {
  const first = ymd(year, month, 1)
  const start = addDaysDate(first, -dow(first)) // back up to Sunday
  const cells = []
  for (let i = 0; i < 42; i++) {
    const date = addDaysDate(start, i)
    cells.push({ date, inMonth: date.slice(0, 7) === `${year}-${pad(month)}`, day: Number(date.slice(8, 10)) })
  }
  return cells
}

export function weekDates(dateStr) {
  const start = addDaysDate(dateStr, -dow(dateStr))
  return Array.from({ length: 7 }, (_, i) => addDaysDate(start, i))
}

export function fmtTime(naive) {
  const [, time] = naive.split('T')
  let [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${pad(m)} ${ampm}`
}

export function fmtMonthYear(year, month) { return `${MONTHS[month - 1]} ${year}` }
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/calendar/datetime.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/calendar/datetime.js src/calendar/datetime.test.js
git commit -m "Add client calendar datetime helpers"
```

### Task 4.2: Reminder due-calculation

**Files:**
- Create: `src/calendar/reminders.js`
- Test: `src/calendar/reminders.test.js`

- [ ] **Step 1: Write the failing tests**

`src/calendar/reminders.test.js`:
```js
import { computeDue, occurrenceMs } from './reminders'

const occ = { occurrenceId: 'b@2026-06-02T09:00', title: 'Standup', start: '2026-06-02T09:00', reminders: [10, 60] }

describe('computeDue', () => {
  it('returns a reminder that is now due and not yet fired', () => {
    const now = occurrenceMs('2026-06-02T08:51') // 9 min before -> 10-min reminder is due
    const due = computeDue([occ], now, new Set())
    expect(due.map(d => d.offset)).toContain(10)
  })

  it('does not return reminders whose time has not arrived', () => {
    const now = occurrenceMs('2026-06-02T07:30') // 90 min before -> neither due
    expect(computeDue([occ], now, new Set())).toHaveLength(0)
  })

  it('skips reminders already fired', () => {
    const now = occurrenceMs('2026-06-02T08:51')
    const fired = new Set(['b@2026-06-02T09:00|10'])
    expect(computeDue([occ], now, fired)).toHaveLength(0)
  })

  it('does not fire after the event start has passed', () => {
    const now = occurrenceMs('2026-06-02T09:30')
    expect(computeDue([occ], now, new Set())).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/calendar/reminders.test.js`
Expected: FAIL — cannot find module `./reminders`.

- [ ] **Step 3: Implement**

`src/calendar/reminders.js`:
```js
// Naive string -> ms (UTC-based, drift-free). Mirrors the backend convention.
export function occurrenceMs(naive) {
  const [date, time] = naive.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time ? time.split(':').map(Number) : [0, 0]
  return Date.UTC(y, m - 1, d, hh, mm)
}

export function reminderKey(occurrenceId, offset) { return `${occurrenceId}|${offset}` }

// Returns reminders whose fire-time (start - offset) has arrived, the start has
// not yet passed, and which have not already fired.
export function computeDue(occurrences, nowMs, firedSet) {
  const due = []
  for (const occ of occurrences) {
    const startMs = occurrenceMs(occ.start)
    if (nowMs >= startMs) continue
    for (const offset of occ.reminders || []) {
      const fireAt = startMs - offset * 60000
      const key = reminderKey(occ.occurrenceId, offset)
      if (nowMs >= fireAt && !firedSet.has(key)) due.push({ occurrenceId: occ.occurrenceId, offset, event: occ, key })
    }
  }
  return due
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/calendar/reminders.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/calendar/reminders.js src/calendar/reminders.test.js
git commit -m "Add reminder due-calculation"
```

### Task 4.3: API client

**Files:**
- Create: `src/calendar/api.js`

- [ ] **Step 1: Implement**

`src/calendar/api.js`:
```js
const BASE = '/.netlify/functions'
const opts = (extra = {}) => ({ credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...extra })

async function asJson(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'request failed'), { status: res.status, data })
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
```

- [ ] **Step 2: Commit**

```bash
git add src/calendar/api.js
git commit -m "Add calendar API client"
```

---

## Phase 5 — Frontend auth gate

### Task 5.1: Login component

**Files:**
- Create: `src/calendar/Login.jsx`
- Create: `src/calendar/Login.module.css`
- Test: `src/calendar/Login.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/calendar/Login.test.jsx`:
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { Login } from './Login'

describe('Login', () => {
  it('calls onAuthed after a successful login', async () => {
    const onAuthed = vi.fn()
    const login = vi.fn().mockResolvedValue({ authenticated: true })
    render(<Login login={login} onAuthed={onAuthed} />)
    fireEvent.change(screen.getByLabelText(/passphrase/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
    await waitFor(() => expect(onAuthed).toHaveBeenCalled())
    expect(login).toHaveBeenCalledWith('secret')
  })

  it('shows an error on failed login', async () => {
    const login = vi.fn().mockRejectedValue(new Error('invalid password'))
    render(<Login login={login} onAuthed={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/passphrase/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
    expect(await screen.findByText(/invalid password/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/calendar/Login.test.jsx`
Expected: FAIL — cannot find module `./Login`.

- [ ] **Step 3: Implement the component**

`src/calendar/Login.jsx`:
```jsx
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
```

- [ ] **Step 4: Implement the styles**

`src/calendar/Login.module.css`:
```css
.wrap { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.card { width: 100%; max-width: 340px; background: var(--bg-card); border: 1px solid var(--rule); border-radius: 12px; padding: 28px; }
.title { font-family: var(--serif); font-size: var(--fs-lg); margin: 0 0 20px; }
.label { display: block; font-family: var(--mono); font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 1px; color: var(--ink-dim); margin-bottom: 8px; }
.input { width: 100%; box-sizing: border-box; background: var(--bg); border: 1px solid var(--rule); border-radius: 8px; padding: 11px 13px; color: var(--ink); font-size: var(--fs-base); }
.input:focus { outline: none; border-color: var(--accent); }
.error { color: var(--accent); font-size: var(--fs-sm); margin: 10px 0 0; }
.button { margin-top: 18px; width: 100%; padding: 12px; border-radius: 8px; background: var(--accent); color: var(--bg); font-weight: 600; }
.button:disabled { opacity: 0.6; }
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run src/calendar/Login.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/calendar/Login.jsx src/calendar/Login.module.css src/calendar/Login.test.jsx
git commit -m "Add calendar login component"
```

---

## Phase 6 — Calendar shell + views

### Task 6.1: Toolbar

**Files:**
- Create: `src/calendar/Toolbar.jsx`
- Create: `src/calendar/Calendar.module.css`
- Test: `src/calendar/Toolbar.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/calendar/Toolbar.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Toolbar } from './Toolbar'

describe('Toolbar', () => {
  it('shows the heading and switches view', () => {
    const onView = vi.fn()
    render(<Toolbar heading="June 2026" view="month" onView={onView} onPrev={vi.fn()} onNext={vi.fn()} onToday={vi.fn()} onNew={vi.fn()} />)
    expect(screen.getByText('June 2026')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^week$/i }))
    expect(onView).toHaveBeenCalledWith('week')
  })

  it('fires onNew when the New button is clicked', () => {
    const onNew = vi.fn()
    render(<Toolbar heading="X" view="month" onView={vi.fn()} onPrev={vi.fn()} onNext={vi.fn()} onToday={vi.fn()} onNew={onNew} />)
    fireEvent.click(screen.getByRole('button', { name: /\+ new/i }))
    expect(onNew).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/calendar/Toolbar.test.jsx`
Expected: FAIL — cannot find module `./Toolbar`.

- [ ] **Step 3: Implement Toolbar**

`src/calendar/Toolbar.jsx`:
```jsx
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
```

- [ ] **Step 4: Implement shared styles (Calendar.module.css)**

`src/calendar/Calendar.module.css`:
```css
.page { max-width: var(--max); margin: 0 auto; padding: calc(var(--nav-h) + 16px) var(--gutter) 48px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.navGroup, .rightGroup { display: flex; align-items: center; gap: 8px; }
.heading { font-family: var(--serif); font-size: var(--fs-lg); margin: 0 0 0 6px; }
.iconBtn { width: 34px; height: 34px; border: 1px solid var(--rule); border-radius: 8px; color: var(--ink); font-size: 18px; }
.todayBtn { padding: 7px 12px; border: 1px solid var(--rule); border-radius: 8px; color: var(--ink-dim); font-size: var(--fs-sm); }
.switcher { display: flex; border: 1px solid var(--rule); border-radius: 8px; overflow: hidden; }
.seg, .segOn { padding: 7px 14px; font-size: var(--fs-sm); color: var(--ink-dim); }
.segOn { background: var(--accent); color: var(--bg); font-weight: 600; }
.newBtn { padding: 8px 14px; border-radius: 8px; background: var(--accent); color: var(--bg); font-weight: 600; font-size: var(--fs-sm); }

/* Month grid */
.monthGrid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.dowHead { text-align: center; font-family: var(--mono); font-size: var(--fs-xs); color: var(--ink-mute); text-transform: uppercase; padding: 6px 0; }
.cell { min-height: 92px; background: var(--bg-card); border: 1px solid var(--rule); border-radius: 6px; padding: 5px 6px; cursor: pointer; }
.cellOut { opacity: 0.4; }
.cellToday { border-color: var(--accent); }
.cellNum { font-size: var(--fs-sm); color: var(--ink-dim); }
.chip { display: block; width: 100%; text-align: left; margin-top: 3px; font-size: 11px; padding: 2px 5px; border-radius: 4px; background: rgba(255,90,54,0.18); color: var(--ink); border-left: 2px solid var(--accent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Week / day time-grid */
.timeGrid { display: grid; grid-template-columns: 56px 1fr; border: 1px solid var(--rule); border-radius: 8px; overflow: hidden; }
.timeCol { border-right: 1px solid var(--rule); }
.hourRow { height: 44px; border-bottom: 1px solid var(--rule); font-family: var(--mono); font-size: 10px; color: var(--ink-mute); padding: 2px 5px; }
.dayCols { display: grid; }
.dayColHead { text-align: center; font-size: var(--fs-sm); padding: 6px 0; border-bottom: 1px solid var(--rule); }
.tEvent { margin: 2px 4px; padding: 3px 6px; border-radius: 5px; background: rgba(255,90,54,0.2); border-left: 3px solid var(--accent); font-size: 11px; cursor: pointer; }

@media (max-width: 640px) {
  .heading { font-size: var(--fs-md); }
  .cell { min-height: 64px; }
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run src/calendar/Toolbar.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/calendar/Toolbar.jsx src/calendar/Calendar.module.css src/calendar/Toolbar.test.jsx
git commit -m "Add calendar toolbar and shared styles"
```

### Task 6.2: Month / Week / Day views

**Files:**
- Create: `src/calendar/MonthView.jsx`
- Create: `src/calendar/WeekView.jsx`
- Create: `src/calendar/DayView.jsx`
- Test: `src/calendar/MonthView.test.jsx`

- [ ] **Step 1: Write the failing test (MonthView)**

`src/calendar/MonthView.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { MonthView } from './MonthView'

const events = [{ occurrenceId: 'a@1', id: 'a', title: 'Dentist', start: '2026-06-10T09:00', end: '2026-06-10T10:00' }]

describe('MonthView', () => {
  it('renders an event chip on its day and opens it on click', () => {
    const onOpen = vi.fn()
    render(<MonthView year={2026} month={6} today="2026-06-01" events={events} onOpenEvent={onOpen} onNewOn={vi.fn()} />)
    const chip = screen.getByText('Dentist')
    expect(chip).toBeInTheDocument()
    fireEvent.click(chip)
    expect(onOpen).toHaveBeenCalledWith(events[0])
  })

  it('calls onNewOn with the date when an empty cell is clicked', () => {
    const onNewOn = vi.fn()
    render(<MonthView year={2026} month={6} today="2026-06-01" events={[]} onOpenEvent={vi.fn()} onNewOn={onNewOn} />)
    fireEvent.click(screen.getByText('15').closest('[data-date]'))
    expect(onNewOn).toHaveBeenCalledWith('2026-06-15')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/calendar/MonthView.test.jsx`
Expected: FAIL — cannot find module `./MonthView`.

- [ ] **Step 3: Implement MonthView**

`src/calendar/MonthView.jsx`:
```jsx
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
```

- [ ] **Step 4: Run MonthView test to verify pass**

Run: `npx vitest run src/calendar/MonthView.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement WeekView**

`src/calendar/WeekView.jsx`:
```jsx
import styles from './Calendar.module.css'
import { weekDates, fmtTime } from './datetime'

const HOURS = Array.from({ length: 24 }, (_, h) => h)

export function WeekView({ anchorDate, events, onOpenEvent }) {
  const days = weekDates(anchorDate)
  const byDate = {}
  for (const ev of events) { (byDate[ev.start.slice(0, 10)] ||= []).push(ev) }
  return (
    <div className={styles.timeGrid}>
      <div className={styles.timeCol}>
        <div className={styles.dayColHead}> </div>
        {HOURS.map((h) => <div key={h} className={styles.hourRow}>{h}:00</div>)}
      </div>
      <div className={styles.dayCols} style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
        {days.map((d) => (
          <div key={d}>
            <div className={styles.dayColHead}>{d.slice(5)}</div>
            {(byDate[d] || []).map((ev) => (
              <div key={ev.occurrenceId} className={styles.tEvent} onClick={() => onOpenEvent(ev)}>
                {ev.allDay ? 'all-day' : fmtTime(ev.start)} {ev.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Implement DayView**

`src/calendar/DayView.jsx`:
```jsx
import styles from './Calendar.module.css'
import { fmtTime } from './datetime'

const HOURS = Array.from({ length: 24 }, (_, h) => h)

export function DayView({ date, events, onOpenEvent }) {
  const todays = events.filter((e) => e.start.slice(0, 10) === date)
  return (
    <div className={styles.timeGrid}>
      <div className={styles.timeCol}>
        <div className={styles.dayColHead}> </div>
        {HOURS.map((h) => <div key={h} className={styles.hourRow}>{h}:00</div>)}
      </div>
      <div>
        <div className={styles.dayColHead}>{date}</div>
        {todays.length === 0 && <p style={{ padding: '12px', color: 'var(--ink-mute)' }}>No events.</p>}
        {todays.map((ev) => (
          <div key={ev.occurrenceId} className={styles.tEvent} onClick={() => onOpenEvent(ev)}>
            {ev.allDay ? 'all-day' : fmtTime(ev.start)} {ev.title}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/calendar/MonthView.jsx src/calendar/WeekView.jsx src/calendar/DayView.jsx src/calendar/MonthView.test.jsx
git commit -m "Add month, week, and day views"
```

---

## Phase 7 — Event editor + date/time picker

### Task 7.1: DateTimePicker (day → time popover)

**Files:**
- Create: `src/calendar/DateTimePicker.jsx`
- Test: `src/calendar/DateTimePicker.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/calendar/DateTimePicker.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { DateTimePicker } from './DateTimePicker'

describe('DateTimePicker', () => {
  it('picks a day then a time and emits a naive datetime', () => {
    const onChange = vi.fn()
    render(<DateTimePicker value="2026-06-02T09:00" allDay={false} onChange={onChange} onClose={vi.fn()} />)
    // Step 1: pick day 5
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    // Step 2: time wheel visible — pick hour 10 then minute 30
    fireEvent.click(screen.getByRole('button', { name: '10' }))
    fireEvent.click(screen.getByRole('button', { name: ':30' }))
    expect(onChange).toHaveBeenLastCalledWith('2026-06-05T10:30')
  })

  it('emits a date only when allDay is true (no time step)', () => {
    const onChange = vi.fn()
    render(<DateTimePicker value="2026-06-02" allDay={true} onChange={onChange} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '7' }))
    expect(onChange).toHaveBeenLastCalledWith('2026-06-07')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/calendar/DateTimePicker.test.jsx`
Expected: FAIL — cannot find module `./DateTimePicker`.

- [ ] **Step 3: Implement**

`src/calendar/DateTimePicker.jsx`:
```jsx
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
              <button key={c.date} disabled={!c.inMonth}
                className={`${styles.dayCell} ${c.date === date ? styles.daySel : ''} ${c.inMonth ? '' : styles.dayMut}`}
                onClick={() => pickDay(c.date)}>{c.day}</button>
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/calendar/DateTimePicker.test.jsx`
Expected: PASS (2 tests).

Note: the minute buttons render as `:00`, `:15`, etc., matching the test's `name: ':30'`. The hour buttons render zero-padded (`00`..`23`); the test clicks `10` which matches `pad(10)='10'`.

- [ ] **Step 5: Commit**

```bash
git add src/calendar/DateTimePicker.jsx src/calendar/DateTimePicker.test.jsx
git commit -m "Add day-then-time date picker"
```

### Task 7.2: EventEditor modal

**Files:**
- Create: `src/calendar/EventEditor.jsx`
- Create: `src/calendar/EventEditor.module.css`
- Test: `src/calendar/EventEditor.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/calendar/EventEditor.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { EventEditor } from './EventEditor'

const base = { title: '', location: '', allDay: false, start: '2026-06-02T09:00', end: '2026-06-02T10:00', notes: '', recurrence: null, reminders: [] }

describe('EventEditor', () => {
  it('saves the edited title and current fields', () => {
    const onSave = vi.fn()
    render(<EventEditor initial={base} onSave={onSave} onCancel={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Dentist' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Dentist', start: '2026-06-02T09:00' }))
  })

  it('toggles all-day and switches start to a date', () => {
    const onSave = vi.fn()
    render(<EventEditor initial={base} onSave={onSave} onCancel={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByLabelText(/all day/i))
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Holiday' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ allDay: true, start: '2026-06-02' }))
  })

  it('shows Delete only when editing an existing event', () => {
    const { rerender } = render(<EventEditor initial={base} onSave={vi.fn()} onCancel={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull()
    rerender(<EventEditor initial={{ ...base, id: 'x' }} onSave={vi.fn()} onCancel={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/calendar/EventEditor.test.jsx`
Expected: FAIL — cannot find module `./EventEditor`.

- [ ] **Step 3: Implement the component**

`src/calendar/EventEditor.jsx`:
```jsx
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

  function save() {
    onSave({
      ...(f.id ? { id: f.id } : {}),
      title: f.title, location: f.location || null, allDay: f.allDay,
      start: f.start, end: f.end, notes: f.notes || null,
      recurrence: f.recurrence, reminders: f.reminders,
    })
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
          {f.id && <button className={styles.delBtn} onClick={() => onDelete(f.id)}>Delete</button>}
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.saveBtn} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement the styles**

`src/calendar/EventEditor.module.css`:
```css
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal { width: 100%; max-width: 380px; max-height: 90vh; overflow-y: auto; background: var(--bg-card); border: 1px solid var(--rule); border-radius: 12px; padding: 20px; }
.title { font-family: var(--serif); font-size: var(--fs-md); margin: 0 0 14px; }
.label { display: block; font-family: var(--mono); font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 1px; color: var(--ink-dim); margin: 12px 0 5px; }
.input { width: 100%; box-sizing: border-box; text-align: left; background: var(--bg); border: 1px solid var(--rule); border-radius: 7px; padding: 9px 11px; color: var(--ink); font-size: var(--fs-sm); }
.input:focus { outline: none; border-color: var(--accent); }
.titleInput { font-size: var(--fs-base); border-color: rgba(255,90,54,0.5); }
.toggleRow { display: flex; align-items: center; justify-content: space-between; margin: 14px 0; font-size: var(--fs-sm); }
.two { display: flex; gap: 10px; }
.two > div { flex: 1; }
.seg { display: flex; border: 1px solid var(--rule); border-radius: 7px; overflow: hidden; }
.segItem, .segOn { flex: 1; padding: 7px 0; font-size: var(--fs-xs); color: var(--ink-dim); }
.segOn { background: var(--accent); color: var(--bg); font-weight: 600; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip, .chipOn { padding: 4px 10px; border-radius: 14px; font-size: var(--fs-xs); border: 1px solid var(--rule); color: var(--ink-dim); }
.chipOn { background: rgba(110,231,255,0.12); border-color: var(--glitch-b); color: var(--glitch-b); }
.textarea { width: 100%; box-sizing: border-box; min-height: 60px; background: var(--bg); border: 1px solid var(--rule); border-radius: 7px; padding: 9px 11px; color: var(--ink); font-size: var(--fs-sm); resize: vertical; }
.buttons { display: flex; gap: 8px; margin-top: 18px; }
.delBtn { padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,90,54,0.4); color: var(--accent); }
.cancelBtn { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--rule); color: var(--ink-dim); }
.saveBtn { flex: 1; padding: 10px; border-radius: 8px; background: var(--accent); color: var(--bg); font-weight: 600; }

/* Popover (DateTimePicker) */
.popover { margin-top: 8px; background: var(--bg); border: 1px solid var(--rule); border-radius: 10px; padding: 12px; }
.stepDots { display: flex; gap: 6px; justify-content: center; margin-bottom: 10px; }
.dot, .dotOn { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-mute); }
.dotOn { background: var(--accent); }
.pickerHead { display: flex; align-items: center; justify-content: space-between; font-family: var(--serif); margin-bottom: 8px; }
.iconBtn { width: 28px; height: 28px; border: 1px solid var(--rule); border-radius: 6px; color: var(--ink); }
.dayGrid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.dayCell { padding: 7px 0; border-radius: 6px; font-size: var(--fs-sm); color: var(--ink); }
.daySel { background: var(--accent); color: var(--bg); font-weight: 700; }
.dayMut { opacity: 0.25; }
.backLink { font-size: var(--fs-xs); color: var(--ink-dim); margin-bottom: 8px; }
.timeBig { text-align: center; font-family: var(--mono); font-size: 34px; color: var(--accent); margin: 8px 0; }
.wheels { display: flex; gap: 8px; justify-content: center; }
.wheel { height: 132px; overflow-y: auto; border: 1px solid var(--rule); border-radius: 8px; width: 60px; }
.wheelItem, .wheelOn { display: block; width: 100%; padding: 6px 0; font-family: var(--mono); font-size: var(--fs-sm); color: var(--ink-dim); }
.wheelOn { background: rgba(255,90,54,0.18); color: var(--accent); }

@media (max-width: 640px) {
  .modal { max-width: 100%; height: 100%; max-height: 100vh; border-radius: 0; }
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run src/calendar/EventEditor.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/calendar/EventEditor.jsx src/calendar/EventEditor.module.css src/calendar/EventEditor.test.jsx
git commit -m "Add event editor modal"
```

---

## Phase 8 — Wire it together (CalendarApp, route, reminders)

### Task 8.1: CalendarApp container

**Files:**
- Create: `src/calendar/CalendarApp.jsx`

- [ ] **Step 1: Implement**

`src/calendar/CalendarApp.jsx`:
```jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './Calendar.module.css'
import { api } from './api'
import { Toolbar } from './Toolbar'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import { EventEditor } from './EventEditor'
import { monthMatrix, weekDates, fmtMonthYear, addDaysDate } from './datetime'
import { computeDue } from './reminders'

function todayStr() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function CalendarApp() {
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(todayStr()) // anchor date
  const [events, setEvents] = useState([])
  const [editing, setEditing] = useState(null) // event object or null
  const today = todayStr()
  const fired = useRef(new Set())

  const [year, month] = [Number(cursor.slice(0, 4)), Number(cursor.slice(5, 7))]

  const rangeFor = useCallback(() => {
    if (view === 'month') {
      const cells = monthMatrix(year, month)
      return [cells[0].date + 'T00:00', cells[41].date + 'T23:59']
    }
    if (view === 'week') {
      const w = weekDates(cursor)
      return [w[0] + 'T00:00', w[6] + 'T23:59']
    }
    return [cursor + 'T00:00', cursor + 'T23:59']
  }, [view, year, month, cursor])

  const reload = useCallback(async () => {
    const [from, to] = rangeFor()
    const { events } = await api.list(from, to)
    setEvents(events)
  }, [rangeFor])

  useEffect(() => { reload() }, [reload])

  // In-app reminders: check once a minute while mounted.
  useEffect(() => {
    function check() {
      const now = Date.now()
      // Build ms from naive using the same UTC convention the data uses.
      const due = computeDue(events.map((e) => ({ ...e })), nowNaiveMs(), fired.current)
      for (const d of due) {
        fired.current.add(d.key)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(d.event.title, { body: `in ${d.offset} min` })
        }
      }
    }
    const id = setInterval(check, 60000)
    check()
    return () => clearInterval(id)
  }, [events])

  function nowNaiveMs() {
    const d = new Date()
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes())
  }

  function shift(delta) {
    if (view === 'month') {
      let nm = month + delta, ny = year
      if (nm < 1) { nm = 12; ny-- } else if (nm > 12) { nm = 1; ny++ }
      setCursor(`${ny}-${String(nm).padStart(2, '0')}-01`)
    } else {
      setCursor(addDaysDate(cursor, delta * (view === 'week' ? 7 : 1)))
    }
  }

  const heading = view === 'month' ? fmtMonthYear(year, month) : cursor

  async function handleSave(ev) {
    if (ev.id) await api.update(ev); else await api.create(ev)
    setEditing(null)
    reload()
  }
  async function handleDelete(id) { await api.remove(id); setEditing(null); reload() }

  function newOn(date) {
    setEditing({ title: '', location: '', allDay: false, start: `${date}T09:00`, end: `${date}T10:00`, notes: '', recurrence: null, reminders: [] })
  }

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
  }, [])

  return (
    <div className={styles.page}>
      <Toolbar heading={heading} view={view} onView={setView}
        onPrev={() => shift(-1)} onNext={() => shift(1)} onToday={() => setCursor(today)}
        onNew={() => newOn(today)} />

      {view === 'month' && <MonthView year={year} month={month} today={today} events={events} onOpenEvent={setEditing} onNewOn={newOn} />}
      {view === 'week' && <WeekView anchorDate={cursor} events={events} onOpenEvent={setEditing} />}
      {view === 'day' && <DayView date={cursor} events={events} onOpenEvent={setEditing} />}

      {editing && <EventEditor initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} onDelete={handleDelete} />}
    </div>
  )
}
```

Note: when opening an existing recurring occurrence, `editing` carries the series `id`, so Save calls `update` on the whole series (whole-series edits, per spec). The `occurrenceId` field is ignored by the editor.

- [ ] **Step 2: Commit**

```bash
git add src/calendar/CalendarApp.jsx
git commit -m "Add CalendarApp container with reminders"
```

### Task 8.2: Route wrapper with auth gate

**Files:**
- Create: `src/routes/Calendar.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement the route wrapper**

`src/routes/Calendar.jsx`:
```jsx
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
  return <CalendarApp />
}
```

- [ ] **Step 2: Register the route in App.jsx**

In `src/App.jsx`, add the import alongside the other route imports:
```jsx
import { Calendar } from './routes/Calendar'
```
And add the route inside `<Routes location={location}>`, just before the `<Route path="*" ...>` line:
```jsx
          <Route path="/calendar" element={<Calendar />} />
```

- [ ] **Step 3: Verify the build compiles and the full suite passes**

Run: `npm run build`
Expected: Vite build succeeds, no errors.
Run: `npx vitest run`
Expected: all calendar tests PASS (datetime, recurrence, validate, auth, events, client datetime, reminders, Login, Toolbar, MonthView, DateTimePicker, EventEditor).

- [ ] **Step 4: Commit**

```bash
git add src/routes/Calendar.jsx src/App.jsx
git commit -m "Register /calendar route with auth gate"
```

---

## Phase 9 — Local run + deploy config

### Task 9.1: Run locally end-to-end with netlify dev

**Files:** none (verification task)

- [ ] **Step 1: Start the local Netlify dev server**

Run: `npx netlify dev`
Expected: serves the site (Vite + functions + a local Blobs sandbox), prints a localhost URL.

- [ ] **Step 2: Manually verify the flow**

In the browser at the printed URL → `/calendar`:
- Login screen appears. Enter the passphrase you hashed in Task 0.2. → calendar loads.
- Click an empty day → editor opens → set title + time via the day→time popover → Save → chip appears.
- Reload the page → event persists (Blobs).
- Create a weekly recurring event → confirm it appears on each week in month view.
- Switch Month/Week/Day → events render in each.
- Edit then delete an event → it disappears.
- Open a private window → `/calendar` shows the login screen (no session) → confirms the gate.

- [ ] **Step 3: No code change expected; if bugs found, fix under TDD then re-commit**

### Task 9.2: Deploy configuration

**Files:**
- Modify: `netlify.toml` (only if needed — SPA fallback already routes `/calendar` to `index.html`)

- [ ] **Step 1: Confirm SPA fallback covers /calendar**

The existing `netlify.toml` has `from = "/*" → /index.html (200)`, so the client route `/calendar` already resolves. No change required. Verify by reading `netlify.toml`.

- [ ] **Step 2: Set production environment variables on Netlify**

In the Netlify dashboard (Site settings → Environment variables), add:
- `CALENDAR_PASSWORD_HASH` = the bcrypt hash from Task 0.2
- `JWT_SECRET` = a fresh random 48-byte hex string
- `HOME_TZ` = `America/New_York` (informational)

(These are NOT in git. The build/functions read them at runtime.)

- [ ] **Step 3: Deploy and smoke-test production**

Push to the deploy branch (HTTPS remote per repo git conventions). After Netlify builds:
- Visit `https://alexjwilcox.com/calendar` on desktop and on your phone (off home wifi).
- Confirm login works, an event saves and persists, and reminders prompt for notification permission.

- [ ] **Step 4: Commit any netlify.toml change (if one was needed)**

```bash
git add netlify.toml
git commit -m "Calendar deploy config"
```

---

## Self-Review Notes (completed during planning)

- **Spec coverage:** month/week/day views (Tasks 6.1–6.2, 8.1) · create/edit/delete (7.2, 8.1, 3.2) · recurring whole-series (1.2, 3.2, 7.2) · optional location (1.3, 7.2) · all-day (1.3, 7.2) · day→time picker (7.1) · in-app reminders (4.2, 8.1) · single-user JWT login (2.1–2.2, 5.1, 8.2) · Netlify Blobs (3.1) · fixed-home-tz naive convention (1.1, 4.1, throughout) · bcryptjs not native (0.1, 2.2) · optimistic reload after write (8.1). All spec requirements map to a task.
- **Type/name consistency:** `expandEvents`, `validateEvent`, `requireAuth`, `serializeCookie`, `computeDue`, `monthMatrix`, `weekDates`, `fmtTime`, `fmtMonthYear`, `addDaysDate`, the `{events}` / `{event}` response shapes, and the `occurrenceId` field are used identically across backend, frontend, and tests.
- **Out of scope (documented):** phone push reminders, per-occurrence recurrence exceptions, the Quickshell module — all deferred per the spec.
