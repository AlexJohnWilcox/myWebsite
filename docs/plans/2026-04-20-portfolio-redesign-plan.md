# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static HTML/CSS portfolio with a Vite + React SPA featuring an editorial + subtle-glitch aesthetic, an explorable hub landing, a signature type-on-scroll reveal, a scroll-translucent navbar with a Projects dropdown, and persistent serverless chat — preserving the existing Netlify function and browser games.

**Architecture:** Single-page app on React Router with Framer Motion for route + tile transitions. Lenis for smooth scroll. A custom `useTypewriter` hook + IntersectionObserver drives the reveal. Plain CSS (CSS Modules) with design tokens in `:root`. Static JS modules in `src/data/` are the single source of truth for content. The existing Netlify function `netlify/functions/chat.js` stays, with a one-line system-prompt edit for the updated email.

**Tech Stack:** React 18, Vite, React Router 6, Framer Motion 11, Lenis 1, Vitest + Testing Library, `@fontsource-variable/fraunces`, `@fontsource/inter`, `@fontsource/jetbrains-mono`, plain CSS Modules, Netlify deploy.

**Spec reference:** [`docs/specs/2026-04-20-portfolio-redesign-design.md`](../specs/2026-04-20-portfolio-redesign-design.md)

---

## File Structure

### Phase 0 — migration / scaffold
- **Move** (asset relocation, `git mv`):
  - `Games/` → `public/Games/`
  - `Images/` → `public/Images/`
  - `_headers` → `public/_headers`
  - `robots.txt` → `public/robots.txt`
  - `favicon.ico` → `public/favicon.ico`
  - `.well-known/` → `public/.well-known/`
- **Delete:**
  - Root HTML: `index.html`, `about.html`, `experience.html`, `projects.html`, `resume.html`, `contact.html`
  - Root CSS: `style.css`
  - Top-level `chatbot/` dir (local-only dev tooling; duplicated by Netlify function)
  - `.netlifyignore` (no longer needed — Vite ignores source via `dist/`-only publish)
- **Create (config):**
  - `package.json` — dependencies + scripts
  - `vite.config.js` — build config, alias, port
  - `index.html` — Vite entry, meta tags, font preload
  - `vitest.config.js` — test config
- **Modify:**
  - `netlify.toml` — `publish = "dist"`, SPA fallback redirect
  - `netlify/functions/chat.js` — swap contact email in system prompt; keep everything else

### Phase 1 — styles + hooks + primitives
- **Create (styles):**
  - `src/styles/tokens.css` — colour + type + radius + spacing tokens (CSS custom props)
  - `src/styles/reset.css` — minimal reset
  - `src/styles/global.css` — body, `::selection`, scrollbar, font-face imports
- **Create (hooks):**
  - `src/hooks/useScrollState.js` — window scroll threshold → boolean
  - `src/hooks/useReducedMotion.js` — `prefers-reduced-motion` → boolean
  - `src/hooks/useTypewriter.js` — char-by-char reveal w/ speed, cap, skip
  - `src/hooks/__tests__/useScrollState.test.js`
  - `src/hooks/__tests__/useTypewriter.test.js`
- **Create (primitives):**
  - `src/components/Typewriter.jsx` (+ `.module.css`) — wraps `useTypewriter` + IO observer
  - `src/components/GlitchText.jsx` (+ `.module.css`) — hover RGB shudder
  - `src/components/SectionLabel.jsx` (+ `.module.css`) — `[ 0N · TITLE ]`
  - `src/components/Cursor.jsx` (+ `.module.css`) — cursor follow dot
  - `src/components/Nav.jsx` (+ `.module.css`) — scroll-translucent, Projects dropdown
  - `src/components/Footer.jsx` (+ `.module.css`)
  - `src/components/ChatBubble.jsx` (+ `.module.css`) — persistent, ported from current chat logic
  - `src/components/Tile.jsx` (+ `.module.css`) — hub tile
  - `src/components/ProjectCard.jsx` (+ `.module.css`) — project grid card + expansion
  - `src/components/ScrollToTop.jsx`
  - `src/components/ErrorBoundary.jsx` (+ `.module.css`)
- **Create (app root):**
  - `src/main.jsx` — React entry
  - `src/App.jsx` — Router + AnimatePresence + Lenis + persistent components

### Phase 2 — data + routes
- **Create (data):**
  - `src/data/projects.js` — array of projects w/ slug, title, category, tags, summary, body, links
  - `src/data/experience.js` — array of roles
  - `src/data/academics.js` — coursework, certs, clubs
  - `src/data/about.js` — three prose sections + pull-quote
- **Create (routes):**
  - `src/routes/Hub.jsx` (+ `.module.css`)
  - `src/routes/About.jsx` (+ `.module.css`)
  - `src/routes/Academics.jsx` (+ `.module.css`)
  - `src/routes/Experience.jsx` (+ `.module.css`)
  - `src/routes/Projects.jsx` (+ `.module.css`) — `?category=` filter
  - `src/routes/Contact.jsx` (+ `.module.css`)
  - `src/routes/NotFound.jsx` (+ `.module.css`)

### Phase 3 — polish (no new files; edits to existing)
- Wire Framer Motion `AnimatePresence` + `layoutId` into `App.jsx` + `Hub.jsx`
- Add Lenis provider in `App.jsx`
- Code-split routes via `React.lazy()`
- Add font preload in `index.html`

---

## Task Overview

| # | Task | Phase |
|---|---|---|
| 1 | Relocate static assets under `public/` | 0 |
| 2 | Delete legacy root HTML/CSS and `chatbot/` dir | 0 |
| 3 | Initialize `package.json` with dependencies | 0 |
| 4 | Write `vite.config.js` + `vitest.config.js` | 0 |
| 5 | Write new `index.html` (Vite entry) with font preload | 0 |
| 6 | Write `src/main.jsx` — blank render | 0 |
| 7 | Update `netlify.toml` for SPA + `dist/` publish | 0 |
| 8 | Update Netlify function system-prompt email | 0 |
| 9 | Smoke test: `netlify dev` boots a blank page | 0 |
| 10 | Write design tokens + reset + global styles | 1 |
| 11 | `useReducedMotion` hook | 1 |
| 12 | `useScrollState` hook (TDD) | 1 |
| 13 | `useTypewriter` hook (TDD) | 1 |
| 14 | `<Typewriter>` component | 1 |
| 15 | `<GlitchText>` + `<SectionLabel>` components | 1 |
| 16 | `<Cursor>` trail component | 1 |
| 17 | `<Nav>` with Projects dropdown + scroll-translucent | 1 |
| 18 | `<Footer>` + `<ScrollToTop>` + `<ErrorBoundary>` | 1 |
| 19 | `<ChatBubble>` port from legacy chat markup | 1 |
| 20 | `<Tile>` + `<ProjectCard>` presentational components | 1 |
| 21 | `App.jsx` wiring: Router, routes, persistent components | 1 |
| 22 | Seed `data/` modules from current site + chat prompt | 2 |
| 23 | Hub route — hero + 6-tile grid | 2 |
| 24 | About route | 2 |
| 25 | Academics route | 2 |
| 26 | Experience route | 2 |
| 27 | Projects route w/ `?category=` filter + expansion | 2 |
| 28 | Contact route — links + embedded chat + resume CTA | 2 |
| 29 | NotFound route | 2 |
| 30 | Page transitions: `AnimatePresence` + `layoutId` | 3 |
| 31 | Lenis smooth scroll wiring | 3 |
| 32 | Route code-splitting (`React.lazy`) | 3 |
| 33 | Performance + accessibility pass | 3 |
| 34 | Deploy preview + merge gate | 4 |

---

## Phase 0 — Scaffold

### Task 1: Relocate static assets under `public/`

**Files:**
- Move: `Games/`, `Images/`, `_headers`, `robots.txt`, `favicon.ico`, `.well-known/` → `public/`

- [ ] **Step 1: Create `public/` and move assets preserving history**

Run:
```bash
mkdir -p public
git mv Games public/Games
git mv Images public/Images
git mv _headers public/_headers
git mv robots.txt public/robots.txt
git mv favicon.ico public/favicon.ico
git mv .well-known public/.well-known
```

Expected: `git status` shows renamed paths, not deletions.

- [ ] **Step 2: Verify no in-tree references to moved paths break**

Run:
```bash
grep -rn "/Images/" --include="*.html" --include="*.js" public/ || true
grep -rn "/Games/" --include="*.html" --include="*.js" public/ || true
```

