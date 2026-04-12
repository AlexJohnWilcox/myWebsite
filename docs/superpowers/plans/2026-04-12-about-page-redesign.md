# About Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `about.html` into a compact 3-row layout (Bio+Interests, Skills+Coursework, Certifications) with color-coded proficiency pills and a tile-grid certifications section, matching the design spec at `docs/superpowers/specs/2026-04-12-about-page-redesign-design.md`.

**Architecture:** Additive-first CSS edit followed by a one-shot HTML rewrite, then a dead-code cleanup pass. The existing `section.card` and `.asec-title` theme primitives are reused. New classes (`.about-grid-v2`, `.pill`, `.cert-tile`, `.interests-list`, `.skill-legend`) are added to `style.css`. The page-scoped `<style>` block in `about.html` that adds the amber glow to cards is preserved.

**Tech Stack:** Static HTML/CSS only. No build step. Site deployed via Netlify; visual verification via Playwright MCP tools + manual browser check at `file:///home/alex/Projects/myWebsite/about.html`.

**Branch:** `aboutchange` (already created and active).

---

## File Map

**Modified:**
- `about.html` — full `<main>` rewrite, page-scoped `<style>` block preserved.
- `style.css` — additions appended before the existing about-layout block (~line 803), dead-code removal at end.

**No new files. No JavaScript changes.** The existing mobile nav-toggle `<script>` at the bottom of `about.html` is preserved verbatim.

---

## Naming note

New classes use the `v2` suffix where there's a name collision with the old design (e.g. `.about-grid` already exists at `style.css:181` as a simple 1-col grid used by something else — check with grep first, rename if unused). Otherwise new classes get plain descriptive names.

---

## Task 1: Verify class-name conflicts before adding new CSS

**Files:**
- Read-only: `style.css`, all `*.html`

**Purpose:** Confirm which "new" class names collide with existing selectors so we pick safe names.

- [ ] **Step 1: Grep for each planned new class in `*.html` files**

Run:
```bash
cd /home/alex/Projects/myWebsite
for cls in "about-grid" "about-row-bio" "about-row-split" "interests-list" "skill-legend" "skill-group" "skill-label" "pill" "cert-grid" "cert-tile" "cert-shield" "cert-name" "cert-year" "cert-link" "course-list-v2"; do
  printf '%-22s' "$cls"
  grep -l "\"$cls\"\|\"[^\"]* $cls[\" ]" *.html 2>/dev/null | tr '\n' ' '
  echo
done
```

Expected: `about-grid` may collide (already used in `style.css:181`). Other names should be clear. Any collision found here dictates a rename in Task 2.

- [ ] **Step 2: Grep the same class names in `style.css`**

Run:
```bash
grep -n -E '^\.(about-grid|about-row-bio|about-row-split|interests-list|skill-legend|skill-group|skill-label|pill|cert-grid|cert-tile|cert-shield|cert-name|cert-year|cert-link|course-list)\b' style.css
```

Expected output to note:
- `.about-grid` at line ~181 — existing, so rename our new wrapper to `.about-grid-v2`
- `.course-list` at line ~662 — existing but only used by about.html; we'll redefine the `::before` content from `—` to `▸` in Task 2 CSS
- `.pill` — likely no match, safe

No commit for this task — it's investigation only.

---

## Task 2: Add new CSS block to `style.css`

**Files:**
- Modify: `style.css` (append before line 802 `/* ── About page layout ─ */` block, OR at end of file)

Goal: Add every new class the new HTML will use, without removing anything old yet. This is safe — no existing HTML references the new classes.

- [ ] **Step 1: Add the new CSS block**

Append to `style.css` **at the very end of the file** (after the last rule, before any final whitespace). This avoids touching existing rules.

Use the Edit tool to insert this block. Paste it exactly:

```css

/* ─────────────────────────────────────────────────────────────── */
/*   About page redesign (2026-04-12) — aboutchange branch          */
/* ─────────────────────────────────────────────────────────────── */

/* Grid wrapper — 3 rows */
.about-grid-v2{
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

/* Row 1: Bio (2fr) + Interests (1fr) */
.about-row-bio{
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  align-items: start;
}

/* Row 2: Skills (1fr) + Coursework (1fr) */
.about-row-split{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  align-items: start;
}

/* Keep cards in split rows from doubling up on bottom-margin */
.about-row-bio > section.card,
.about-row-split > section.card{ margin-bottom: 0; }

/* Bio card typography */
.about-row-bio h1{
  margin: 0 0 6px;
  font-size: 2.2rem;
  color: var(--text);
}
.about-row-bio .tagline-v2{
  margin: 0 0 16px;
  font-size: 0.95rem;
  color: var(--muted);
}
.about-row-bio p{
  line-height: 1.6;
  color: var(--muted);
  margin: 0 0 10px;
}

/* Interests — amber-left-border chips */
.interests-list{
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}
.interests-list li{
  padding: 10px 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-left: 3px solid var(--accent-4);
  border-radius: 6px;
  font-size: 0.92rem;
  color: var(--text);
  margin-bottom: 8px;
}
.interests-list li:last-child{ margin-bottom: 0; }

/* Skills — proficiency legend */
.skill-legend{
  display: flex;
  gap: 14px;
  font-size: 0.72rem;
  color: var(--muted);
  margin: 10px 0 14px;
  letter-spacing: 0.5px;
}
.skill-legend .lg{
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.skill-legend .dot{
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot-g{ background: #22c55e; }
.dot-y{ background: #eab308; }
.dot-r{ background: #ef4444; }

/* Skills — groups and pills */
.skill-group{ margin-bottom: 14px; }
.skill-group:last-child{ margin-bottom: 0; }
.skill-label{
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--accent-4);
  margin: 0 0 8px;
}
.pills{
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pill{
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 0.82rem;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.pill::before{
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.pill-g::before{ background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.5); }
.pill-y::before{ background: #eab308; box-shadow: 0 0 6px rgba(234,179,8,0.5); }
.pill-r::before{ background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.5); }
.pill-g{ border-color: rgba(34,197,94,0.35); }
.pill-y{ border-color: rgba(234,179,8,0.35); }
.pill-r{ border-color: rgba(239,68,68,0.35); }

/* Coursework list — reuse .course-list structure, override bullet */
.course-list-v2{
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.course-list-v2 li{
  font-size: 0.95rem;
  color: var(--muted);
  padding-left: 16px;
  position: relative;
  line-height: 1.5;
}
.course-list-v2 li::before{
  content: '▸';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent-4);
  font-size: 0.85rem;
}

/* Certifications — tile grid */
.cert-grid{
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 10px;
}
.cert-tile{
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.06));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 18px 12px;
  text-align: center;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.cert-tile:hover{
  transform: translateY(-3px);
  border-color: rgba(245,158,11,0.45);
  box-shadow: 0 0 18px rgba(245,158,11,0.16), 0 8px 22px rgba(0,0,0,0.4);
}
.cert-shield{
  font-size: 1.6rem;
  color: var(--accent-4);
  line-height: 1;
  margin-bottom: 8px;
}
.cert-name-v2{
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
  line-height: 1.3;
}
.cert-year{
  font-size: 0.72rem;
  color: var(--muted);
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.cert-link-v2{
  font-size: 0.72rem;
  color: var(--accent-4);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  text-decoration: none;
  font-weight: 700;
}
.cert-link-v2:hover{ text-decoration: underline; }

/* Responsive */
@media (max-width: 900px){
  .about-row-bio{ grid-template-columns: 1fr; }
}
@media (max-width: 760px){
  .about-row-split{ grid-template-columns: 1fr; }
  .cert-grid{ grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 420px){
  .cert-grid{ grid-template-columns: 1fr; }
}
```

Use the Edit tool with `old_string` being the last few lines of `style.css` and `new_string` being those same lines followed by the block above. Or use the Write tool with the full file content if easier.

- [ ] **Step 2: Visually verify nothing broke**

Load the existing (not-yet-updated) about page in a browser to confirm the additive CSS didn't break the live page.

Run (via Playwright MCP):
```
browser_navigate → file:///home/alex/Projects/myWebsite/about.html
browser_snapshot
```

Expected: Page looks identical to before (since no HTML references the new classes yet). If the page looks broken, revert the CSS change.

- [ ] **Step 3: Commit**

