# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

```bash
python3 server.py
# Then open http://localhost:3000
```

No dependencies to install — uses Python stdlib only (`http.server`, `sqlite3`).

## Architecture

This is a single-page browser game with a minimal Python backend.

**Backend (`server.py`):**
- Pure stdlib HTTP server on port 3000
- Serves static files from `public/` and exposes a small REST API
- SQLite database (`sessions.db`) with a single `sessions` table tracking game results
- API endpoints:
  - `GET /api/sessions` — last 50 sessions
  - `POST /api/session/start` — creates a row, returns `{id}`
  - `POST /api/session/end` — updates row with final stats (`completed`, `gave_up`, `guessed`, `missed[]`, `seconds`)
  - `DELETE /api/session/<id>` — delete one session
  - `DELETE /api/sessions` — wipe all sessions

**Frontend (`public/game.js`):**
- All game logic runs client-side; no build step
- Country data is hardcoded in `ALL_COUNTRIES` (198 entries, each with a numeric ISO numeric ID, continent, and `alt[]` aliases)
- `TERRITORY_OF` maps dependent territory IDs → parent country ID so territories highlight alongside their sovereign state
- `MANUAL_DOT_COORDS` provides fallback lat/lon for islands too small to appear in the topojson data
- Input matching: exact lookup via `EXACT` Map (normalized strings) then Levenshtein fuzzy fallback (`maxDist` scales with word length: 0 for ≤4 chars, 1 for ≤7, 2 otherwise)
- In-progress games are persisted to `localStorage` (key `countriesGame_v1`) and restored on page load; completed/abandoned games are cleared
- Map rendered with D3 + TopoJSON, loaded from jsDelivr CDN at runtime (`world-atlas@2/countries-50m.json`)
- Country list is built dynamically grouped by continent; both list items and map paths share the same numeric country ID for coordinated highlighting

**Styling (`public/style.css`):** Dark theme using CSS custom properties defined on `:root`. No preprocessor.

## Key Conventions

- Country IDs are ISO 3166-1 numeric codes; they must match between `ALL_COUNTRIES` and the TopoJSON feature IDs
- `normalize()` strips diacritics, lowercases, and collapses punctuation/whitespace — apply it to any string before lookup or comparison
- The `sessions` table column `total` defaults to 198 (matches `ALL_COUNTRIES.length`) — update both if the country list changes
- The `missed` column stores a JSON array of country name strings