Expected: only matches inside `public/Games/**` self-references (relative paths). The moved static HTML refs work because the files moved with their siblings; no rewrite needed.

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "Move static assets under public/ for Vite build"
```

---

### Task 2: Delete legacy root HTML/CSS and `chatbot/` dir

**Files:**
- Delete: `index.html`, `about.html`, `experience.html`, `projects.html`, `resume.html`, `contact.html`, `style.css`, `.netlifyignore`, `chatbot/`

- [ ] **Step 1: Delete legacy root files**

Run:
```bash
git rm index.html about.html experience.html projects.html resume.html contact.html style.css .netlifyignore
git rm -r chatbot
```

Expected: `git status` shows deletions staged.

- [ ] **Step 2: Confirm no lingering references**

Run:
```bash
grep -rn "style.css\|chatbot/" --include="*.toml" --include="*.js" --include="*.json" . 2>/dev/null || true
```

Expected: no matches in `netlify.toml`, `netlify/functions/**`, or anywhere else outside `.git`.

- [ ] **Step 3: Commit**

```bash
git commit -m "Remove legacy static site and local chatbot dev server"
```

---

### Task 3: Initialize `package.json` with dependencies

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create `package.json`**

Write `/home/alex/Projects/myWebsite/package.json`:

```json
{
  "name": "alex-wilcox-portfolio",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "framer-motion": "^11.3.0",
    "@studio-freight/lenis": "^1.0.42",
    "@fontsource-variable/fraunces": "^5.0.0",
    "@fontsource/inter": "^5.0.0",
    "@fontsource/jetbrains-mono": "^5.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Install**

Run:
```bash
npm install
```

Expected: `node_modules/` populated, `package-lock.json` created.

- [ ] **Step 3: Confirm lockfile committed and install succeeded**

Run:
```bash
ls package-lock.json && npm ls --depth=0 2>&1 | head -20
```

Expected: lockfile exists; top-level deps listed without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add package.json and install Vite + React deps"
```

---

### Task 4: Write `vite.config.js` + `vitest.config.js`

**Files:**
- Create: `vite.config.js`, `vitest.config.js`

- [ ] **Step 1: Write `vite.config.js`**

Write `/home/alex/Projects/myWebsite/vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
```

- [ ] **Step 2: Write `vitest.config.js`**

Write `/home/alex/Projects/myWebsite/vitest.config.js`:

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
})
```

- [ ] **Step 3: Write `src/test-setup.js`**

First, create `src/`:

```bash
mkdir -p src
```

Write `/home/alex/Projects/myWebsite/src/test-setup.js`:

```js
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Commit**

```bash
git add vite.config.js vitest.config.js src/test-setup.js
git commit -m "Add Vite + Vitest configs"
```

---

### Task 5: Write new `index.html` (Vite entry) with font preload

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write `index.html`**

Write `/home/alex/Projects/myWebsite/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0a0a" />
    <meta name="description" content="Alex J. Wilcox — cybersecurity, game development, and systems administration. Portfolio, projects, and contact." />
    <meta property="og:title" content="Alex J. Wilcox" />
    <meta property="og:description" content="Cybersecurity · Game Dev · HPU 2026" />
    <meta property="og:type" content="website" />
    <title>Alex J. Wilcox</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Note: font preload is added in Task 33 after final font files are known. Default fallbacks cover the interim.

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Add Vite index.html entry"
```

---

### Task 6: Write `src/main.jsx` — blank render

**Files:**
- Create: `src/main.jsx`, `src/App.jsx`

- [ ] **Step 1: Write `src/main.jsx`**

Write `/home/alex/Projects/myWebsite/src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 2: Write minimal `src/App.jsx`**

Write `/home/alex/Projects/myWebsite/src/App.jsx`:

```jsx
export default function App() {
  return (
    <main style={{ color: '#f3f1ea', background: '#0a0a0a', minHeight: '100vh', padding: 40 }}>
      <h1>alex.wilcox · boot ok</h1>
    </main>
  )
}
```

- [ ] **Step 3: Verify boot**

Run:
```bash
npm run dev &
sleep 2
curl -s http://localhost:5173/ | grep -i "root"
kill %1
```

Expected: HTML returned including `<div id="root"></div>`.

- [ ] **Step 4: Commit**

```bash
git add src/main.jsx src/App.jsx
git commit -m "Bootstrap React app with blank render"
```

---

### Task 7: Update `netlify.toml` for SPA + `dist/` publish

**Files:**
- Modify: `netlify.toml`

- [ ] **Step 1: Rewrite `netlify.toml`**

Write `/home/alex/Projects/myWebsite/netlify.toml`:

```toml
[build]
  publish = "dist"
  command = "npm run build"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

# SPA fallback. Static files (including /Games/**/index.html) resolve first.
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 2: Commit**

```bash
git add netlify.toml
git commit -m "Configure Netlify to publish dist/ with SPA fallback"
```

---

### Task 8: Update Netlify function system-prompt email

**Files:**
- Modify: `netlify/functions/chat.js:17` (email line in `SYSTEM_PROMPT`)

- [ ] **Step 1: Swap email**

Edit `/home/alex/Projects/myWebsite/netlify/functions/chat.js` — locate the line:

```
- Email: alex@alexwilcox.net | GitHub: AlexJohnWilcox | LinkedIn: alexjwilcox
```

Replace with:

```
- Email: alexwilcox3@icloud.com | GitHub: AlexJohnWilcox | LinkedIn: alexjwilcox
```

- [ ] **Step 2: Confirm no other occurrences of the old email**

Run:
```bash
grep -n "alex@alexwilcox.net" netlify/functions/chat.js
```

Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/chat.js
git commit -m "Update chat system prompt with current contact email"
```

---

### Task 9: Smoke test: `netlify dev` boots a blank page

**Files:** none (verification task)

- [ ] **Step 1: Install `netlify-cli` locally (optional) or use global**

Run (once):
```bash
npm i -D netlify-cli@^17
```

- [ ] **Step 2: Build and serve**

Run:
```bash
npm run build
```

Expected: `dist/` produced containing `index.html` and `assets/`. `public/Games/`, `public/Images/`, `public/_headers`, etc. copied into `dist/`.

- [ ] **Step 3: Verify assets survived the build**

Run:
```bash
ls dist/Games/BuytheSea/index.html dist/Images/Resume-Wilcox,A.pdf dist/favicon.ico dist/_headers
```

Expected: all four listed; no errors.

- [ ] **Step 4: Commit (lockfile update from netlify-cli install)**

```bash
git add package.json package-lock.json
git commit -m "Add netlify-cli dev dependency"
```

---

## Phase 1 — Styles, Hooks, Primitives

### Task 10: Write design tokens + reset + global styles

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/reset.css`, `src/styles/global.css`

- [ ] **Step 1: Write `tokens.css`**

Write `/home/alex/Projects/myWebsite/src/styles/tokens.css`:

```css
:root {
  /* colour */
  --bg:        #0a0a0a;
  --bg-card:   #0f0f0f;
  --ink:       #f3f1ea;
  --ink-dim:   rgba(243, 241, 234, 0.55);
  --ink-mute:  rgba(243, 241, 234, 0.32);
  --rule:      rgba(243, 241, 234, 0.14);
  --accent:    #ff5a36;
  --glitch-r:  #ff5a36;
  --glitch-b:  #6ee7ff;
  --sel:       rgba(255, 90, 54, 0.35);

  /* type */
  --serif: 'Fraunces Variable', 'Fraunces', Georgia, serif;
  --sans:  'Inter', system-ui, -apple-system, sans-serif;
  --mono:  'JetBrains Mono', ui-monospace, monospace;

  --fs-xs:   12px;
  --fs-sm:   14px;
  --fs-base: 16px;
  --fs-md:   20px;
  --fs-lg:   28px;
  --fs-xl:   44px;
  --fs-2xl:  72px;
  --fs-3xl:  120px;

  /* rhythm */
  --unit: 8px;

  /* layout */
  --max:    1280px;
  --gutter: 32px;
  --nav-h:  72px;

  /* motion */
  --ease:      cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-out-strong: cubic-bezier(0.83, 0, 0.17, 1);
}

@media (max-width: 640px) {
  :root {
    --gutter: 16px;
  }
}
```

- [ ] **Step 2: Write `reset.css`**

Write `/home/alex/Projects/myWebsite/src/styles/reset.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
body { line-height: 1.5; -webkit-font-smoothing: antialiased; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
button, input, select, textarea { font: inherit; color: inherit; }
a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; }
button { background: none; border: none; cursor: pointer; }
```

- [ ] **Step 3: Write `global.css`**

Write `/home/alex/Projects/myWebsite/src/styles/global.css`:

```css
@import '@fontsource-variable/fraunces/index.css';
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/jetbrains-mono/400.css';
@import './tokens.css';
@import './reset.css';

body {
  font-family: var(--sans);
  font-size: var(--fs-base);
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
  overflow-x: hidden;
}

::selection { background: var(--sel); color: var(--ink); }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--rule); }
::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }
html { scrollbar-color: var(--accent) var(--rule); scrollbar-width: thin; }

/* Scanline overlay (toggleable by media query) */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: repeating-linear-gradient(
    0deg,
    transparent 0 3px,
    rgba(255, 255, 255, 0.03) 3px 4px
  );
}

@media (prefers-reduced-motion: reduce) {
  body::after { display: none; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Import in `main.jsx`**

Edit `/home/alex/Projects/myWebsite/src/main.jsx` — add the import after React:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 5: Verify styles compile**

Run:
```bash
npm run build 2>&1 | tail -10
```

Expected: build succeeds; no CSS-import errors.

- [ ] **Step 6: Commit**

```bash
git add src/styles/ src/main.jsx
git commit -m "Add design tokens, reset, and global styles"
```

---

### Task 11: `useReducedMotion` hook

**Files:**
- Create: `src/hooks/useReducedMotion.js`

- [ ] **Step 1: Write hook**

Write `/home/alex/Projects/myWebsite/src/hooks/useReducedMotion.js`:

```js
import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useReducedMotion.js
git commit -m "Add useReducedMotion hook"
```

---

### Task 12: `useScrollState` hook (TDD)

**Files:**
- Create: `src/hooks/useScrollState.js`, `src/hooks/__tests__/useScrollState.test.js`

- [ ] **Step 1: Write failing test**

Write `/home/alex/Projects/myWebsite/src/hooks/__tests__/useScrollState.test.js`:

```js
import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollState } from '../useScrollState'

afterEach(() => {
  window.scrollY = 0
  vi.restoreAllMocks()
})

function fireScroll(y) {
  window.scrollY = y
  window.dispatchEvent(new Event('scroll'))
}

