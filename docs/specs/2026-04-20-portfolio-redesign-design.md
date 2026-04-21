# Portfolio Redesign — Design Spec

- **Date:** 2026-04-20
- **Branch:** `test`
- **Owner:** Alex J. Wilcox
- **Goal:** Replace the current static HTML/CSS portfolio with a hypermodern, immersive React frontend that serves as an enjoyable walkthrough of Alex's career and academics, dressed in an editorial + subtle hacker aesthetic.

---

## 1. Goal & Non-Goals

### Goal
A single-page-app portfolio that:
- Opens to an explorable hub (landing + tile grid) rather than a linear scroll.
- Uses an editorial + glitch visual language: dark cream-on-near-black, serif display type, monospace metadata, a single hot-orange accent, restrained RGB-glitch and scanline effects.
- Features a signature **type-on-scroll** reveal for all heading and paragraph text.
- Lives on Netlify, preserving the existing serverless chatbot and browser games.

### Non-Goals
- No CMS, no database, no auth.
- No blog / long-form writing platform in v1.
- No SSR. SEO for a personal portfolio is met with meta tags and a static `index.html`.
- No Tailwind. Plain CSS (CSS modules) for tighter control over type rhythm.
- No 3D / WebGL in v1. Held in reserve for a later iteration if needed.
- No command palette. The walkthrough metaphor is the UX — extra shells would bloat scope.
- No interactive resume page. The PDF remains the resume; the site is the narrative.

---

## 2. Decisions Log (brainstorming outcomes)

| Topic | Decision |
|---|---|
| Aesthetic direction | Phosphor terminal initially, then pivoted → **Editorial + Glitch** (dark, editorial, with subtle cyber cues) |
| Structure | **Explorable hub** (landing + tile grid), not linear scroll or chaptered cinematic |
| Framework | **Vite + React + React Router + Framer Motion** (R3F deferred) |
| Navigation | Persistent top nav, scroll-translucent, Projects dropdown with 3 categories |
| Signature interaction | Typewriter reveal on scroll (headings slower, paragraphs faster) |
| Tile count | 6 tiles (Featured, About, Academics, Experience, Projects, Contact) |
| Projects categories | Cybersecurity · Games · Other |
| Chat widget | Persistent bottom-right bubble, every page except `/contact` |
| Contact email | `alexwilcox3@icloud.com` |
| Resume | PDF-only download, no rendered web version |
| Featured tile | Pinned to Digital Cloak · C2 Server in v1 |
| Migration | Full rewrite on `test` branch, publish to Netlify `dist/`, merge when ready |

---

## 3. Architecture & Navigation

### Repository shape (after migration)
```
myWebsite/
├── src/
│   ├── main.jsx
│   ├── App.jsx                 BrowserRouter + AnimatePresence + ChatBubble
│   ├── routes/
│   │   ├── Hub.jsx
│   │   ├── About.jsx
│   │   ├── Academics.jsx
│   │   ├── Experience.jsx
│   │   ├── Projects.jsx        reads ?category= via useSearchParams
│   │   ├── Contact.jsx
│   │   └── NotFound.jsx
│   ├── components/
│   │   ├── Nav.jsx
│   │   ├── Footer.jsx
│   │   ├── Typewriter.jsx
│   │   ├── ChatBubble.jsx
│   │   ├── Cursor.jsx
│   │   ├── Tile.jsx
│   │   ├── GlitchText.jsx
│   │   ├── SectionLabel.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ScrollToTop.jsx
│   │   └── ErrorBoundary.jsx
│   ├── data/
│   │   ├── projects.js
│   │   ├── experience.js
│   │   ├── academics.js
│   │   └── about.js
│   ├── hooks/
│   │   ├── useTypewriter.js
│   │   ├── useScrollState.js
│   │   └── useReducedMotion.js
│   └── styles/
│       ├── tokens.css          color + type tokens
│       ├── reset.css
│       └── global.css
├── public/
│   ├── Games/                  (moved from root, unchanged)
│   ├── Images/                 (moved from root: PFP, certs, resume.pdf)
│   ├── favicon.ico
│   ├── robots.txt
│   ├── _headers
│   └── .well-known/security.txt
├── netlify/
│   └── functions/
│       └── chat.js             (unchanged — except system-prompt email swap)
├── netlify.toml                (updated: publish = "dist")
├── vite.config.js
├── package.json
└── index.html                  (Vite entry)
```

