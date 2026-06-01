# Calendar App — Design

**Date:** 2026-06-01
**Status:** Approved (brainstorm), pending implementation plan
**Lives in:** `myWebsite` repo, deployed at `alexjwilcox.com/calendar`

## Goal

A private, single-user calendar app served from the existing portfolio site. Accessible from any device (especially phone, on or off home wifi) via plain HTTPS — no port forwarding, no tunnel, no dependency on a home machine being powered on. Gated by a login so no one else can use it.

## Why this approach

The site is already a React 18 / Vite SPA on Netlify with serverless functions (e.g. `netlify/functions/chat.js`). Hosting the calendar here means:

- It's public HTTPS already → reachable from the phone anywhere with zero router/network config.
- Availability does not depend on a home PC being on.
- Reuses an established pattern (React route + Netlify function), no new infra accounts.

Rejected alternatives: **port forwarding** (exposes home IP + box directly to the internet) and **localhost + tunnel** (ties availability to the PC being on). Both are strictly worse for "easy phone access."

## Scope (v1)

In scope:
- Create / edit / delete events: title, optional location, all-day toggle, start/end, notes.
- Recurring events: daily / weekly / monthly with an optional "until" date. **Whole-series edits only** — editing a repeating event changes every occurrence.
- Day, week, and month views.
- In-app reminders: minute-offsets before an event; fire as browser notifications **only while the calendar tab is open**, plus a "next up" banner.
- Single-user login (just Alex), JWT session.