describe('useScrollState', () => {
  it('returns false when scroll is below threshold', () => {
    const { result } = renderHook(() => useScrollState(48))
    expect(result.current).toBe(false)
  })

  it('returns true when scroll crosses threshold', () => {
    const { result } = renderHook(() => useScrollState(48))
    act(() => fireScroll(100))
    expect(result.current).toBe(true)
  })

  it('returns false again after scrolling back above threshold', () => {
    const { result } = renderHook(() => useScrollState(48))
    act(() => fireScroll(200))
    act(() => fireScroll(10))
    expect(result.current).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
npm test -- useScrollState
```

Expected: FAIL with `Cannot find module '../useScrollState'`.

- [ ] **Step 3: Implement hook**

Write `/home/alex/Projects/myWebsite/src/hooks/useScrollState.js`:

```js
import { useEffect, useState } from 'react'

export function useScrollState(threshold = 48) {
  const [past, setPast] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.scrollY > threshold
  })

  useEffect(() => {
    let rafId = null
    const onScroll = () => {
      if (rafId != null) return
      rafId = requestAnimationFrame(() => {
        setPast(window.scrollY > threshold)
        rafId = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [threshold])

  return past
}
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
npm test -- useScrollState
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useScrollState.js src/hooks/__tests__/useScrollState.test.js
git commit -m "Add useScrollState hook with tests"
```

---

### Task 13: `useTypewriter` hook (TDD)

**Files:**
- Create: `src/hooks/useTypewriter.js`, `src/hooks/__tests__/useTypewriter.test.js`

- [ ] **Step 1: Write failing tests**

Write `/home/alex/Projects/myWebsite/src/hooks/__tests__/useTypewriter.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from '../useTypewriter'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useTypewriter', () => {
  it('starts empty when trigger is false', () => {
    const { result } = renderHook(() => useTypewriter('hello', { speed: 'fast', trigger: false }))
    expect(result.current.displayed).toBe('')
    expect(result.current.isDone).toBe(false)
  })

  it('types all characters when trigger is true', () => {
    const { result } = renderHook(() => useTypewriter('hi', { speed: 'fast', trigger: true }))
    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.displayed).toBe('hi')
    expect(result.current.isDone).toBe(true)
  })

  it('caps long paragraphs at 1600ms', () => {
    const long = 'x'.repeat(200) // 200 chars × 18ms = 3600ms (over cap)
    const { result } = renderHook(() => useTypewriter(long, { speed: 'fast', trigger: true }))
    act(() => { vi.advanceTimersByTime(1700) })
    expect(result.current.isDone).toBe(true)
    expect(result.current.displayed).toBe(long)
  })

  it('skip() completes instantly', () => {
    const { result } = renderHook(() => useTypewriter('hello world', { speed: 'slow', trigger: true }))
    act(() => { result.current.skip() })
    expect(result.current.displayed).toBe('hello world')
    expect(result.current.isDone).toBe(true)
  })

  it('uses slow speed for headings', () => {
    const { result } = renderHook(() => useTypewriter('abc', { speed: 'slow', trigger: true }))
    act(() => { vi.advanceTimersByTime(54) })
    expect(result.current.displayed.length).toBeLessThan(2)
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current.isDone).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
npm test -- useTypewriter
```

Expected: FAIL with `Cannot find module '../useTypewriter'`.

- [ ] **Step 3: Implement hook**

Write `/home/alex/Projects/myWebsite/src/hooks/useTypewriter.js`:

```js
import { useEffect, useRef, useState, useCallback } from 'react'

const SPEED_MAP = { slow: 55, fast: 18, flash: 8 }
const MAX_DURATION = 1600

export function useTypewriter(text, { speed = 'fast', trigger = true } = {}) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  const msPerChar = (() => {
    const base = SPEED_MAP[speed] ?? SPEED_MAP.fast
    const totalIfBase = base * text.length
    if (totalIfBase <= MAX_DURATION) return base
    return Math.max(1, MAX_DURATION / text.length)
  })()

  const stop = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const skip = useCallback(() => {
    stop()
    indexRef.current = text.length
    setDisplayed(text)
    setIsDone(true)
  }, [text])

  useEffect(() => {
    if (!trigger) {
      setDisplayed('')
      setIsDone(false)
      indexRef.current = 0
      return
    }

    const tick = () => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        setIsDone(true)
        return
      }
      timerRef.current = setTimeout(tick, msPerChar)
    }

    timerRef.current = setTimeout(tick, msPerChar)
    return stop
  }, [text, trigger, msPerChar])

  return { displayed, isDone, skip }
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run:
```bash
npm test -- useTypewriter
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTypewriter.js src/hooks/__tests__/useTypewriter.test.js
git commit -m "Add useTypewriter hook with tests"
```

---

### Task 14: `<Typewriter>` component

**Files:**
- Create: `src/components/Typewriter.jsx`, `src/components/Typewriter.module.css`

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/components/Typewriter.module.css`:

```css
.wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.ghost {
  visibility: hidden;
  white-space: pre-wrap;
}

.live {
  position: absolute;
  inset: 0;
  white-space: pre-wrap;
}

.caret {
  display: inline-block;
  width: 0.55em;
  height: 1em;
  background: var(--accent);
  vertical-align: -0.15em;
  margin-left: 0.1em;
}

.caretBlink {
  animation: blink 0.8s steps(2) 1;
}

@keyframes blink {
  50% { opacity: 0; }
}
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/components/Typewriter.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import { useTypewriter } from '@/hooks/useTypewriter'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './Typewriter.module.css'

export function Typewriter({ as: Tag = 'span', speed = 'fast', delay = 0, children, className = '', onComplete }) {
  const text = typeof children === 'string' ? children : String(children ?? '')
  const wrapRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [caretVisible, setCaretVisible] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) { setInView(true); return }
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => setInView(true), delay)
            } else {
              setInView(true)
            }
            observer.disconnect()
            return
          }
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced, delay])

  const { displayed, isDone, skip } = useTypewriter(text, { speed, trigger: inView })

  useEffect(() => {
    if (!inView) return
    setCaretVisible(true)
  }, [inView])

  useEffect(() => {
    if (!isDone) return
    if (onComplete) onComplete()
    const id = setTimeout(() => setCaretVisible(false), 800)
    return () => clearTimeout(id)
  }, [isDone, onComplete])

  if (reduced) {
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <Tag
      ref={wrapRef}
      className={`${styles.wrap} ${className}`}
      onClick={skip}
      aria-label={text}
    >
      <span className={styles.ghost} aria-hidden="true">{text}</span>
      <span className={styles.live} aria-hidden="true">
        {displayed}
        {caretVisible && (
          <span className={`${styles.caret} ${isDone ? styles.caretBlink : ''}`} />
        )}
      </span>
    </Tag>
  )
}
```

- [ ] **Step 3: Smoke-render in App**

Edit `/home/alex/Projects/myWebsite/src/App.jsx`:

```jsx
import { Typewriter } from './components/Typewriter'

export default function App() {
  return (
    <main style={{ padding: 40, minHeight: '100vh' }}>
      <Typewriter as="h1" speed="slow">Alex Wilcox</Typewriter>
      <Typewriter as="p" speed="fast">
        Cybersecurity specialist and game developer based at High Point University.
      </Typewriter>
    </main>
  )
}
```

- [ ] **Step 4: Verify visually**

Run:
```bash
npm run dev &
sleep 2
```

Open `http://localhost:5173` in a browser. Confirm:
- Heading types at ~55ms/char
- Paragraph types at ~18ms/char
- Orange caret appears during typing, blinks once, disappears
- Clicking still-typing text skips to completion

Kill: `kill %1`

- [ ] **Step 5: Commit**

```bash
git add src/components/Typewriter.jsx src/components/Typewriter.module.css src/App.jsx
git commit -m "Add Typewriter component with IntersectionObserver trigger"
```

---

### Task 15: `<GlitchText>` + `<SectionLabel>` components

**Files:**
- Create: `src/components/GlitchText.jsx` + `.module.css`, `src/components/SectionLabel.jsx` + `.module.css`

- [ ] **Step 1: Write `GlitchText.module.css`**

Write `/home/alex/Projects/myWebsite/src/components/GlitchText.module.css`:

```css
.glitch {
  display: inline-block;
  position: relative;
  transition: transform 120ms var(--ease);
}

.glitch:hover {
  text-shadow: 1px 0 var(--glitch-r), -1px 0 var(--glitch-b);
  animation: shudder 120ms steps(3);
}

@keyframes shudder {
  0%   { transform: translateX(0); }
  33%  { transform: translateX(1px); }
  66%  { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .glitch:hover { text-shadow: none; animation: none; }
}
```

- [ ] **Step 2: Write `GlitchText.jsx`**

Write `/home/alex/Projects/myWebsite/src/components/GlitchText.jsx`:

```jsx
import styles from './GlitchText.module.css'

export function GlitchText({ as: Tag = 'span', children, className = '' }) {
  return <Tag className={`${styles.glitch} ${className}`}>{children}</Tag>
}
```

- [ ] **Step 3: Write `SectionLabel.module.css`**

Write `/home/alex/Projects/myWebsite/src/components/SectionLabel.module.css`:

```css
.label {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 1.5px;
  color: var(--accent);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
}

.label::before { content: '['; opacity: 0.8; }
.label::after  { content: ']'; opacity: 0.8; }
```

- [ ] **Step 4: Write `SectionLabel.jsx`**

Write `/home/alex/Projects/myWebsite/src/components/SectionLabel.jsx`:

```jsx
import styles from './SectionLabel.module.css'

export function SectionLabel({ index, children, className = '' }) {
  const num = String(index).padStart(2, '0')
  return (
    <span className={`${styles.label} ${className}`}>
      {num} · {children}
    </span>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/GlitchText.jsx src/components/GlitchText.module.css src/components/SectionLabel.jsx src/components/SectionLabel.module.css
git commit -m "Add GlitchText and SectionLabel primitives"
```

---

### Task 16: `<Cursor>` trail component

**Files:**
- Create: `src/components/Cursor.jsx` + `.module.css`

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/components/Cursor.module.css`:

```css
.cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.4;
  mix-blend-mode: difference;
  pointer-events: none;
  z-index: 9999;
  transition: width 200ms var(--ease), height 200ms var(--ease), opacity 200ms var(--ease);
  transform: translate(-50%, -50%);
  will-change: transform;
}

.cursor.hover {
  width: 32px;
  height: 32px;
  opacity: 0.2;
}

