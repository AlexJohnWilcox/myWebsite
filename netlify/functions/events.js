import { requireAuth } from './lib/auth.js'
import { listEvents, putEvent, deleteEvent } from './lib/blobs.js'
import { validateEvent } from './lib/validate.js'
import { expandEvents } from './lib/recurrence.js'

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
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
