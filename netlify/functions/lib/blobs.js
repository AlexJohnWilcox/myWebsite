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