### Routes
| Path | Component | Notes |
|---|---|---|
| `/` | `Hub` | Landing + tile grid |
| `/about` | `About` | Long-form editorial |
| `/academics` | `Academics` | Degree + certs + clubs |
| `/experience` | `Experience` | Timeline of roles |
| `/projects` | `Projects` | Gallery, filter via `?category=cybersecurity\|games\|other` |
| `/contact` | `Contact` | Links + embedded chat + resume download |
| `*` | `NotFound` | On-brand 404 |

### Top navigation (every route)
- Order: `HOME · ABOUT · ACADEMICS · EXPERIENCE · PROJECTS ▾ · RESUME · CONTACT`, plus right-side GitHub + LinkedIn icon links.
- `PROJECTS ▾` dropdown items:
  - `Cybersecurity` → `/projects?category=cybersecurity`
  - `Games` → `/projects?category=games`
  - `Other` → `/projects?category=other`
- `RESUME` links directly to `/Images/Resume-Wilcox,A.pdf` in a new tab.
- **Scroll behavior:**
  - `scrollY < 48`: transparent background, no border
  - `scrollY ≥ 48`: `background: rgba(10,10,10,0.72)`, `backdrop-filter: blur(12px) saturate(140%)`, 1px bottom border `var(--rule)`
  - 180ms ease-out transition on both
- Height fixed at 72px to avoid layout shift.

### Hub tiles (6)
| # | Tile | Destination | Size |
|---|---|---|---|
| 01 | FEATURED — Digital Cloak · C2 Server | `/projects?category=cybersecurity` | 8 cols × 2 rows |
| 02 | ABOUT | `/about` | 4 cols × 1 row |
| 03 | ACADEMICS | `/academics` | 4 cols × 1 row |
| 04 | EXPERIENCE | `/experience` | 4 cols × 1 row |
| 05 | PROJECTS | `/projects` | 4 cols × 1 row |
| 06 | CONTACT | `/contact` | 4 cols × 1 row |

Grid layout (12-column, desktop):
- **Row 1 + Row 2:** Featured (cols 1–8, spans both rows) · About (cols 9–12, row 1) · Academics (cols 9–12, row 2)
- **Row 3:** Experience (cols 1–4) · Projects (cols 5–8) · Contact (cols 9–12)

Collapses to 1-column stack at `< 640px`; Featured remains first.

---

## 4. Visual System

### Color tokens
```css
--bg:        #0a0a0a;
--bg-card:   #0f0f0f;
--ink:       #f3f1ea;
--ink-dim:   rgba(243,241,234,0.55);
--ink-mute:  rgba(243,241,234,0.32);
--rule:      rgba(243,241,234,0.14);
--accent:    #ff5a36;
--glitch-r:  #ff5a36;
--glitch-b:  #6ee7ff;
--sel:       rgba(255,90,54,0.35);
```
Single accent, used sparingly. No gradients, no secondary accents.

### Typography
- **Display / names:** Fraunces (variable, italic available) — hero name, section titles, pull quotes.
- **Body / UI:** Inter — paragraphs, nav, buttons, labels.
- **Metadata / code:** JetBrains Mono — `[0N]` labels, dates, telemetry, file paths.
- Scale (16px base, fluid `clamp()` on display sizes):
  - `xs 12 · sm 14 · base 16 · md 20 · lg 28 · xl 44 · 2xl 72 · 3xl 120`
- Self-hosted via `@fontsource-variable/fraunces`, `@fontsource/inter`, `@fontsource/jetbrains-mono`. No external font requests (preserves CSP).

### Layout
- Max content width: 1280px, centered.
- Gutter: 32px desktop, 16px mobile.
- Grid: 12-column.
- Vertical rhythm: 8px base. Sections separated by 96–160px.
- Section boundary = thin `var(--rule)` hairline + mono section label (e.g. `[ 03 · ACADEMICS ]`).

