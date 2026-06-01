import { vi } from 'vitest'

vi.mock('./auth.js', () => ({ requireAuth: vi.fn(() => ({ sub: 'alex' })) }))

const store = vi.hoisted(() => [])
vi.mock('./blobs.js', () => ({
  listEvents: vi.fn(async () => store.slice()),
  putEvent: vi.fn(async (ev) => { const r = { ...ev, id: ev.id || 'new-id' }; store.push(r); return r }),
  deleteEvent: vi.fn(async (id) => { const i = store.findIndex(e => e.id === id); if (i >= 0) store.splice(i, 1) }),
}))

import { handler } from '../events.js'
import { requireAuth } from './auth.js'

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
