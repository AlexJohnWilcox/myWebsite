const { getStore, connectLambda } = require('@netlify/blobs')
const { randomUUID } = require('crypto')

const PREFIX = 'events/'
// Strong consistency so a list right after a create/delete sees the change —
// the default eventual mode can serve stale reads for up to a minute.
// The local `netlify dev` Blobs sandbox has no uncachedEdgeURL and throws on
// strong reads, so fall back to eventual there (local reads aren't stale anyway).
function store() {
  const consistency = process.env.NETLIFY_DEV === 'true' ? 'eventual' : 'strong'
  return getStore({ name: 'calendar-events', consistency })
}

// Classic Lambda-signature functions don't get an auto-configured Blobs
// environment in @netlify/blobs v10+. Wire it from the context Netlify injects
// into the event (event.blobs). Guarded so tests and unlinked local dev — where
// no context is present — are a no-op rather than a thrown TypeError.
function connect(event) {
  if (event && event.blobs) connectLambda(event)
}

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

module.exports = { connect, listEvents, putEvent, deleteEvent }