@media (pointer: coarse) {
  .cursor { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .cursor { display: none; }
}
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/components/Cursor.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import styles from './Cursor.module.css'

export function Cursor() {
  const dotRef = useRef(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { x: target.x, y: target.y }
    let rafId = null

    const onMove = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!rafId) rafId = requestAnimationFrame(animate)
    }

    const animate = () => {
      pos.x += (target.x - pos.x) * 0.15
      pos.y += (target.y - pos.y) * 0.15
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
      }
      if (Math.abs(target.x - pos.x) > 0.1 || Math.abs(target.y - pos.y) > 0.1) {
        rafId = requestAnimationFrame(animate)
      } else {
        rafId = null
      }
    }

    const onOver = (e) => {
      const t = e.target
      if (t.closest('a, button, [role="button"], [data-interactive]')) setHovering(true)
    }
    const onOut = () => setHovering(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return <div ref={dotRef} className={`${styles.cursor} ${hovering ? styles.hover : ''}`} />
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Cursor.jsx src/components/Cursor.module.css
git commit -m "Add Cursor trail component"
```

---

### Task 17: `<Nav>` with Projects dropdown + scroll-translucent

**Files:**
- Create: `src/components/Nav.jsx` + `.module.css`

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/components/Nav.module.css`:

```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-h);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 var(--gutter);
  transition: background 180ms var(--ease), border-color 180ms var(--ease), backdrop-filter 180ms var(--ease);
  border-bottom: 1px solid transparent;
}

.nav.scrolled {
  background: rgba(10, 10, 10, 0.72);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border-bottom-color: var(--rule);
}

.inner {
  width: 100%;
  max-width: var(--max);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  font-family: var(--serif);
  font-style: italic;
  font-size: var(--fs-md);
  letter-spacing: -0.5px;
}

.links {
  display: flex;
  align-items: center;
  gap: 22px;
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.link {
  color: var(--ink-dim);
  transition: color 180ms var(--ease);
  position: relative;
  padding: 4px 0;
}

.link:hover, .link.active { color: var(--ink); }
.link.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 1px;
  background: var(--accent);
}

.spacer { flex: 1; }

.dropdownWrap { position: relative; }
.caret { margin-left: 4px; opacity: 0.6; font-size: 10px; }

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--rule);
  min-width: 200px;
  padding: 10px;
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition: opacity 180ms var(--ease), transform 180ms var(--ease);
}

.dropdownWrap:hover .dropdown,
.dropdownWrap:focus-within .dropdown {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.dropdown a {
  display: block;
  padding: 8px 10px;
  color: var(--ink-dim);
  transition: color 180ms var(--ease), background 180ms var(--ease);
}
.dropdown a:hover { color: var(--ink); background: rgba(255, 90, 54, 0.08); }

.socials { display: flex; gap: 14px; color: var(--ink-dim); }
.socials a:hover { color: var(--accent); }

.toggle { display: none; }

@media (max-width: 860px) {
  .links { display: none; }
  .toggle {
    display: block;
    font-family: var(--mono);
    font-size: var(--fs-xs);
    color: var(--ink);
    letter-spacing: 1.5px;
  }
  .nav.open .links {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: var(--nav-h);
    left: 0;
    right: 0;
    background: rgba(10, 10, 10, 0.96);
    border-bottom: 1px solid var(--rule);
    padding: 24px var(--gutter);
    gap: 18px;
    align-items: flex-start;
  }
  .nav.open .dropdown { position: static; opacity: 1; pointer-events: auto; transform: none; border: none; padding: 6px 0 0 14px; background: none; }
}
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/components/Nav.jsx`:

```jsx
import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useScrollState } from '@/hooks/useScrollState'
import styles from './Nav.module.css'

export function Nav() {
  const scrolled = useScrollState(48)
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''} ${open ? styles.open : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} onClick={close}>alex.wilcox</Link>
        <div className={styles.spacer} />
        <button className={styles.toggle} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? '[ ✕ ]' : '[ ≡ ]'}
        </button>
        <nav className={styles.links} onClick={close}>
          <NavLink to="/" end className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>About</NavLink>
          <NavLink to="/academics" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Academics</NavLink>
          <NavLink to="/experience" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Experience</NavLink>
          <div className={styles.dropdownWrap}>
            <NavLink to="/projects" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Projects <span className={styles.caret}>▾</span></NavLink>
            <div className={styles.dropdown}>
              <Link to="/projects?category=cybersecurity">Cybersecurity</Link>
              <Link to="/projects?category=games">Games</Link>
              <Link to="/projects?category=other">Other</Link>
            </div>
          </div>
          <a className={styles.link} href="/Images/Resume-Wilcox,A.pdf" target="_blank" rel="noopener noreferrer">Resume</a>
          <NavLink to="/contact" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Contact</NavLink>
          <div className={styles.socials}>
            <a href="https://github.com/AlexJohnWilcox" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GH</a>
            <a href="https://www.linkedin.com/in/alexjwilcox/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LI</a>
          </div>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.jsx src/components/Nav.module.css
git commit -m "Add scroll-translucent Nav with Projects dropdown"
```

---

### Task 18: `<Footer>` + `<ScrollToTop>` + `<ErrorBoundary>`

**Files:**
- Create: `src/components/Footer.jsx` + `.module.css`, `src/components/ScrollToTop.jsx`, `src/components/ErrorBoundary.jsx` + `.module.css`

- [ ] **Step 1: Write Footer CSS**

Write `/home/alex/Projects/myWebsite/src/components/Footer.module.css`:

```css
.foot {
  border-top: 1px solid var(--rule);
  padding: 64px var(--gutter) 40px;
  font-family: var(--mono);
  font-size: var(--fs-xs);
  color: var(--ink-dim);
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
  max-width: var(--max);
  margin: 120px auto 0;
}

.foot a { color: var(--ink-dim); }
.foot a:hover { color: var(--accent); }

.left { display: flex; gap: 18px; flex-wrap: wrap; }
```

- [ ] **Step 2: Write Footer component**

Write `/home/alex/Projects/myWebsite/src/components/Footer.jsx`:

```jsx
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.foot}>
      <div className={styles.left}>
        <a href="mailto:alexwilcox3@icloud.com">alexwilcox3@icloud.com</a>
        <a href="https://github.com/AlexJohnWilcox" target="_blank" rel="noopener noreferrer">github</a>
        <a href="https://www.linkedin.com/in/alexjwilcox/" target="_blank" rel="noopener noreferrer">linkedin</a>
      </div>
      <div>BUILT WITH REACT + VITE · {new Date().getFullYear()}</div>
    </footer>
  )
}
```

- [ ] **Step 3: Write ScrollToTop**

Write `/home/alex/Projects/myWebsite/src/components/ScrollToTop.jsx`:

```jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
```

- [ ] **Step 4: Write ErrorBoundary CSS**

Write `/home/alex/Projects/myWebsite/src/components/ErrorBoundary.module.css`:

```css
.err {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--gutter);
  text-align: center;
  gap: 16px;
}

.err h1 {
  font-family: var(--serif);
  font-style: italic;
  font-size: var(--fs-2xl);
}

.err .meta {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  color: var(--accent);
  letter-spacing: 1.5px;
}

.err .cta {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  padding: 12px 18px;
  border: 1px solid var(--ink);
  letter-spacing: 1.5px;
  margin-top: 24px;
  transition: background 180ms var(--ease), color 180ms var(--ease);
}

.err .cta:hover { background: var(--accent); color: var(--bg); border-color: var(--accent); }
```

- [ ] **Step 5: Write ErrorBoundary component**

Write `/home/alex/Projects/myWebsite/src/components/ErrorBoundary.jsx`:

```jsx
import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error) { console.error(error) }
  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.err}>
          <div className={styles.meta}>// render fault</div>
          <h1>Something broke.</h1>
          <a className={styles.cta} href="/">[ GO HOME ]</a>
        </div>
      )
    }
    return this.props.children
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/Footer.jsx src/components/Footer.module.css src/components/ScrollToTop.jsx src/components/ErrorBoundary.jsx src/components/ErrorBoundary.module.css
git commit -m "Add Footer, ScrollToTop, and ErrorBoundary"
```

---

### Task 19: `<ChatBubble>` port from legacy chat markup

**Files:**
- Create: `src/components/ChatBubble.jsx` + `.module.css`

**Reference:** legacy chat logic in the previous `index.html` (DAILY_LIMIT = 3, COOLDOWN_MS = 10000, localStorage key `alex_chat`, endpoint `/.netlify/functions/chat`). Port the behavior, redo the UI to match the new visual system.

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/components/ChatBubble.module.css`:

```css
.bubble {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 80;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.toggle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--mono);
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 200ms var(--ease), box-shadow 200ms var(--ease);
  box-shadow: 0 8px 24px rgba(255, 90, 54, 0.3);
}
.toggle:hover { transform: scale(1.06); }

.panel {
  width: min(400px, calc(100vw - 48px));
  height: min(560px, calc(100vh - 120px));
  background: var(--bg);
  border: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--rule);
  font-family: var(--mono);
  font-size: var(--fs-xs);
  color: var(--accent);
  letter-spacing: 1.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header button { color: var(--ink-dim); font-family: var(--mono); font-size: var(--fs-xs); }
.header button:hover { color: var(--ink); }

.messages {
  flex: 1;
  padding: 16px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: var(--fs-sm);
}

.msg { padding: 10px 14px; border: 1px solid var(--rule); max-width: 85%; line-height: 1.5; }
.msgUser { align-self: flex-end; background: var(--ink); color: var(--bg); border-color: var(--ink); }
.msgBot  { background: rgba(255, 255, 255, 0.02); }
.msgErr  { color: var(--accent); border-color: var(--accent); }

.typing { display: flex; gap: 5px; padding: 14px 18px; align-self: flex-start; }
.typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-dim); animation: dot 1.4s infinite; }
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }

.form { border-top: 1px solid var(--rule); padding: 12px 14px; display: flex; gap: 10px; align-items: center; }
.input { flex: 1; background: transparent; border: none; outline: none; color: var(--ink); font-family: var(--sans); font-size: var(--fs-sm); padding: 6px 4px; }
.input::placeholder { color: var(--ink-mute); }
.send { font-family: var(--mono); font-size: var(--fs-xs); letter-spacing: 1.5px; color: var(--accent); padding: 6px 10px; border: 1px solid var(--accent); }
.send:disabled { opacity: 0.4; cursor: not-allowed; }

.remaining { padding: 4px 18px 10px; font-family: var(--mono); font-size: 10px; color: var(--ink-mute); letter-spacing: 1px; text-align: center; }
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/components/ChatBubble.jsx`:

```jsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './ChatBubble.module.css'

const DAILY_LIMIT = 3
const COOLDOWN_MS = 10000
const STORAGE_KEY = 'alex_chat'
const ENDPOINT = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api/chat'
  : '/.netlify/functions/chat'

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const today = new Date().toDateString()
    if (raw.day !== today) return { day: today, count: 0, lastMsg: 0 }
    return { day: today, count: raw.count || 0, lastMsg: raw.lastMsg || 0 }
  } catch {
    return { day: new Date().toDateString(), count: 0, lastMsg: 0 }
  }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