### Hacker-cue motifs (the "spice")
| Motif | Where | Spec |
|---|---|---|
| Bracket numbers | Every section heading + tile | `[01]`, `[02]` in mono, orange, letter-spacing 1.5px |
| Build-meta strip | Top-right of hero only | `MMXXVI · v1.0 · BUILD ####` · `● Available May 2026` |
| Scanline overlay | Full-viewport fixed, behind nav | `repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,0.03) 3px 4px)` |
| RGB glitch | Hero name hover + link hover only | `text-shadow: 1px 0 var(--glitch-r), -1px 0 var(--glitch-b)` + 120ms shudder |
| Corner brackets | Hero block + featured tile only | CSS-drawn via borders; ⌐ ¬ positions |
| Orange selection | Global | `::selection { background: var(--sel); }` |

### Cursor trail
- 8px solid `var(--accent)` dot, `opacity: 0.4`, `mix-blend-mode: difference`.
- 120ms lag behind real cursor via `lerp(0.15)` per frame.
- Grows to 32px / `opacity: 0.2` when hovering an interactive element.
- Hidden when `(pointer: coarse)` or `prefers-reduced-motion: reduce`.

### Tile visual spec
- 1px `var(--rule)` border, transparent background by default.
- Padding 32px.
- Meta label `[0N]` top-left (mono, orange).
- Title Fraunces italic 28px bottom-left.
- Subtitle Inter 14px `var(--ink-dim)` below title.
- Hover: border → `rgba(243,241,234,0.4)`, `translateY(-2px)`, title gets RGB glitch shudder.
- **Featured tile** inverts: cream fill (`var(--ink)`), near-black text, orange meta label. Artwork/image can bleed edge-to-edge inside it.

### Scrollbar
- WebKit: 6px width, cream-alpha track, orange thumb.
- Firefox: `scrollbar-color: var(--accent) var(--rule)`.

---

## 5. Interaction Vocabulary

### Typewriter reveal (signature)
- Component: `<Typewriter as="h1" speed="slow">Alex Wilcox</Typewriter>`
- **Speeds:**
  - `slow` = 55ms/char (headings `h1`–`h4`)
  - `fast` = 18ms/char (paragraphs, default)
  - `flash` = 8ms/char (mono metadata / section labels)
- **Paragraph cap:** if `chars × speed > 1600ms`, accelerate so any paragraph finishes within 1.6s. Prevents reader-hostile long waits.
- **Trigger:** IntersectionObserver at `threshold: 0.3`, fires once per element. No re-trigger on scroll-up.
- **Cursor:** solid orange block (`▊`) visible during typing; blinks for 800ms after completion; then removed from DOM.
- **Layout stability:** a hidden "ghost" element renders the final text at mount so the container reserves its final height. Overlay the typing version on top. No layout shift as characters fill in.
- **Batching:** elements in a section entering together stagger — heading first, then each paragraph starts 200ms after the previous one completes. No parallel typing.
- **Accessibility:**
  - `prefers-reduced-motion: reduce` → instant reveal, no cursor, no delay.
  - The ghost element carries the real text so screen readers see the full content on mount; the typing overlay is `aria-hidden`.
  - Clicking/tapping a still-typing element skips it to completion.
- **Hook API:** `useTypewriter(text, { speed, trigger })` returns `{ displayed, isDone, skip }`. Observer lives in the `<Typewriter>` wrapper.

### Page transitions (total budget ~600ms)
- **Exit from hub** (tile click): clicked tile scales to fill viewport (500ms, `cubic-bezier(0.83,0,0.17,1)`), orange border flashes, other tiles fade + slide down 12px. Nav fixed.
- **Enter sub-experience**: expanded-tile overlay fades, revealing the sub-route hero. Hero content types in per Typewriter rules.
- **Back to hub**: sub-route fades + scales to 0.98 (200ms); hub fades in (300ms); tiles stagger in (each +40ms).
- **Between sub-routes (via nav)**: crossfade + 4px upward drift, 280ms. No tile theatrics.
- **Implementation:** `<AnimatePresence mode="wait">` at the route level. Tile-grow uses Framer Motion `layoutId` on the clicked tile matched with a target element on the sub-route hero.

### Link & button hover
- Inline links: 4px underline offset, underline animates left-to-right on hover (220ms, orange).
- Buttons / CTA: mono, bracketed (`[ DOWNLOAD RESUME ]`). Hover flips to orange fill on cream.
- Tiles: see Section 4 spec.