```bash
cd /home/alex/Projects/myWebsite
git add style.css
git commit -m "$(cat <<'EOF'
Add new CSS classes for about page redesign

Additive-only: no existing HTML yet uses these classes.
Covers pills (green/yellow/red proficiency), cert tile grid,
interests-list chips, skill legend, and 2/3-row grid wrappers.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Rewrite `about.html` body

**Files:**
- Modify: `about.html` — replace the entire `<main class="main-container">...</main>` block.

The `<head>` section (including the page-scoped `<style>` with the amber card glow) and the `<script>` at the bottom (mobile nav toggle) stay untouched.

- [ ] **Step 1: Replace the `<main>` block**

Use the Edit tool. The `old_string` is the entire block starting with `<main class="main-container">` (line 44) through `</main>` (line 182). The `new_string` is:

```html
  <main class="main-container">
    <div class="about-grid-v2">

      <!-- Row 1: Bio + Interests (2fr/1fr) ─────────────────────── -->
      <div class="about-row-bio">

        <section class="card">
          <div class="asec-header"><h2 class="asec-title">About Me</h2></div>
          <h1>Alex J. Wilcox</h1>
          <p class="tagline-v2">Senior · B.S. Computer Science · Cybersecurity Specialization · High Point University</p>
          <p>Hello! My name is Alex Wilcox and I'm a senior at High Point University completing a B.S. in Computer Science with a cybersecurity specialization. Computers and technology have always fascinated me ever since I was a kid. I built my first PC in high school and took what classes were offered. In college, I greatly expanded my skills through high-level courses, CompTIA certificates, and a systems administration internship last summer.</p>
          <p>I'm currently working on my senior year coursework, applying to full-time positions, and building a video game in Unity in my spare time. Seeking a post-graduation role (May 2026) in IT, cybersecurity, or penetration testing.</p>
        </section>

        <section class="card">
          <div class="asec-header"><h2 class="asec-title">Interests</h2></div>
          <ul class="interests-list">
            <li>Cybersecurity &amp; Penetration Testing</li>
            <li>Game Development &amp; Programming</li>
            <li>Bodybuilding &amp; Nutrition</li>
            <li>Philosophy &amp; Psychology</li>
          </ul>
        </section>

      </div>

      <!-- Row 2: Skills + Coursework (1fr/1fr) ─────────────────── -->
      <div class="about-row-split">

        <section class="card">
          <div class="asec-header"><h2 class="asec-title">Skills</h2></div>
          <div class="skill-legend">
            <span class="lg"><span class="dot dot-g"></span>Strong</span>
            <span class="lg"><span class="dot dot-y"></span>Intermediate</span>
            <span class="lg"><span class="dot dot-r"></span>Learning</span>
          </div>

          <div class="skill-group">
            <p class="skill-label">Security</p>
            <div class="pills">
              <span class="pill pill-g">OSINT</span>
              <span class="pill pill-g">Compliance (ISO 27001, NIST)</span>
              <span class="pill pill-g">SIEM</span>
              <span class="pill pill-y">Vulnerability Assessment</span>
              <span class="pill pill-r">Penetration Testing</span>
            </div>
          </div>

          <div class="skill-group">
            <p class="skill-label">Systems &amp; Networking</p>
            <div class="pills">
              <span class="pill pill-g">Linux Administration</span>
              <span class="pill pill-g">Docker</span>
              <span class="pill pill-g">Network Architecture</span>
              <span class="pill pill-y">ServiceNow</span>
              <span class="pill pill-y">TCP/IP</span>
              <span class="pill pill-y">DNS/DHCP</span>
            </div>
          </div>

          <div class="skill-group">
            <p class="skill-label">Programming</p>
            <div class="pills">
              <span class="pill pill-g">C++</span>
              <span class="pill pill-g">C</span>
              <span class="pill pill-g">Python</span>
              <span class="pill pill-g">HTML/CSS</span>
              <span class="pill pill-g">JavaScript</span>
              <span class="pill pill-y">C#</span>
              <span class="pill pill-r">Java</span>
              <span class="pill pill-r">Bash</span>
            </div>
          </div>

          <div class="skill-group">
            <p class="skill-label">Tools</p>
            <div class="pills">
              <span class="pill pill-g">Copilots</span>
              <span class="pill pill-g">GitHub</span>
              <span class="pill pill-g">Git</span>
              <span class="pill pill-g">NMAP</span>
              <span class="pill pill-y">Vim</span>
              <span class="pill pill-r">Wireshark</span>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="asec-header"><h2 class="asec-title">Relevant Coursework</h2></div>
          <ul class="course-list-v2">
            <li>Systems Security</li>
            <li>Information Security</li>
            <li>Operating Systems</li>
            <li>Database Systems</li>
            <li>Computer Systems</li>
            <li>Web Development</li>
            <li>Advanced Data Structures &amp; Algorithms</li>
            <li>Software Engineering</li>
          </ul>
        </section>

      </div>

      <!-- Row 3: Certifications (full-width) ────────────────────── -->
      <section class="card">
        <div class="asec-header"><h2 class="asec-title">Certifications</h2></div>
        <div class="cert-grid">
          <div class="cert-tile">
            <div class="cert-shield">⬢</div>
            <div class="cert-name-v2">CompTIA A+</div>
            <div class="cert-year">2023</div>
            <a class="cert-link-v2" href="https://raw.githubusercontent.com/AlexJohnWilcox/myWebsite/main/Images/CompTIA%20A%2B%20ce%20certificate.pdf" target="_blank" rel="noopener noreferrer">View PDF</a>
          </div>
          <div class="cert-tile">
            <div class="cert-shield">⬢</div>
            <div class="cert-name-v2">Network+</div>
            <div class="cert-year">2024</div>
            <a class="cert-link-v2" href="https://raw.githubusercontent.com/AlexJohnWilcox/myWebsite/main/Images/CompTIA%20Network%2B%20ce%20certificate.pdf" target="_blank" rel="noopener noreferrer">View PDF</a>
          </div>
          <div class="cert-tile">
            <div class="cert-shield">⬢</div>
            <div class="cert-name-v2">Security+</div>
            <div class="cert-year">2025</div>
            <a class="cert-link-v2" href="https://raw.githubusercontent.com/AlexJohnWilcox/myWebsite/main/Images/CompTIA%20Security%2B%20ce%20certificate.pdf" target="_blank" rel="noopener noreferrer">View PDF</a>
          </div>
          <div class="cert-tile">
            <div class="cert-shield">⬢</div>
            <div class="cert-name-v2">ISO 27001 LA</div>
            <div class="cert-year">2025</div>
            <a class="cert-link-v2" href="https://raw.githubusercontent.com/AlexJohnWilcox/myWebsite/main/Images/Mastermind%20-%20ISO%2027001%20Certification.pdf" target="_blank" rel="noopener noreferrer">View PDF</a>
          </div>
        </div>
      </section>

    </div>
  </main>