export function ChatBubble({ embedded = false }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(embedded)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [remaining, setRemaining] = useState(DAILY_LIMIT)
  const msgsRef = useRef(null)

  useEffect(() => {
    setRemaining(Math.max(0, DAILY_LIMIT - loadState().count))
  }, [])

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages, busy])

  useEffect(() => {
    if (embedded) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [embedded])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    if (busy) return
    const state = loadState()
    if (state.count >= DAILY_LIMIT) return
    if (Date.now() - state.lastMsg < COOLDOWN_MS) {
      setMessages(m => [...m, { cls: 'err', text: 'Please wait a moment before asking another question.' }])
      return
    }
    const val = input.trim()
    if (!val) return
    setMessages(m => [...m, { cls: 'user', text: val }])
    setInput('')
    setBusy(true)
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: val }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessages(m => [...m, { cls: 'err', text: data.error || 'Something went wrong.' }])
      } else {
        setMessages(m => [...m, { cls: 'bot', text: data.reply }])
        const s = loadState()
        s.count += 1
        s.lastMsg = Date.now()
        saveState(s)
        setRemaining(Math.max(0, DAILY_LIMIT - s.count))
      }
    } catch {
      setMessages(m => [...m, { cls: 'err', text: 'Could not reach the server. Try again later.' }])
    } finally {
      setBusy(false)
    }
  }, [busy, input])

  // Hide floating widget on /contact (embedded version lives there).
  if (!embedded && pathname === '/contact') return null

  const panel = (
    <div className={styles.panel}>
      {!embedded && (
        <div className={styles.header}>
          <span>&gt; alex.chat · {remaining} left today</span>
          <button onClick={() => setOpen(false)} aria-label="Close">CLOSE</button>
        </div>
      )}
      <div ref={msgsRef} className={styles.messages}>
        {messages.length === 0 && (
          <div className={`${styles.msg} ${styles.msgBot}`}>
            Ask me anything about Alex — projects, skills, experience.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.msg} ${m.cls === 'user' ? styles.msgUser : m.cls === 'err' ? styles.msgErr : styles.msgBot}`}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className={styles.typing}>
            <span /><span /><span />
          </div>
        )}
      </div>
      <form className={styles.form} onSubmit={submit}>
        <input
          className={styles.input}
          type="text"
          value={input}
          maxLength={300}
          disabled={remaining <= 0 || busy}
          placeholder={remaining > 0 ? 'Ask me anything...' : 'No questions left today'}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className={styles.send} disabled={remaining <= 0 || busy}>[ SEND ]</button>
      </form>
      <div className={styles.remaining}>{remaining} / {DAILY_LIMIT} QUESTIONS LEFT TODAY</div>
    </div>
  )

  if (embedded) return panel

  return (
    <div className={styles.bubble}>
      {open && panel}
      <button className={styles.toggle} onClick={() => setOpen(o => !o)} aria-label="Open chat">&gt;_</button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatBubble.jsx src/components/ChatBubble.module.css
git commit -m "Add ChatBubble (persistent + embeddable)"
```

---

### Task 20: `<Tile>` + `<ProjectCard>` presentational components

**Files:**
- Create: `src/components/Tile.jsx` + `.module.css`, `src/components/ProjectCard.jsx` + `.module.css`

- [ ] **Step 1: Write `Tile.module.css`**

Write `/home/alex/Projects/myWebsite/src/components/Tile.module.css`:

```css
.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--ink);
  min-height: 220px;
  transition: border-color 180ms var(--ease), transform 180ms var(--ease);
  text-align: left;
  overflow: hidden;
}

.tile:hover {
  border-color: rgba(243, 241, 234, 0.4);
  transform: translateY(-2px);
}

.tile .title {
  font-family: var(--serif);
  font-style: italic;
  font-size: var(--fs-lg);
  line-height: 1;
  letter-spacing: -0.5px;
}

.tile .sub {
  font-family: var(--sans);
  font-size: var(--fs-sm);
  color: var(--ink-dim);
  margin-top: 6px;
}

.tile.featured {
  background: var(--ink);
  color: var(--bg);
  border: none;
  min-height: 460px;
}
.tile.featured .title { font-size: var(--fs-xl); }
.tile.featured .sub { color: rgba(10, 10, 10, 0.7); }

.tile:hover .title {
  text-shadow: 1px 0 var(--glitch-r), -1px 0 var(--glitch-b);
  animation: shudder 120ms steps(3);
}

@keyframes shudder {
  0%   { transform: translateX(0); }
  33%  { transform: translateX(1px); }
  66%  { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}
```

- [ ] **Step 2: Write `Tile.jsx`**

Write `/home/alex/Projects/myWebsite/src/components/Tile.jsx`:

```jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SectionLabel } from './SectionLabel'
import styles from './Tile.module.css'

export function Tile({ index, title, subtitle, to, featured = false }) {
  return (
    <motion.div layoutId={`tile-${index}`} className={`${styles.tile} ${featured ? styles.featured : ''}`}>
      <Link to={to} style={{ display: 'contents' }}>
        <SectionLabel index={index}>{featured ? 'FEATURED' : title}</SectionLabel>
        <div>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.sub}>{subtitle}</div>}
        </div>
      </Link>
    </motion.div>
  )
}
```

- [ ] **Step 3: Write `ProjectCard.module.css`**

Write `/home/alex/Projects/myWebsite/src/components/ProjectCard.module.css`:

```css
.card {
  border: 1px solid var(--rule);
  padding: 28px;
  cursor: pointer;
  transition: border-color 180ms var(--ease);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card:hover { border-color: rgba(243, 241, 234, 0.4); }

.meta {
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: var(--fs-xs);
  color: var(--accent);
  letter-spacing: 1.5px;
}

.title {
  font-family: var(--serif);
  font-style: italic;
  font-size: var(--fs-lg);
  letter-spacing: -0.5px;
  color: var(--ink);
}

.summary { color: var(--ink-dim); line-height: 1.6; }

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.tag {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 1px;
  padding: 4px 8px;
  border: 1px solid var(--rule);
  color: var(--ink-dim);
}

.body {
  font-size: var(--fs-sm);
  color: var(--ink-dim);
  line-height: 1.7;
  border-top: 1px solid var(--rule);
  padding-top: 18px;
  margin-top: 8px;
}

.links {
  display: flex;
  gap: 14px;
  margin-top: 14px;
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 1.5px;
}
.links a { color: var(--accent); }
.links a:hover { text-decoration: underline; }
```

- [ ] **Step 4: Write `ProjectCard.jsx`**

Write `/home/alex/Projects/myWebsite/src/components/ProjectCard.jsx`:

```jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div layout className={styles.card} onClick={() => setOpen(o => !o)} data-interactive>
      <div className={styles.meta}>
        <span>{project.category.toUpperCase()}</span>
        <span>{project.year}</span>
      </div>
      <div className={styles.title}>{project.title}</div>
      <div className={styles.summary}>{project.summary}</div>
      <div className={styles.tags}>
        {project.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className={styles.body}
          >
            <p>{project.body}</p>
            {(project.links?.github || project.links?.demo || project.links?.writeup) && (
              <div className={styles.links}>
                {project.links.demo && <a href={project.links.demo} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>[ DEMO ]</a>}
                {project.links.github && <a href={project.links.github} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>[ GITHUB ]</a>}
                {project.links.writeup && <a href={project.links.writeup} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>[ WRITEUP ]</a>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Tile.jsx src/components/Tile.module.css src/components/ProjectCard.jsx src/components/ProjectCard.module.css
git commit -m "Add Tile and ProjectCard components"
```

---

### Task 21: `App.jsx` wiring — Router, routes, persistent components

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Wire up routing and persistent pieces**

Write `/home/alex/Projects/myWebsite/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Cursor } from './components/Cursor'
import { ChatBubble } from './components/ChatBubble'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'
import { Hub } from './routes/Hub'
import { About } from './routes/About'
import { Academics } from './routes/Academics'
import { Experience } from './routes/Experience'
import { Projects } from './routes/Projects'
import { Contact } from './routes/Contact'
import { NotFound } from './routes/NotFound'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Hub />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Cursor />
        <Nav />
        <AnimatedRoutes />
        <Footer />
        <ChatBubble />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "Wire up App with Router, persistent components, and route transitions"
```

---

## Phase 2 — Data + Routes

### Task 22: Seed `data/` modules from current site + chat prompt

**Files:**
- Create: `src/data/projects.js`, `src/data/experience.js`, `src/data/academics.js`, `src/data/about.js`

- [ ] **Step 1: Write `projects.js`**

Write `/home/alex/Projects/myWebsite/src/data/projects.js`:

```js
export const projects = [
  {
    slug: 'c2-infrastructure',
    title: 'C2 Infrastructure',
    category: 'cybersecurity',
    year: 2025,
    tags: ['Covenant', 'Sliver', 'Red ELK', 'Metasploit', 'OpenVAS'],
    summary: 'Command & control server with 6 subdomains, built during a Systems Admin internship at Digital Cloak LLC.',
    body: 'Stood up and operated a full C2 environment: Covenant + Sliver as the implant frameworks, Red ELK for beacon telemetry, Metasploit and OpenVAS for enumeration. Six subdomains for payload staging, tasking, and exfil.',
    links: { writeup: null, demo: null, github: null },
    images: [],
  },
  {
    slug: 'phishing-campaign',
    title: 'Ethical Phishing Campaign',
    category: 'cybersecurity',
    year: 2025,
    tags: ['Evilginx2', 'Gophish', 'Docker'],
    summary: 'Authorized credential-harvesting engagement using Evilginx2 reverse proxy and Gophish for delivery.',
    body: 'Evilginx2 proxied a target login flow with a custom phishlet; Gophish handled target list management and delivery metrics. All infrastructure dockerized for reproducibility.',
    links: { writeup: null, demo: null, github: null },
    images: [],
  },
  {
    slug: 'external-network-assessment',
    title: 'External Network Assessment',
    category: 'cybersecurity',
    year: 2025,
    tags: ['Nmap', 'Burp Suite', 'Wireshark', 'OSINT'],
    summary: 'OSINT, vulnerability scanning, and red-team activity against an authorized external perimeter.',
    body: 'Recon via OSINT techniques, port + service discovery with Nmap, traffic analysis with Wireshark, and application-layer testing with Burp Suite.',
    links: { writeup: null, demo: null, github: null },
    images: [],
  },
  {
    slug: 'buy-the-sea',
    title: 'Buy the Sea',
    category: 'games',
    year: 2024,
    tags: ['HTML', 'Canvas', 'Vanilla JS'],
    summary: 'Idle fishing sim built from scratch, hosted here on the portfolio.',
    body: 'Canvas rendering, audio effects per catch, persistent save state via localStorage. Lots of fish.',
    links: { demo: '/Games/BuytheSea/index.html', github: null, writeup: null },
    images: [],
  },
  {
    slug: 'stars-in-the-void',
    title: 'Stars in the Void',
    category: 'games',
    year: 2024,
    tags: ['HTML', 'Vanilla JS', 'Narrative'],
    summary: 'Text-based story-driven idle game, inspired by A Dark Room.',
    body: 'Progressive narrative unlocks, atmospheric pacing, persistent save.',
    links: { demo: '/Games/StarsInTheVoid/index.html', github: null, writeup: null },
    images: [],
  },
  {
    slug: 'countries-game',
    title: 'Countries of the World',
    category: 'games',
    year: 2023,
    tags: ['HTML', 'Vanilla JS'],
    summary: 'Geography quiz — name all 197 countries before time runs out.',
    body: 'Typeahead matching, timer, country metadata lookup.',
    links: { demo: '/Games/CountriesGame/public/index.html', github: null, writeup: null },
    images: [],
  },
  {
    slug: 'narrow-path',
    title: 'A Narrow Path',
    category: 'games',
    year: 2023,
    tags: ['Mobile', 'Text Adventure'],
    summary: 'Text-based mobile game built as a class final project.',
    body: 'Branching narrative with stat-based outcomes.',
    links: { demo: null, github: null, writeup: null },
    images: [],
  },
  {
    slug: 'command-line-game',
    title: 'Command Line Game',
    category: 'games',
    year: 2022,
    tags: ['Terminal', 'First game'],
    summary: 'First-ever game — text-based adventure from intro programming class.',
    body: 'A room-based explorer. Has a soft spot.',
    links: { demo: '/Games/firstGame/index.html', github: null, writeup: null },
    images: [],
  },
  {
    slug: 'this-portfolio',
    title: 'This Portfolio',
    category: 'other',
    year: 2026,
    tags: ['React', 'Vite', 'Framer Motion', 'Lenis', 'Netlify'],
    summary: 'This site. React + Vite SPA, Netlify-hosted, with a serverless Claude chatbot.',
    body: 'Editorial + glitch visual system, type-on-scroll reveals, animated hub tiles, persistent chat using a Netlify function with IP-based rate limiting.',
    links: { github: 'https://github.com/AlexJohnWilcox/myWebsite', demo: null, writeup: null },
    images: [],
  },
]
```

- [ ] **Step 2: Write `experience.js`**

Write `/home/alex/Projects/myWebsite/src/data/experience.js`:

```js
export const experience = [
  {
    role: 'Systems Administration Intern',
    org: 'Digital Cloak LLC',
    start: 'Jun 2025',
    end: 'Aug 2025',
    lede: 'Spent the summer building and operating offensive infrastructure for authorized engagements — a C2 environment, phishing campaigns, and external network assessments.',
    bullets: [
      'Built and operated a Covenant + Sliver C2 server with 6 subdomains for staging and callback',
      'Conducted external network assessments using Nmap, Burp, and Wireshark',
      'Executed ethical phishing campaigns with Evilginx2 (reverse proxy phishlets) and Gophish',
      'Managed beacon telemetry and operator dashboards via Red ELK',
    ],
    tools: ['Covenant', 'Sliver', 'Red ELK', 'Metasploit', 'Evilginx2', 'Gophish', 'Docker', 'Nmap'],
    pullQuote: 'Learned more from this than any other project.',
  },
  {
    role: 'IT Desk Assistant',
    org: 'High Point University',
    start: 'Aug 2024',
    end: 'Jan 2025',
    lede: 'Front-line technical support for students, faculty, and staff across hardware, software, and networking.',
    bullets: [
      'Diagnosed and resolved hardware, software, and network tickets',
      'Managed tickets and escalation through ServiceNow',
      'Supported campus-wide wifi, print, and AV',
    ],
    tools: ['ServiceNow', 'Windows', 'macOS', 'Networking'],
    pullQuote: null,
  },
]
```

- [ ] **Step 3: Write `academics.js`**

Write `/home/alex/Projects/myWebsite/src/data/academics.js`:

```js
export const academics = {
  degree: 'B.S. Computer Science — Cybersecurity Specialization',
  school: 'High Point University',
  grad: 'May 2026',

  coursework: [
    // [PLACEHOLDER] — Alex to select 6–8 notable classes
    'Intro to Computer Science',
    'Data Structures',
    'Networks',
    'Operating Systems',
    'Cryptography',
    'Ethical Hacking',
  ],

  certifications: [
    { title: 'CompTIA A+',            issuer: 'CompTIA',                  year: 2023, valid: null,       verify: null },
    { title: 'CompTIA Network+',      issuer: 'CompTIA',                  year: 2024, valid: 'Jul 2028', verify: null },
    { title: 'CompTIA Security+',     issuer: 'CompTIA',                  year: 2025, valid: null,       verify: null },
    { title: 'ISO/IEC 27001:2022 Lead Auditor', issuer: 'Mastermind',     year: 2025, valid: null,       verify: null },
  ],

  involvement: [
    { name: 'Beta Theta Pi (Eta Xi chapter)', role: 'Member',   since: 2022 },
    { name: 'Computer Science Society (C.O.D.E. Club)', role: 'Member', since: 2024 },
  ],
}
```

- [ ] **Step 4: Write `about.js`**

Write `/home/alex/Projects/myWebsite/src/data/about.js`:

```js
export const about = {
  // [PLACEHOLDER] prose — Alex to rewrite
  origin: `I came into computer science expecting to make games, and ended up falling for the security side — the way everything is a system to be understood, inspected, and carefully broken on purpose. By sophomore year I was spending more time in Burp Suite than in Unity, and I haven't looked back.`,

  field: `What keeps me in cybersecurity is the pace and the craftsmanship. Pentesting rewards curiosity. Infrastructure work — C2 ops, proxies, campaign tooling — rewards care. I like both.`,

  offHours: `Outside class and work I lift, read philosophy (currently rereading Marcus Aurelius), and build small web games. I'm also a brother of Beta Theta Pi at HPU.`,

  pullQuote: 'Everything is a system to be understood.',
}
```

- [ ] **Step 5: Commit**

```bash
git add src/data/
git commit -m "Seed data modules from current site and chatbot system prompt"
```

---

### Task 23: Hub route — hero + 6-tile grid

**Files:**
- Create: `src/routes/Hub.jsx` + `.module.css`

- [ ] **Step 1: Write `Hub.module.css`**

Write `/home/alex/Projects/myWebsite/src/routes/Hub.module.css`:

```css
.page {
  padding-top: var(--nav-h);
  min-height: 100vh;
}

.hero {
  max-width: var(--max);
  margin: 0 auto;
  padding: 120px var(--gutter) 96px;
  position: relative;
}

.meta {
  position: absolute;
  top: 32px;
  right: var(--gutter);
  font-family: var(--mono);
  font-size: var(--fs-xs);
  color: var(--ink-dim);
  letter-spacing: 1.5px;
  display: flex;
  gap: 18px;
  align-items: center;
}
.avail {
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 4px 10px;
  border-radius: 999px;
}
.dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent); display: inline-block;
  margin-right: 6px;
  animation: pulse 1.8s infinite;
}
@keyframes pulse { 50% { opacity: 0.4; } }