Explicitly out of scope (documented as later adds):
- Push reminders to the phone (would need a scheduled function + a push transport like ntfy).
- Per-occurrence recurrence exceptions ("this event only" / "this and following").
- Multi-user accounts / registration.
- The Quickshell desktop module (separate follow-up spec; will consume this app's API).

## Timezone

**Fixed home timezone.** All events are stored and displayed in Alex's home timezone regardless of the device's location. No per-event timezone data, no device-local conversion. This avoids DST/travel edge cases for v1. Store timestamps in a form that encodes the fixed zone explicitly (ISO-8601 with the home offset, or a clearly-documented convention) so display is unambiguous.

## Architecture

Three pieces, all inside `myWebsite`:

### 1. Frontend — `/calendar` React route
- New route via the existing React Router setup. **Not linked in site nav** — unlisted; reachable only by knowing the URL.
- Layout **B** (chosen in brainstorm): a single top toolbar (month nav `‹ June 2026 ›`, Month/Week/Day view switcher, `+ New` button) above a full-width grid. Same shape on phone, just narrower — nothing to hide/collapse.
- **Event editor** (chosen in brainstorm): centered modal on desktop, full-screen bottom sheet on phone. Fields: Title, Location (optional), All-day toggle, Starts, Ends, Repeat (segmented None/Daily/Weekly/Monthly — choosing a repeat reveals an optional "until" date), in-app Reminders (removable chips + add), Notes. Buttons: Delete / Cancel / Save.
- **Date/time picker** (chosen in brainstorm): clicking Starts/Ends opens a popover anchored to the field (bottom sheet on phone). Step 1 = month grid to pick a day; picking a day auto-advances to Step 2 = time selector (hour + minute wheels), with a "‹ back to day" link. A two-dot indicator shows which step is active (no "Step 1/Step 2" text labels). All-day events skip the time step.
- Styling matches the portfolio theme exactly: bg `#0a0a0a`, card `#0f0f0f`, ink `#f3f1ea`, accent `#ff5a36`, secondary `#6ee7ff`; fonts Fraunces (headings) / Inter (body) / JetBrains Mono (times). Uses the existing CSS tokens in `src/styles/tokens.css`.
- Login screen (same theme) shown when there is no valid session.
- All website changes must be responsive for laptop and phone (workspace rule).

### 2. Backend — Netlify serverless functions
Same pattern as `netlify/functions/chat.js`:
- `auth-login` — verify passphrase against the stored hash; on success issue a JWT.
- `auth-logout` — clear the session cookie.
- `auth-me` — report whether the current request has a valid session (used by the frontend to gate the UI).
- `events` — JWT-protected CRUD:
  - `GET` with a date range → returns events overlapping the range, **with recurring events expanded into concrete occurrences within that range**.
  - `POST` create, `PUT` update, `DELETE` remove. Mutations operate on the whole series for recurring events.

### 3. Storage — Netlify Blobs
- One blob per event under the key prefix `events/{id}`, value = event JSON.
- Reads list the `events/` prefix, load each, expand recurrences, and filter to the requested range in memory. Fine for a personal calendar's data volume (hundreds of events/year).
- **Consistency note:** Blobs list is eventually consistent, so an immediate re-list after a write may momentarily miss the new event. The client updates its view optimistically from the write response rather than relying on an immediate re-list.

## Data model (per event)

```json
{
  "id": "string (stable, server-generated)",
  "title": "string",
  "location": "string | null",
  "allDay": false,
  "start": "ISO-8601 (home timezone)",
  "end": "ISO-8601 (home timezone)",
  "notes": "string | null",
  "recurrence": {
    "freq": "daily | weekly | monthly",
    "interval": 1,
    "until": "ISO-8601 date | null"
  },
  "reminders": [10, 60]
}
```
- `recurrence` is `null` for one-off events.
- `reminders` is a list of minute-offsets before `start`.
- No per-occurrence override storage in v1 (whole-series edits only).

## Auth / IAM

- **Single user.** Alex's passphrase is stored as a **bcrypt hash in a Netlify environment variable** — never in code or git. Use **`bcryptjs`** (pure-JS), not native `bcrypt`, because the functions bundle with esbuild and native bcrypt does not bundle cleanly into serverless.
- Login success → a signed **JWT** set as an **httpOnly, Secure, SameSite=Strict cookie**. The JWT secret is another Netlify env var. Every `events` function verifies the JWT before touching data.
- **Real protection is a strong passphrase + a high bcrypt cost factor.** Optional best-effort login throttling (counter in Blobs) may be added, but because functions are stateless/cold and Blobs is eventually consistent it has races and must not be presented as airtight rate-limiting.
- Secrets stay out of git; verify `.gitignore` before any commit (workspace rule).

## Data flow

1. App loads `/calendar` → calls `auth-me`. No valid session → show login screen.
2. Login → `auth-login` sets the session cookie → app shows the calendar.
3. Changing view/month → `GET events?range=...` → backend lists `events/`, expands recurrences into the range, returns occurrences → grid renders.
4. Save in the editor → `POST`/`PUT events` → on success the client updates its local view optimistically from the response (not from an immediate re-list).
5. Delete → `DELETE events/{id}` → client removes locally.
6. In-app reminders: while the tab is open, a client-side timer compares upcoming occurrences against `reminders` offsets and raises a browser notification + "next up" banner.

## Error handling

- Unauthenticated request to `events` → 401; frontend drops to the login screen.
- Invalid/missing fields on create/update → 400 with a message shown in the editor.
- Blob read/write failure → 500; frontend shows a non-destructive error toast and keeps the user's unsaved input in the editor.
- Network failure on save → editor stays open with input preserved; user can retry.

## Testing (Vitest, already configured)

- **Auth:** JWT issue/verify round-trip; expired/tampered token rejected; `auth-me` reflects cookie state; passphrase verify against bcrypt hash.
- **Event CRUD:** create/read/update/delete against a mocked Blobs store; validation rejects bad input.
- **Recurrence expansion:** daily/weekly/monthly with `interval` and `until` produce the correct occurrences within a given range; whole-series edit updates the stored rule.
- **Reminder logic:** due-calculation picks the right occurrences for given offsets and "now".

## Open follow-ups (not this spec)

- Phone push reminders (scheduled function + ntfy).
- Per-occurrence recurrence exceptions.
- Quickshell desktop module consuming this API.
