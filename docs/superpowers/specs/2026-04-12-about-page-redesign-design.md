# About Page Redesign — Design

**Branch:** `aboutchange`
**Date:** 2026-04-12
**File affected:** `about.html` (plus additions to `style.css`)

## Goal

Rework `about.html` to fix two problems:

1. **Wasted vertical space.** The current 6-card stack (especially the certifications section) has each certificate sitting on its own full-width row despite containing only a name + PDF link.
2. **Information hierarchy.** The page currently reads like a resume dump. The redesign leads with personality (bio + interests side-by-side) and ends with a compact, signal-dense skills/certs presentation.

This is a **content restructure + visual redesign** — the narrative arc stays simple (no duplication of the timeline that already lives on `experience.html`).

## Layout

Three rows total (vs. six full-width cards today):

```
┌──────────────────────────────┬────────────┐
│ Row 1:  Bio                  │ Interests  │   (2fr / 1fr split)
├──────────────────────────────┴────────────┤
│ Row 2:  Skills              │  Coursework │   (1fr / 1fr split)
├───────────────────────────────────────────┤
│ Row 3:  Certifications (full-width)       │
└───────────────────────────────────────────┘
```

On mobile (≤760px) all rows collapse to a single column.

## Section Details

### Row 1 — Bio + Interests (2:1 split)

**Bio card** (left):
- Kicker: "About Me"
- `<h1>` name + tagline
- Two paragraphs — same voice as current, lightly trimmed.
- "Seeking a post-graduation role (May 2026) in IT, cybersecurity, or penetration testing." as the closing line.

**Interests card** (right):
- Kicker: "Interests"
- Vertical list of 4 items, each an amber-left-border chip:
  - Cybersecurity & Penetration Testing
  - Game Development & Programming
  - Bodybuilding & Nutrition
  - Philosophy & Psychology

### Row 2 — Skills + Coursework (1:1 split)

**Skills card** (left):
- Kicker: "Skills"
- Proficiency legend at top: green dot = Strong, yellow = Intermediate, red = Learning.
- 4 groups, each labeled in amber uppercase. Within each group, pills are ordered **green → yellow → red**. Each pill has a colored dot prefix and a subtly tinted border matching the level.

| Group | Pills (in order) |
|---|---|
| Security | 🟢 OSINT · 🟢 Compliance (ISO 27001, NIST) · 🟢 SIEM · 🟡 Vulnerability Assessment · 🔴 Penetration Testing |
| Systems & Networking | 🟢 Linux Administration · 🟢 Docker · 🟢 Network Architecture · 🟡 ServiceNow · 🟡 TCP/IP · 🟡 DNS/DHCP |
| Programming | 🟢 C++ · 🟢 C · 🟢 Python · 🟢 HTML/CSS · 🟢 JavaScript · 🟡 C# · 🔴 Java · 🔴 Bash |
| Tools | 🟢 Copilots · 🟢 GitHub · 🟢 Git · 🟢 NMAP · 🟡 Vim · 🔴 Wireshark |

Category names mirror the PDF resume (`Images/Resume-Wilcox,A.pdf`) exactly.

**Coursework card** (right):
- Kicker: "Relevant Coursework"
- Single flat list (no "Completed / In Progress" split — user is about to graduate):
  - Systems Security
  - Information Security
  - Operating Systems
  - Database Systems
  - Computer Systems
  - Web Development
  - Advanced Data Structures & Algorithms
  - Software Engineering
- Amber `▸` bullet markers.
- Removed: "Advanced Programming and Data Structures", "Programming Language Development and Translation".

### Row 3 — Certifications (full-width)

- Kicker: "Certifications"
- 4-tile grid (`grid-template-columns: repeat(4, 1fr)`). Each tile:
  - Amber hex glyph (`⬢`) as shield icon
  - Cert name (bold)
  - Year stamp (`2023`, `2024`, `2025`, `2025`)
  - "View PDF" link in amber uppercase
- PDF URLs remain the same GitHub-raw links from the current page.
- On narrow screens the grid collapses to 2 columns, then 1.

## Removed From Page

- **Leadership & Community Involvement** (Beta Theta Pi + C.O.D.E. Club) — deleted entirely from `about.html`. Still present in the resume PDF.

## Styling Notes

- Reuses existing `style.css` tokens: amber accent `#f59e0b`, charcoal surfaces, current card shadow pattern.
- New CSS additions live in `style.css` (not a page-scoped `<style>` block) so the theme stays consistent. Page-scoped `<style>` that currently exists in `about.html` can be removed.
- Pill proficiency colors:
  - Green: `#22c55e` dot, `rgba(34,197,94,0.35)` border
  - Yellow: `#eab308` dot, `rgba(234,179,8,0.35)` border
  - Red:  `#ef4444` dot, `rgba(239,68,68,0.35)` border
  - Each dot has a soft matching box-shadow glow.

## Class / Selector Plan

New classes (add to `style.css`):

- `.about-grid` — top-level wrapper replacing `.about-layout`
- `.about-row-bio` — 2fr/1fr grid row
- `.about-row-split` — 1fr/1fr grid row
- `.about-card` — card styling (consolidates current `.about-section-card` behavior)
- `.about-kicker` — amber uppercase section label
- `.interests-list`, `.interests-list li` — amber-left-border chips
- `.skill-legend`, `.skill-legend .dot`, `.dot-g/.dot-y/.dot-r`
- `.skill-group`, `.skill-label`
- `.pill`, `.pill-g`, `.pill-y`, `.pill-r`
- `.cert-grid`, `.cert-tile`, `.cert-shield`, `.cert-name`, `.cert-year`, `.cert-link`
- `.course-list`

Old classes removed (no other pages use them; verify with a grep before deletion):
- `.about-layout`, `.about-section-card`, `.about-bio-card`, `.about-bio-header`
- `.asec-header`, `.asec-title`
- `.bio-text`, `.tagline`
- `.skills-two-col`, `.skill-block`, `.skill-block-label`, `.skill-block-items`, `.skill-desc`
- `.cert-row-list`, `.cert-row-name`, `.cert-row-link`
- `.leadership-grid`, `.leadership-card`, `.leadership-header`, `.leadership-date`, `.leadership-place`, `.info-list`
- `.interest-grid`, `.interest-item`
- `.course-cols`, `.course-group`, `.course-group-label`

## Responsive Breakpoints

- **≥900px:** Three-row grid layout as drawn above.
- **760–900px:** Row 1 collapses to single column (bio stacked over interests). Row 2 stays 1:1. Cert grid becomes 2×2.
- **≤760px:** All rows single-column. Cert grid becomes 2×2 then 1-column on very narrow.

## Non-Goals

- No changes to `header`, `nav`, or the mobile-nav JS.
- No new page, no new routes, no JS features beyond existing nav toggle.
- No animations/transitions beyond the existing card hover (inherited from `.about-section-card` → `.about-card`).
- No change to other pages, other CSS files, or the chat function.

## Testing

- Manual visual check on desktop (>1100px), tablet (~800px), and mobile (<760px).
- Verify all 4 PDF cert links still 200 OK.
- Verify nav active state (`ABOUT` highlighted) still works.
- Confirm the existing security headers (`_headers` CSP) don't need updates — no new external resources are introduced.