.name {
  font-family: var(--serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(64px, 12vw, 180px);
  line-height: 0.95;
  letter-spacing: -3px;
}

.role {
  margin-top: 24px;
  font-family: var(--mono);
  font-size: var(--fs-sm);
  letter-spacing: 2px;
  color: var(--ink-dim);
  text-transform: uppercase;
}

.scrollHint {
  margin-top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--ink-mute);
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 2px;
}
.bars { display: flex; gap: 3px; align-items: flex-end; height: 18px; }
.bars span {
  width: 2px; background: var(--accent);
  animation: bars 1.4s infinite var(--ease);
}
.bars span:nth-child(1) { height: 30%; animation-delay: 0s; }
.bars span:nth-child(2) { height: 60%; animation-delay: 0.1s; }
.bars span:nth-child(3) { height: 90%; animation-delay: 0.2s; }
.bars span:nth-child(4) { height: 55%; animation-delay: 0.3s; }
@keyframes bars { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

.grid {
  max-width: var(--max);
  margin: 0 auto;
  padding: 40px var(--gutter) 80px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto auto;
  gap: 16px;
}

.grid > :global(.featured) { grid-column: 1 / span 8; grid-row: 1 / span 2; }
.grid > :nth-child(2) { grid-column: 9 / span 4; grid-row: 1; }
.grid > :nth-child(3) { grid-column: 9 / span 4; grid-row: 2; }
.grid > :nth-child(4) { grid-column: 1 / span 4; grid-row: 3; }
.grid > :nth-child(5) { grid-column: 5 / span 4; grid-row: 3; }
.grid > :nth-child(6) { grid-column: 9 / span 4; grid-row: 3; }

@media (max-width: 860px) {
  .grid { grid-template-columns: 1fr; }
  .grid > * { grid-column: 1 !important; grid-row: auto !important; }
}
```

- [ ] **Step 2: Write `Hub.jsx`**

Write `/home/alex/Projects/myWebsite/src/routes/Hub.jsx`:

```jsx
import { Tile } from '@/components/Tile'
import { Typewriter } from '@/components/Typewriter'
import styles from './Hub.module.css'

const BUILD = `MMXXVI · v1.0 · BUILD ${new Date().toISOString().slice(5, 10).replace('-', '')}`

export function Hub() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.meta}>
          <span>{BUILD}</span>
          <span className={styles.avail}><span className={styles.dot} />AVAILABLE MAY 2026</span>
        </div>
        <Typewriter as="h1" speed="slow" className={styles.name}>Alex Wilcox</Typewriter>
        <Typewriter as="div" speed="flash" className={styles.role}>
          CYBERSECURITY · GAME DEV · HPU 2026
        </Typewriter>
        <div className={styles.scrollHint}>
          <div className={styles.bars}><span /><span /><span /><span /></div>
          <span>SCROLL</span>
        </div>
      </section>

      <section className={styles.grid}>
        <Tile index={1} title="Digital Cloak · C2 Server" subtitle="Summer 2025 — Covenant · Sliver · Red ELK" to="/projects?category=cybersecurity" featured />
        <Tile index={2} title="About" subtitle="Who I am" to="/about" />
        <Tile index={3} title="Academics" subtitle="HPU · CS · Cyber spec" to="/academics" />
        <Tile index={4} title="Experience" subtitle="Roles + timeline" to="/experience" />
        <Tile index={5} title="Projects" subtitle="Security · Games · Other" to="/projects" />
        <Tile index={6} title="Contact" subtitle="Say hi" to="/contact" />
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Verify hub renders**

Run:
```bash
npm run dev &
sleep 2
```

Open `http://localhost:5173/`. Confirm:
- Hero name types in with slow cadence
- Role types in with fast cadence
- Meta line + availability pill sit top-right
- Tile grid lays out 8/4/4 + 4/4/4
- Navigating to `/about` via a tile updates URL (blank page OK until next tasks)

Kill: `kill %1`

- [ ] **Step 4: Commit**

```bash
git add src/routes/Hub.jsx src/routes/Hub.module.css
git commit -m "Add Hub route with hero and 6-tile grid"
```

---

### Task 24: About route

**Files:**
- Create: `src/routes/About.jsx` + `.module.css`

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/routes/About.module.css`:

```css
.page { padding: calc(var(--nav-h) + 80px) var(--gutter) 80px; max-width: var(--max); margin: 0 auto; }

.header { margin-bottom: 64px; }
.header h1 {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(40px, 8vw, 88px);
  letter-spacing: -2px;
  margin-top: 16px;
}

.layout { display: grid; grid-template-columns: 320px 1fr; gap: 64px; }
@media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }

.portraitWrap {
  position: sticky;
  top: calc(var(--nav-h) + 24px);
  align-self: start;
}
.portrait {
  width: 100%;
  aspect-ratio: 3 / 4;
  background: var(--bg-card);
  filter: grayscale(0.1) contrast(1.05);
  object-fit: cover;
  border: 1px solid var(--rule);
}

.block { margin-bottom: 64px; }
.subLabel {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  color: var(--accent);
  letter-spacing: 1.5px;
  display: block;
  margin-bottom: 12px;
}

.block p {
  font-size: var(--fs-md);
  line-height: 1.7;
  color: var(--ink);
}

.pull {
  font-family: var(--serif);
  font-style: italic;
  font-size: var(--fs-xl);
  line-height: 1.15;
  border-left: 3px solid var(--accent);
  padding-left: 24px;
  margin: 72px 0;
  max-width: 720px;
}
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/routes/About.jsx`:

```jsx
import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { about } from '@/data/about'
import styles from './About.module.css'