### Scroll engine
- Lenis smooth scroll, `lerp: 0.08`. Respects `prefers-reduced-motion: reduce` (falls back to native).

### Chat bubble interaction
- Closed state: 56px orange circle, bottom-right, `>_` glyph.
- Open state: 400×560px panel slides up + fades in (240ms).
- Escape key or outside click collapses it.
- Mounted once at `<App>` level, outside `<Routes>` — persists across navigation.
- Hidden on `/contact` route (since contact page embeds a larger chat panel).

---

## 6. Content Plan (per route)

### `/` Hub
- Hero: `Alex Wilcox` (Fraunces italic, `clamp(64px, 12vw, 180px)`) stacked vertically.
- Below name: `CYBERSECURITY · GAME DEV · HPU 2026` in JetBrains Mono.
- Top-right of hero: build-meta strip + `● Available May 2026` pill.
- Scroll indicator: four small vertical bars that taper (CSS-drawn).
- 6 tiles below the fold (see Section 3).
- Footer: email, GitHub, LinkedIn, `Built with React + Vite · 2026`.

### `/about`
- Section label: `[ 02 · ABOUT ]`
- Heading: `who I am` (Fraunces italic, typewriter `slow`)
- Portrait (PFP), grain overlay, desaturated −10%, tall editorial crop
- Three blocks, each with a mono sub-label:
  - `// origin` — path into CS + security **[PLACEHOLDER — prose from Alex]**
  - `// field` — what he cares about in the field **[PLACEHOLDER]**
  - `// off-hours` — bodybuilding & nutrition, philosophy & psychology, games **[PLACEHOLDER]**
- One pull-quote in Fraunces italic with orange left-rule **[PLACEHOLDER]**

### `/academics`
- Section label: `[ 03 · ACADEMICS ]`
- Hero line: `B.S. Computer Science — Cybersecurity Specialization · HPU · May 2026`
- Three blocks:
  - **Coursework** — 6–8 notable courses as mono-labeled chips **[PLACEHOLDER — Alex picks]**
  - **Certifications** — 4 cards:
    - CompTIA A+ (2023)
    - CompTIA Network+ (2024, valid through Jul 2028)
    - CompTIA Security+ (2025)
    - ISO/IEC 27001:2022 Lead Auditor (2025)
  - **Involvement** — Beta Theta Pi (Eta Xi chapter, since 2022) · C.O.D.E. Club (since 2024)

### `/experience`
- Section label: `[ 04 · EXPERIENCE ]`
- Vertical timeline rail, newest-first:
  - **Digital Cloak LLC · Systems Admin Intern · Summer 2025**
    - Lede (typewriter)
    - Bullets: C2 server w/ 6 subdomains · external network assessments · ethical phishing (Evilginx2, Gophish) · Red ELK telemetry
    - Tool chips (orange accent)
    - Pull-quote: "Learned more from this than any other project."
  - **High Point University · IT Desk Assistant · Aug 2024 – Jan 2025**
    - Lede
    - Bullets: hardware/software/network diagnosis · ServiceNow ticketing · escalation

### `/projects`
- Section label: `[ 05 · PROJECTS ]`
- Filter bar: `ALL · CYBERSECURITY · GAMES · OTHER` (mono, underline on active, reflects URL)
- Grid (2 cols desktop, 1 col mobile) of project cards. Single source of truth: `data/projects.js`.
- **Cybersecurity**
  - C2 Infrastructure — Covenant · Sliver · Red ELK · Metasploit · OpenVAS
  - Ethical Phishing Campaign — Evilginx2 · Gophish · Docker
  - External Network Assessment — Nmap · Burp Suite · Wireshark · OSINT
- **Games** (each links to its existing static page in `/public/Games/<name>/index.html`)
  - Buy the Sea
  - Stars in the Void
  - Countries of the World
  - A Narrow Path
  - Command Line Game
- **Other**
  - This Portfolio — React · Vite · Framer Motion · Lenis · Netlify Functions
- Card click: Framer Motion `layoutId` expands card inline to a detail panel (description, images, links). No dedicated route.