```

Verify the `<head>`, the page-scoped `<style>` block (lines 9–20 of the current file), and the `<script>` (lines 183–201) remain untouched.

- [ ] **Step 2: Desktop visual check**

Run (via Playwright MCP):
```
browser_navigate → file:///home/alex/Projects/myWebsite/about.html
browser_resize → 1400×900
browser_snapshot
browser_take_screenshot → /tmp/about-desktop.png
```

Expected: 3 rows visible. Row 1 shows bio (wider) beside interests chips (narrower). Row 2 shows skill pills with proficiency dots beside coursework list. Row 3 shows 4 cert tiles in a row. Amber kicker labels on every section. No layout overflow or overlapping elements.

- [ ] **Step 3: Tablet visual check**

Run:
```
browser_resize → 800×1000
browser_take_screenshot → /tmp/about-tablet.png
```

Expected: At 800px, Row 1 (bio+interests) collapses to single column. Row 2 stays 1:1. Cert grid becomes 2×2.

- [ ] **Step 4: Mobile visual check**

Run:
```
browser_resize → 375×800
browser_take_screenshot → /tmp/about-mobile.png
```

Expected: All rows single column. Cert grid 2×2 (or 1-col below 420px). Nav hamburger button visible.

- [ ] **Step 5: Verify cert PDF links**

Run:
```
browser_navigate → file:///home/alex/Projects/myWebsite/about.html
browser_evaluate → () => Array.from(document.querySelectorAll('.cert-link-v2')).map(a => a.href)
```

Expected: 4 URLs, all pointing at `raw.githubusercontent.com/AlexJohnWilcox/myWebsite/main/Images/...`.

- [ ] **Step 6: Commit**

```bash
cd /home/alex/Projects/myWebsite
git add about.html
git commit -m "$(cat <<'EOF'
Rewrite about page body with new 3-row layout