export function About() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <SectionLabel index={2}>ABOUT</SectionLabel>
        <Typewriter as="h1" speed="slow">who I am</Typewriter>
      </header>

      <div className={styles.layout}>
        <div className={styles.portraitWrap}>
          <img className={styles.portrait} src="/Images/PFP" alt="Alex J. Wilcox" />
        </div>

        <div>
          <div className={styles.block}>
            <span className={styles.subLabel}>// origin</span>
            <Typewriter as="p" speed="fast">{about.origin}</Typewriter>
          </div>

          <blockquote className={styles.pull}>{about.pullQuote}</blockquote>

          <div className={styles.block}>
            <span className={styles.subLabel}>// field</span>
            <Typewriter as="p" speed="fast">{about.field}</Typewriter>
          </div>

          <div className={styles.block}>
            <span className={styles.subLabel}>// off-hours</span>
            <Typewriter as="p" speed="fast">{about.offHours}</Typewriter>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/About.jsx src/routes/About.module.css
git commit -m "Add About route"
```

---

### Task 25: Academics route

**Files:**
- Create: `src/routes/Academics.jsx` + `.module.css`

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/routes/Academics.module.css`:

```css
.page { padding: calc(var(--nav-h) + 80px) var(--gutter) 80px; max-width: var(--max); margin: 0 auto; }

.header h1 {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(36px, 7vw, 72px);
  letter-spacing: -1.5px;
  margin-top: 16px;
}

.hero {
  margin-top: 24px;
  font-family: var(--mono);
  font-size: var(--fs-md);
  color: var(--ink-dim);
  padding-bottom: 48px;
  border-bottom: 1px solid var(--rule);
}

.section { margin: 72px 0; }
.sectionHead {
  font-family: var(--serif);
  font-style: italic;
  font-size: var(--fs-xl);
  letter-spacing: -1px;
  margin-bottom: 32px;
}

.courseGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.courseChip {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 1px;
  padding: 8px 14px;
  border: 1px solid var(--rule);
  color: var(--ink-dim);
}

.certs { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
.cert {
  border: 1px solid var(--rule);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cert .meta {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  color: var(--accent);
  letter-spacing: 1.5px;
}
.cert h3 {
  font-family: var(--serif);
  font-style: italic;
  font-size: var(--fs-lg);
  letter-spacing: -0.5px;
}
.cert .valid {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink-mute);
  margin-top: 4px;
}

.invList { display: flex; flex-direction: column; gap: 12px; }
.invItem {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--rule);
  font-family: var(--sans);
}
.invItem .meta { font-family: var(--mono); font-size: var(--fs-xs); color: var(--ink-mute); letter-spacing: 1.5px; }
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/routes/Academics.jsx`:

```jsx
import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { academics } from '@/data/academics'
import styles from './Academics.module.css'

export function Academics() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <SectionLabel index={3}>ACADEMICS</SectionLabel>
        <Typewriter as="h1" speed="slow">{academics.degree}</Typewriter>
      </header>

      <Typewriter as="div" speed="fast" className={styles.hero}>
        {academics.school} · {academics.grad}
      </Typewriter>

      <section className={styles.section}>
        <h2 className={styles.sectionHead}>Coursework</h2>
        <div className={styles.courseGrid}>
          {academics.coursework.map(c => <span key={c} className={styles.courseChip}>{c}</span>)}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHead}>Certifications</h2>
        <div className={styles.certs}>
          {academics.certifications.map(c => (
            <div key={c.title} className={styles.cert}>
              <span className={styles.meta}>{c.year}</span>
              <h3>{c.title}</h3>
              <div style={{ color: 'var(--ink-dim)' }}>{c.issuer}</div>
              {c.valid && <div className={styles.valid}>VALID THROUGH {c.valid.toUpperCase()}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHead}>Involvement</h2>
        <div className={styles.invList}>
          {academics.involvement.map(i => (
            <div key={i.name} className={styles.invItem}>
              <span>{i.name}</span>
              <span className={styles.meta}>SINCE {i.since}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/Academics.jsx src/routes/Academics.module.css
git commit -m "Add Academics route"
```

---

### Task 26: Experience route

**Files:**
- Create: `src/routes/Experience.jsx` + `.module.css`

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/routes/Experience.module.css`:

```css
.page { padding: calc(var(--nav-h) + 80px) var(--gutter) 80px; max-width: var(--max); margin: 0 auto; }

.header h1 {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(40px, 8vw, 88px);
  letter-spacing: -2px;
  margin-top: 16px;
}

.timeline {
  margin-top: 64px;
  position: relative;
  padding-left: 32px;
  border-left: 1px solid var(--rule);
}

.node {
  position: absolute;
  left: -6px;
  top: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg);
  border: 2px solid var(--accent);
  box-shadow: 0 0 10px rgba(255, 90, 54, 0.5);
}

.role {
  margin-bottom: 96px;
  position: relative;
}

.role .dates {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 1.5px;
  color: var(--accent);
}

.role h2 {
  font-family: var(--serif);
  font-style: italic;
  font-size: var(--fs-xl);
  letter-spacing: -1px;
  margin-top: 6px;
}

.role .org { font-family: var(--mono); font-size: var(--fs-sm); color: var(--ink-dim); margin-top: 4px; letter-spacing: 1px; }

.role .lede { margin-top: 24px; font-size: var(--fs-md); line-height: 1.7; max-width: 720px; }

.role ul { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; max-width: 720px; }
.role li {
  padding-left: 22px;
  position: relative;
  color: var(--ink-dim);
  line-height: 1.6;
}
.role li::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-family: var(--mono);
}