### `/contact`
- Section label: `[ 06 · CONTACT ]`
- Hero: `Let's talk.` (Fraunces italic, huge)
- Three link rows (typewriter-revealed):
  - `alexwilcox3@icloud.com`
  - `github.com/AlexJohnWilcox`
  - `linkedin.com/in/alexjwilcox`
- Embedded larger chat panel (same endpoint as the bubble).
- `[ DOWNLOAD RESUME ]` button → `/Images/Resume-Wilcox,A.pdf`.

### 404 (`*`)
- Glitched `404` in Fraunces italic.
- Mono line: `// page not found`.
- `[ GO HOME ]` CTA.

---

## 7. Technical Architecture

### Dependencies
```
runtime:
  react, react-dom                  ^18
  react-router-dom                  ^6
  framer-motion                     ^11
  @studio-freight/lenis             ^1
  @fontsource-variable/fraunces     latest
  @fontsource/inter                 latest
  @fontsource/jetbrains-mono        latest

dev:
  vite, @vitejs/plugin-react        latest
  vitest, @testing-library/react    latest
  netlify-cli                       latest
```
Deferred: Tailwind (not used), three + @react-three/fiber (not used in v1).

### Vite config
- `base: '/'`
- `build.outDir: 'dist'`
- `build.sourcemap: true`
- Alias: `@` → `src/`
- `public/` contents copied into `dist/` verbatim (`Games/`, `Images/`, `_headers`, `robots.txt`, `favicon.ico`, `.well-known/`).