- Row 1: Bio + Interests side-by-side (2fr/1fr)
- Row 2: Skills + Coursework side-by-side (1fr/1fr)
- Row 3: Certifications full-width tile grid
- Skills use color-coded proficiency pills (green/yellow/red)
- Coursework flattened to single list (no longer split)
- Removed Leadership section entirely

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Remove dead CSS

**Files:**
- Modify: `style.css` — delete rules that were only used by the old about page.

Goal: remove the classes the rewritten about page no longer uses and that no other page references. Conservative — if a class is referenced anywhere else, skip it.

- [ ] **Step 1: Confirm each candidate is truly unused**

Run:
```bash
cd /home/alex/Projects/myWebsite
for cls in "about-bio-card" "about-bio-header" "bio-text" "skills-two-col" "skill-block" "skill-block-label" "skill-block-items" "skill-desc" "cert-row-list" "cert-row-name" "cert-row-link" "cert-badge-grid" "cert-badge" "cert-badge-icon" "cert-badge-name" "cert-download" "leadership-grid" "leadership-card" "leadership-header" "leadership-date" "leadership-place" "interest-grid" "interest-item" "course-cols" "course-group" "course-group-label" "about-layout" "about-section-card" "asec-num" "about-two-col" "about-skills-certs" "about-interests-coursework"; do
  count=$(grep -l "\"$cls\"\|\"[^\"]* $cls[\" ]" *.html 2>/dev/null | wc -l)
  printf '%-30s uses_in_html=%s\n' "$cls" "$count"
done
```

Expected: every class reports `uses_in_html=0`. If any report `>0`, drop that class from the delete list for this task — keep it in CSS.

Additionally, `info-list` and `course-list` need a separate check — they may be more general-purpose. Run:
```bash
grep -l "class=\"[^\"]*\binfo-list\b\|class=\"[^\"]*\bcourse-list\b" *.html
```

Expected: no output (both are unreferenced after about.html rewrite). If any match, keep the class.

- [ ] **Step 2: Delete the confirmed-unused rules in `style.css`**

Use the Edit tool. For each class confirmed unused in Step 1, delete the rule. The rules to remove are roughly:

- `.bio-text` (line ~182)
- `.info-list`, `.info-list li` (lines ~183–184) — only if Step 1 shows 0 html uses
- The whole block `/* ── About page redesign ─ */` through end of the about-specific rules (lines ~686–858 in current file), which includes:
  - `.about-bio-card`, `.about-bio-header`, `.about-bio-header h1`, `.about-bio-header .tagline`
  - `.skills-two-col`
  - `.cert-badge-grid`, `.cert-badge`, `.cert-badge:hover`, `.cert-badge-icon`, `.cert-badge-name`, `.cert-badge .cert-download`
  - `.about-two-col`
  - `.leadership-grid`, `.leadership-card`, `.leadership-card:hover`, `.leadership-header`, `.leadership-header h3`, `.leadership-date`, `.leadership-place`
  - `.about-layout`, `.about-layout section.card`
  - `.about-section-card` (with its responsive override)
  - `.asec-header`, `.asec-num` (but NOT `section.card .asec-title` — that's reused)
  - `.about-skills-certs`, `.about-interests-coursework`
  - `.course-cols`, `.course-cols` responsive override, `.course-group-label`, `.course-list`, `.course-list li`, `.course-list li::before`

**Do NOT remove:**
- `section.card` (line 170) — shared
- `section.card h2` (line 179) — shared
- `section.card .asec-title` (line 831) — shared with contact.html
- `.about-grid` (line 181) — leave alone in case anything else uses it; if grep confirms unused, removal can be a separate PR
- `.about-hero p.tagline` (line 342) — used by other pages

Because this is a large deletion in one file, make it a single Edit call with the `old_string` being a block starting at `.bio-text{` and ending at the end of `.about-interests-coursework` media query. Careful to preserve `section.card .asec-title` which sits in the middle.

- [ ] **Step 3: Re-verify the live page still renders**

Run:
```
browser_navigate → file:///home/alex/Projects/myWebsite/about.html
browser_resize → 1400×900
browser_snapshot
```

Expected: identical to Task 3 Step 2. If anything changed visually, a class was deleted that the new page actually depends on — revert and re-check.

Also spot-check the other pages that share classes:
```
browser_navigate → file:///home/alex/Projects/myWebsite/index.html
browser_snapshot
browser_navigate → file:///home/alex/Projects/myWebsite/contact.html
browser_snapshot
browser_navigate → file:///home/alex/Projects/myWebsite/projects.html
browser_snapshot
browser_navigate → file:///home/alex/Projects/myWebsite/experience.html
browser_snapshot
browser_navigate → file:///home/alex/Projects/myWebsite/resume.html
browser_snapshot
```

Expected: all pages render identically to before the change.

- [ ] **Step 4: Commit**

```bash
cd /home/alex/Projects/myWebsite
git add style.css
git commit -m "$(cat <<'EOF'
Remove dead CSS from old about page layout

Drops class rules that are no longer referenced by any HTML file
after the about.html rewrite. Conservative: only removes rules
whose class names are confirmed unused across the site.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Interactive & accessibility smoke test

**Files:** none modified.

- [ ] **Step 1: Hamburger nav works on mobile width**

Run:
```
browser_navigate → file:///home/alex/Projects/myWebsite/about.html
browser_resize → 375×800
browser_snapshot
```

Find the `.nav-toggle` button in the snapshot and click it:
```
browser_click → reference: nav-toggle button
browser_snapshot
```

Expected: the nav menu opens (class `nav-open` added) and the 6 nav links are visible.

- [ ] **Step 2: Nav active state**

Run:
```
browser_navigate → file:///home/alex/Projects/myWebsite/about.html
browser_evaluate → () => document.querySelector('a[href="about.html"]').classList.contains('active')
```

Expected: `true`.

- [ ] **Step 3: Cert PDF link opens in new tab**

Run:
```
browser_evaluate → () => Array.from(document.querySelectorAll('.cert-link-v2')).every(a => a.target === '_blank' && a.rel.includes('noopener'))
```

Expected: `true`.

- [ ] **Step 4: No console errors on page load**

Run:
```
browser_navigate → file:///home/alex/Projects/myWebsite/about.html
browser_console_messages
```

Expected: no error-level messages. Warnings about file:// origin or favicon are OK.

- [ ] **Step 5: No commit required for this task** — verification only.

---

## Task 6: Push branch and optionally open PR

**Files:** none modified.

- [ ] **Step 1: Review the full diff before pushing**

```bash
cd /home/alex/Projects/myWebsite
git log main..aboutchange --oneline
git diff main...aboutchange --stat
```

Expected: three commits (spec, CSS add, HTML rewrite, CSS cleanup). Stats should show changes in `about.html`, `style.css`, a new `docs/superpowers/specs/...md`, and a new `docs/superpowers/plans/...md`.

- [ ] **Step 2: Push the branch (ask user before running)**

```bash
git push -u origin aboutchange
```

Only run after confirming with the user. Netlify's deploy previews will pick up the push automatically if configured.

- [ ] **Step 3: Optionally open a PR (ask user before running)**

```bash
gh pr create --title "Redesign about page" --body "$(cat <<'EOF'
## Summary
- Rework about page into a tight 3-row layout (Bio+Interests, Skills+Coursework, Certs)
- Color-coded proficiency pills (green/yellow/red) for all skills
- 4-tile certifications grid (was 4 full-width list rows)
- Remove Leadership section
- Skill categories now mirror the resume PDF

## Test plan
- [ ] Desktop (1400px): 3 rows render as designed
- [ ] Tablet (800px): Row 1 collapses, cert grid becomes 2×2
- [ ] Mobile (375px): all rows stack, hamburger nav works
- [ ] All 4 cert PDF links resolve on GitHub
- [ ] Other pages (index/contact/projects/experience/resume) unchanged

Spec: `docs/superpowers/specs/2026-04-12-about-page-redesign-design.md`
Plan: `docs/superpowers/plans/2026-04-12-about-page-redesign.md`

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Rollback

If anything goes sideways:

```bash
cd /home/alex/Projects/myWebsite
git checkout main           # back to known-good
git branch -D aboutchange   # only after verifying nothing important is lost
```

Per-commit rollback: `git revert <sha>` for any single task's commit.