.tools { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
.tool {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  padding: 4px 10px;
  border: 1px solid var(--accent);
  color: var(--accent);
  letter-spacing: 1px;
}

.pull {
  font-family: var(--serif);
  font-style: italic;
  font-size: var(--fs-lg);
  border-left: 3px solid var(--accent);
  padding-left: 20px;
  margin-top: 36px;
  color: var(--ink);
  max-width: 640px;
}
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/routes/Experience.jsx`:

```jsx
import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { experience } from '@/data/experience'
import styles from './Experience.module.css'

export function Experience() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <SectionLabel index={4}>EXPERIENCE</SectionLabel>
        <Typewriter as="h1" speed="slow">the work.</Typewriter>
      </header>

      <div className={styles.timeline}>
        {experience.map(e => (
          <article key={e.role + e.org} className={styles.role}>
            <span className={styles.node} />
            <div className={styles.dates}>{e.start} — {e.end}</div>
            <h2>{e.role}</h2>
            <div className={styles.org}>{e.org}</div>
            <Typewriter as="p" speed="fast" className={styles.lede}>{e.lede}</Typewriter>
            <ul>
              {e.bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
            <div className={styles.tools}>
              {e.tools.map(t => <span key={t} className={styles.tool}>{t}</span>)}
            </div>
            {e.pullQuote && <blockquote className={styles.pull}>{e.pullQuote}</blockquote>}
          </article>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/Experience.jsx src/routes/Experience.module.css
git commit -m "Add Experience route with timeline"
```

---

### Task 27: Projects route w/ `?category=` filter + expansion

**Files:**
- Create: `src/routes/Projects.jsx` + `.module.css`

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/routes/Projects.module.css`:

```css
.page { padding: calc(var(--nav-h) + 80px) var(--gutter) 80px; max-width: var(--max); margin: 0 auto; }

.header h1 {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(40px, 8vw, 88px);
  letter-spacing: -2px;
  margin-top: 16px;
}

.filter {
  margin-top: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--rule);
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 1.5px;
}

.filter button {
  color: var(--ink-dim);
  text-transform: uppercase;
  padding: 4px 0;
  position: relative;
  transition: color 180ms var(--ease);
}
.filter button:hover { color: var(--ink); }
.filter button.active { color: var(--ink); }
.filter button.active::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  bottom: -4px;
  height: 1px;
  background: var(--accent);
}

.grid {
  margin-top: 48px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }

.empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--ink-dim);
  font-family: var(--mono);
  font-size: var(--fs-sm);
  letter-spacing: 1.5px;
}
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/routes/Projects.jsx`:

```jsx
import { useSearchParams } from 'react-router-dom'
import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { ProjectCard } from '@/components/ProjectCard'
import { projects } from '@/data/projects'
import styles from './Projects.module.css'

const FILTERS = [
  { key: 'all',           label: 'All' },
  { key: 'cybersecurity', label: 'Cybersecurity' },
  { key: 'games',         label: 'Games' },
  { key: 'other',         label: 'Other' },
]

export function Projects() {
  const [params, setParams] = useSearchParams()
  const active = params.get('category') || 'all'

  const visible = active === 'all'
    ? projects
    : projects.filter(p => p.category === active)

  const setActive = (key) => {
    if (key === 'all') setParams({}, { replace: false })
    else setParams({ category: key }, { replace: false })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <SectionLabel index={5}>PROJECTS</SectionLabel>
        <Typewriter as="h1" speed="slow">Selected work.</Typewriter>
      </header>

      <div className={styles.filter}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={f.key === active ? styles.active : ''}
            onClick={() => setActive(f.key)}
            data-interactive
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>// no projects in this category yet</div>
      ) : (
        <div className={styles.grid}>
          {visible.map(p => <ProjectCard key={p.slug} project={p} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/Projects.jsx src/routes/Projects.module.css
git commit -m "Add Projects route with category filter and expandable cards"
```

---

### Task 28: Contact route — links + embedded chat + resume CTA

**Files:**
- Create: `src/routes/Contact.jsx` + `.module.css`

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/routes/Contact.module.css`:

```css
.page { padding: calc(var(--nav-h) + 80px) var(--gutter) 80px; max-width: var(--max); margin: 0 auto; }

.header h1 {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(48px, 12vw, 160px);
  letter-spacing: -3px;
  margin-top: 16px;
}

.layout {
  margin-top: 72px;
  display: grid;
  grid-template-columns: 1fr 440px;
  gap: 48px;
}
@media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }

.links {
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-top: 1px solid var(--rule);
}
.links a {
  display: flex;
  justify-content: space-between;
  padding: 24px 0;
  border-bottom: 1px solid var(--rule);
  font-family: var(--sans);
  font-size: var(--fs-md);
  transition: color 180ms var(--ease), padding-left 180ms var(--ease);
}
.links a:hover { color: var(--accent); padding-left: 12px; }
.links a::after {
  content: '→';
  color: var(--accent);
  font-family: var(--mono);
}

.cta {
  margin-top: 48px;
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 1.5px;
  padding: 14px 22px;
  border: 1px solid var(--ink);
  display: inline-block;
  transition: background 180ms var(--ease), color 180ms var(--ease);
}
.cta:hover { background: var(--accent); color: var(--bg); border-color: var(--accent); }

.chatShell {
  height: 560px;
  border: 1px solid var(--rule);
  overflow: hidden;
  display: flex;
}
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/routes/Contact.jsx`:

```jsx
import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { ChatBubble } from '@/components/ChatBubble'
import styles from './Contact.module.css'

export function Contact() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <SectionLabel index={6}>CONTACT</SectionLabel>
        <Typewriter as="h1" speed="slow">Let's talk.</Typewriter>
      </header>

      <div className={styles.layout}>
        <div>
          <div className={styles.links}>
            <a href="mailto:alexwilcox3@icloud.com">alexwilcox3@icloud.com</a>
            <a href="https://github.com/AlexJohnWilcox" target="_blank" rel="noopener noreferrer">github.com/AlexJohnWilcox</a>
            <a href="https://www.linkedin.com/in/alexjwilcox/" target="_blank" rel="noopener noreferrer">linkedin.com/in/alexjwilcox</a>
          </div>
          <a className={styles.cta} href="/Images/Resume-Wilcox,A.pdf" target="_blank" rel="noopener noreferrer">[ DOWNLOAD RESUME ]</a>
        </div>

        <div className={styles.chatShell}>
          <ChatBubble embedded />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/Contact.jsx src/routes/Contact.module.css
git commit -m "Add Contact route with embedded chat"
```

---

### Task 29: NotFound route

**Files:**
- Create: `src/routes/NotFound.jsx` + `.module.css`

- [ ] **Step 1: Write CSS**

Write `/home/alex/Projects/myWebsite/src/routes/NotFound.module.css`:

```css
.wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: var(--gutter);
  text-align: center;
}

.code {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(120px, 24vw, 300px);
  letter-spacing: -6px;
  line-height: 1;
  text-shadow: 2px 0 var(--glitch-r), -2px 0 var(--glitch-b);
}

.meta {
  font-family: var(--mono);
  font-size: var(--fs-xs);
  color: var(--ink-dim);
  letter-spacing: 2px;
}

.cta {
  margin-top: 24px;
  font-family: var(--mono);
  font-size: var(--fs-xs);
  letter-spacing: 1.5px;
  padding: 14px 22px;
  border: 1px solid var(--ink);
  transition: background 180ms var(--ease), color 180ms var(--ease);
}
.cta:hover { background: var(--accent); color: var(--bg); border-color: var(--accent); }
```

- [ ] **Step 2: Write component**

Write `/home/alex/Projects/myWebsite/src/routes/NotFound.jsx`:

```jsx
import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export function NotFound() {
  return (
    <div className={styles.wrap}>
      <div className={styles.code}>404</div>
      <div className={styles.meta}>// PAGE NOT FOUND</div>
      <Link to="/" className={styles.cta}>[ GO HOME ]</Link>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/NotFound.jsx src/routes/NotFound.module.css
git commit -m "Add 404 NotFound route"
```

---

## Phase 3 — Polish

### Task 30: Page transitions: shared `layoutId` for featured tile

**Files:**
- Modify: `src/routes/Hub.jsx` (already has `motion.div` via `<Tile>`). No new transitions are needed beyond what is already in `App.jsx` (crossfade + drift). The `layoutId` on `<Tile>` was added in Task 20; confirm behavior end-to-end.

- [ ] **Step 1: Browser-verify crossfade is working**

Run:
```bash
npm run dev &
sleep 2
```

Open `http://localhost:5173/`. Click each tile; watch for the 280ms crossfade + 4px drift (the `AnimatePresence mode="wait"` in `App.jsx`). Use the back button; confirm return is smooth.

Kill: `kill %1`

- [ ] **Step 2: Commit (no code changes — marker)**

```bash
git commit --allow-empty -m "Verify page transitions end-to-end"
```

---

### Task 31: Lenis smooth scroll wiring

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add Lenis hook**

Edit `/home/alex/Projects/myWebsite/src/App.jsx` — add imports:

```jsx
import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
```

And inside `App`, before the return:

```jsx
export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.08 })
    let rafId
    const raf = (t) => {
      lenis.raf(t)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <BrowserRouter>
      <ErrorBoundary>
        {/* ...unchanged... */}
      </ErrorBoundary>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Browser-verify**

Run:
```bash
npm run dev &
sleep 2
```

Scroll `http://localhost:5173/`. Confirm feel: gently damped, not native.

- [ ] **Step 3: Verify reduced-motion fallback**

In Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`. Scroll; it should snap (native).

Kill: `kill %1`

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "Wire Lenis smooth scroll with reduced-motion fallback"
```

---

### Task 32: Route code-splitting (`React.lazy`)

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Swap static imports for lazy**

Edit `/home/alex/Projects/myWebsite/src/App.jsx` — replace the route imports:

Remove:
```jsx
import { Hub } from './routes/Hub'
import { About } from './routes/About'
import { Academics } from './routes/Academics'
import { Experience } from './routes/Experience'
import { Projects } from './routes/Projects'
import { Contact } from './routes/Contact'
import { NotFound } from './routes/NotFound'
```

Add:
```jsx
import { lazy, Suspense } from 'react'

const Hub = lazy(() => import('./routes/Hub').then(m => ({ default: m.Hub })))
const About = lazy(() => import('./routes/About').then(m => ({ default: m.About })))
const Academics = lazy(() => import('./routes/Academics').then(m => ({ default: m.Academics })))
const Experience = lazy(() => import('./routes/Experience').then(m => ({ default: m.Experience })))
const Projects = lazy(() => import('./routes/Projects').then(m => ({ default: m.Projects })))
const Contact = lazy(() => import('./routes/Contact').then(m => ({ default: m.Contact })))
const NotFound = lazy(() => import('./routes/NotFound').then(m => ({ default: m.NotFound })))
```

And wrap `<Routes>` in `<Suspense>`:

```jsx
<Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
  <Routes location={location}>
    {/* unchanged */}
  </Routes>
</Suspense>
```

- [ ] **Step 2: Verify build produces split chunks**

Run:
```bash
npm run build
```

Expected: `dist/assets/` contains multiple JS chunks (one per route), not one megabundle.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Code-split routes with React.lazy"
```

---

### Task 33: Performance + accessibility pass

**Files:**
- Modify: `index.html` (font preload), potentially `public/_headers` (CSP audit)

- [ ] **Step 1: Add font preload hints to `index.html`**

Check actual font file names after build:

```bash
ls dist/assets/ | grep -iE "woff|ttf"
```

Then edit `/home/alex/Projects/myWebsite/index.html` `<head>` to add preload hints for the most critical weights. Example (adjust hrefs to match the hashed filenames Vite produces — use a resource hint pattern that works regardless of hash: preload at runtime via the loader below, not hard-coded):

Add inside `<head>`:

```html
<!-- Preload critical weights via JS after initial parse -->
<script>
  (function () {
    const fonts = [
      '/assets/fraunces-latin-variable-wghtOpszSOFT-italic.woff2',
      '/assets/inter-latin-400-normal.woff2',
      '/assets/inter-latin-600-normal.woff2',
      '/assets/jetbrains-mono-latin-400-normal.woff2'
    ];
    for (const href of fonts) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = href;
      document.head.appendChild(link);
    }
  })();
</script>
```

Note: `@fontsource/*` packages copy font files into the build with predictable names (no content-hash for the font files themselves, only the CSS that references them). Verify the filenames after first build and adjust the paths above.

- [ ] **Step 2: Run Lighthouse locally against `dist/`**

Run:
```bash
npm run build
npx serve dist -p 4173 &
sleep 2
npx lighthouse http://localhost:4173 --preset=desktop --output=html --output-path=/tmp/lh-report.html --quiet --chrome-flags="--headless=new"
```

Open `/tmp/lh-report.html`. Expected: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90.

Kill: `kill %1`

- [ ] **Step 3: Manual a11y pass**

Verify in browser:
- Keyboard nav: Tab through nav, hub tiles, project cards; focus ring visible.
- `prefers-reduced-motion`: typewriter reveals instantly, scanlines hidden, cursor trail hidden.
- Color contrast: cream on near-black passes WCAG AA for body text.
- Screen reader: `aria-label` on Typewriter elements carries full text; chat toggle + close buttons have `aria-label`.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add font preload hints and verify Lighthouse targets"
```

---

## Phase 4 — Merge Gate

### Task 34: Deploy preview + merge gate

**Files:** none (operational)

- [ ] **Step 1: Push the `test` branch**

Run:
```bash
git push origin test
```

- [ ] **Step 2: Open Netlify deploy preview**

In Netlify's dashboard, find the `test`-branch deploy preview URL.

- [ ] **Step 3: Manual QA on the preview**

Go through this checklist on the deploy preview:
- [ ] Every route renders (`/`, `/about`, `/academics`, `/experience`, `/projects`, `/projects?category=cybersecurity`, `/projects?category=games`, `/projects?category=other`, `/contact`, random `/foo` → 404)
- [ ] Every tile on `/` navigates to the right place
- [ ] Nav dropdown Projects > Cybersecurity/Games/Other works
- [ ] Scroll-translucent navbar transitions cleanly
- [ ] Typewriter reveals fire on every heading/paragraph entering viewport
- [ ] Cursor trail visible on desktop, hidden on touch devices
- [ ] Chat bubble appears on every route except `/contact`; chat endpoint responds
- [ ] Chat rate limiter returns 429 after 5 requests/min (manual probe)
- [ ] `/contact` embedded chat works
- [ ] Resume PDF download works via the nav link + the contact CTA
- [ ] `/Games/BuytheSea/`, `/Games/CountriesGame/public/`, `/Games/StarsInTheVoid/`, `/Games/firstGame/` all still load (unchanged legacy games)
- [ ] Mobile viewport (375px): nav collapses, hub stacks, text scales
- [ ] Reduced-motion: everything instant, no cursor trail, no scanlines

- [ ] **Step 4: Merge when green**

When the QA checklist passes:

```bash
git checkout main
git merge test --no-ff -m "Merge portfolio redesign (React + Vite)"
git push origin main
```

Netlify production deploys automatically.

- [ ] **Step 5: Verify production**

Visit the production URL; repeat a spot-check of the checklist above.

---

## Summary

- **Phase 0 (Tasks 1–9):** migration + scaffold — blank React boots, Netlify config updated, assets relocated
- **Phase 1 (Tasks 10–21):** visual system, hooks (with tests for the two signature pieces), primitives, chat, persistent app shell
- **Phase 2 (Tasks 22–29):** data seeding + every route built out with real content
- **Phase 3 (Tasks 30–33):** transitions, smooth scroll, code-splitting, performance + a11y
- **Phase 4 (Task 34):** merge gate

Total commits: ~34 (one per task on average, plus a few "verify" empty commits).

Placeholders that need Alex's input (flagged in `data/about.js` and `data/academics.js`):
- `about.origin`, `about.field`, `about.offHours`, `about.pullQuote` (prose rewrite)
- `academics.coursework` (real class list)
- Project `body` copy for each entry in `data/projects.js` (expand beyond the one-liners I seeded)
- Any project `links.github`, `links.demo`, `links.writeup` values that should be filled in