### Netlify config (`netlify.toml`)
```toml
[build]
  publish = "dist"
  command = "npm run build"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
Netlify serves static files before applying the SPA redirect, so `/Games/*` paths resolve to their real `index.html` files and are not rewritten.

### Component boundaries
- `<Nav>`: subscribes to `useScrollState`; consumes React Router hooks; no knowledge of routes beyond links.
- `<Typewriter>`: pure. Props = `text`, `speed`, `trigger`, `as`. Owns observer. Exposes `onComplete`.
- `<ChatBubble>`: self-contained. State + API + storage + UI. Mounted once at `<App>` level, outside `<Routes>`, so it persists across nav.
- `<Tile>`: presentational. `{ index, title, subtitle, to, featured }`. No fetch, no routing beyond `onClick` → `navigate()`.
- Routes: composition only. Import data, arrange `<Typewriter>` blocks and primitives. No direct DOM manipulation.

### Data layer
- Pure static ES modules in `src/data/`. No fetch, no JSON, no CMS.
- `projects.js` shape:
  ```js
  {
    slug: 'c2-infrastructure',
    title: 'C2 Infrastructure',
    category: 'cybersecurity',   // 'cybersecurity' | 'games' | 'other'
    year: 2025,
    tags: ['Covenant', 'Sliver', 'Red ELK', 'Metasploit'],
    summary: '...',
    body: '...',
    links: { writeup: null, demo: null, github: null },
    images: []
  }
  ```

### Cross-route state
- Chat state: `localStorage` (`alex_chat`), read/written by `<ChatBubble>`. Matches the current implementation.
- `<ScrollToTop>` effect on route change — scrolls to 0.

### Performance budget
- Route code-splitting via `React.lazy()` + `<Suspense>`.
- Fonts subset to `latin` + `latin-ext` only.
- `<link rel="preload">` for Fraunces variable, Inter 400/600, JetBrains Mono 400.
- Images local only (no external CDNs, per CSP).
- First-load target: < 150 KB gzipped (JS + CSS) for `/`. < 80 KB for lazy routes.
- Lighthouse targets: ≥ 90 performance, 100 accessibility, ≥ 95 best practices.

### Security headers (`public/_headers`)
- Preserve existing CSP.
- Keep `'unsafe-inline'` in `script-src` for Vite's bootstrap script (simplest path).
- `connect-src 'self'` stays — chat is same-origin.
- `img-src 'self' data:` stays.
- Audit and remove unused entries during Phase 0.

### Error handling
- `<ErrorBoundary>` wraps `<Routes>`. Render errors → on-brand error page with `[ GO HOME ]`.
- Chat API errors: handled inside `<ChatBubble>` as today — inline toast.
- 404: dedicated route `path="*"`.
- No try/catch theatrics elsewhere — trust React.

### Testing (deliberately minimal for v1)
- Vitest + Testing Library for two units only:
  - `useTypewriter` — speed math, skip, reduced-motion short-circuit
  - `useScrollState` — threshold transition logic
- No full-route snapshots or visual regression.
- Manual browser pass on each route before merge.

---

## 8. Migration Plan

Branch: `test` (already pushed to `origin`).

### Phase 0 — Scaffold (single commit)
1. `git mv`:
   - `Games/` → `public/Games/`
   - `Images/` → `public/Images/`
   - `_headers` → `public/_headers`
   - `robots.txt` → `public/robots.txt`
   - `favicon.ico` → `public/favicon.ico`
   - `.well-known/` → `public/.well-known/`
2. Delete old root HTML files (`index.html`, `about.html`, `experience.html`, `projects.html`, `resume.html`, `contact.html`) and `style.css`.
3. Delete top-level `chatbot/` directory (local-only dev tooling, superseded by Netlify function; its `.env` is already gitignored).
4. `npm init -y` at root; install dependencies from Section 7.
5. Add `vite.config.js`, `src/main.jsx`, `src/App.jsx`, new `index.html` (Vite entry).
6. Update `netlify.toml` for `publish = "dist"` + SPA redirect.
7. Edit `netlify/functions/chat.js` system prompt:
   - Swap email to `alexwilcox3@icloud.com`.
   - Verify graduation / availability line still reads correctly.
8. Commit: "Scaffold Vite + React; migrate static assets into public/".
9. Smoke: `netlify dev` serves a blank hub route and the chat function locally.

### Phase 1 — Hub + visual system
- Global styles: `tokens.css`, `reset.css`, `global.css`, font imports.
- Components: `<Nav>`, `<Footer>`, `<Typewriter>`, `<Cursor>`, `<ChatBubble>`, `<ScrollToTop>`, `<ErrorBoundary>`, `<GlitchText>`, `<SectionLabel>`, `<Tile>`.
- `Hub` route: hero + tile grid, fully polished.
- Unit tests for `useTypewriter` and `useScrollState`.

### Phase 2 — Sub-experiences
- Build `/about`, `/academics`, `/experience`, `/projects`, `/contact`, `/404` one at a time.
- Populate `data/*.js` from current site content and the chatbot system prompt.
- Mark Alex-only prose as `[PLACEHOLDER]` in data files — Alex fills in later.

### Phase 3 — Transitions + polish
- Framer Motion `AnimatePresence` + `layoutId` for featured tile grow transition.
- Lenis smooth scroll + cursor trail.
- Lazy-route the non-hub pages (`React.lazy()`).
- Performance pass: Lighthouse audit, image optimization if needed, font preload verification.
- Accessibility pass: axe scan, reduced-motion verification, keyboard nav, focus rings.

### Phase 4 — Merge gate
- Deploy preview on Netlify from `test` branch.
- Manual QA checklist: every route, every tile, mobile responsive, reduced-motion mode, chat flow end-to-end, all external links.
- Merge `test` → `main` when green.

### Rollback plan
- If a regression ships, revert the merge commit. The `test` branch stays as the staging history.

---

## 9. Open Items (Alex to fill in before or during implementation)

- `/about` prose for `// origin`, `// field`, `// off-hours` sections and the pull-quote
- `/academics` coursework list (6–8 notable classes)
- Project `summary` + `body` copy for each entry in `data/projects.js`
- Any screenshots / artifacts for project detail panels (optional but recommended for cyber projects)
- Review the chatbot system prompt in `netlify/functions/chat.js` — any other facts that should change along with the email?
- Preferred commit-authorship for the migration commits (user confirmed no Claude attribution per `CLAUDE.md`)

---

## 10. Out of scope (explicit YAGNI list)

- Internationalization
- Analytics (no Plausible / GA integration)
- Contact form submission (using email + chat; no server-side form handling)
- Project detail routes (`/projects/:slug`) — using in-place expansion instead
- Blog / writing surface
- Dark/light theme toggle (dark is the identity)
- Animated background effects beyond scanline + cursor trail
- 3D / WebGL (R3F) — held in reserve for a future iteration
- Command palette (⌘K)
- Full test coverage beyond the two critical hooks
