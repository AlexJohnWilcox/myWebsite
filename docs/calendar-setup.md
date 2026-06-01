# Calendar — Setup, Deploy & Known Issues

The calendar lives at `/calendar` (unlisted — not linked in the site nav). It's a React route backed by Netlify Functions + Netlify Blobs, gated by a single-user passphrase login.

## Local development

Your local `netlify-cli` (v17) crashes on Node 26 (`SlowBuffer` was removed). Use the latest CLI:

```bash
npx netlify-cli@latest dev
```

This serves the site + functions at http://localhost:8888.

**Local Blobs needs a linked site.** Event create/read will return `server error` ("environment has not been configured to use Netlify Blobs") until you link the project to a Netlify site, because Blobs needs a `siteID`:

```bash
npx netlify-cli@latest login
npx netlify-cli@latest link      # pick/create your alexjwilcox.com site
```

After linking, `netlify dev` provisions a local Blobs sandbox and the full flow works.

**Local passphrase:** the committed `.gitignore`d `.env` uses the dev passphrase **`calendar-dev`** (bcrypt hash + a random `JWT_SECRET`). Change it freely; it never leaves your machine.

## Setting your real passphrase

```bash
node scripts/gen-password-hash.mjs 'your-strong-passphrase'   # prints a bcrypt hash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # a JWT secret
```

## Deploy (production)

1. In the Netlify dashboard → Site settings → **Environment variables**, set:
   - `CALENDAR_PASSWORD_HASH` = the bcrypt hash above
   - `JWT_SECRET` = the random hex string above
   - `HOME_TZ` = `America/New_York` (informational; see timezone note below)
   These are **not** in git.
2. Push the `calendar-app` branch and merge to your deploy branch. The existing `netlify.toml` SPA fallback already routes `/calendar` to the app; no config change needed.
3. On deployed Netlify, Blobs is configured automatically — no linking needed there.
4. Smoke-test `https://alexjwilcox.com/calendar` on desktop and phone: log in, create/edit/delete an event, confirm it persists, switch month/week/day, make a weekly recurring event.

## How it works (quick map)

- **Frontend:** `src/routes/Calendar.jsx` (auth gate) → `src/calendar/CalendarApp.jsx` (container) + `Toolbar`, `MonthView`/`WeekView`/`DayView`, `EventEditor`, `DateTimePicker`. Pure helpers: `datetime.js`, `reminders.js`, `api.js`.
- **Backend:** `netlify/functions/auth-login|auth-logout|auth-me|events` + `lib/` (`auth`, `blobs`, `recurrence`, `validate`, `datetime`). One blob per event under `events/{id}`; GET expands recurrences within the requested range.
- **Auth:** passphrase → bcrypt-checked → JWT in an httpOnly/Secure/SameSite=Strict cookie; every events call verifies it.
- **Times:** naive wall-clock strings (`YYYY-MM-DDTHH:MM`), never timezone-converted — an event always shows at the time you set it.

## Known limitations / fast-follows (v1)

These were deliberately scoped out or deferred; none block normal single-user use:

1. **Reminders only fire while the calendar tab is open** (no phone push — that was cut from v1). They show as browser notifications. A background-throttled tab can also miss the 1-minute fire window.
2. **Reminder timing uses the device's local clock**, while event times are home-timezone. If you open the calendar on a device set to another timezone, reminders fire off by the offset. Event display itself is always correct (home wall-clock). Fix later: a shared home-tz offset constant.
3. **Saves re-list from Blobs rather than updating optimistically.** Netlify Blobs `list` is eventually consistent, so a just-saved event could momentarily not appear on the immediate refresh. Rare for a single user; refresh resolves it.
4. **Whole-series recurrence edits only.** Editing a repeating event edits the whole series (from its anchor — editing one occurrence no longer shifts the series). Per-occurrence exceptions ("this event only") are a future add.
5. **Login rate-limiting is not implemented.** Protection rests on a strong passphrase + bcrypt cost factor (12). Add throttling later if desired.
6. **Quickshell desktop module** (surfacing the calendar on your Hyprland desktop) is a separate follow-up that will consume this same API.
