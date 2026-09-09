import { useState } from 'react'
import { Tile } from '@/components/Tile'
import { Typewriter } from '@/components/Typewriter'
import { projects } from '@/data/projects'
import styles from './Hub.module.css'

const games = projects.filter(p => p.category === 'games' && p.links.demo)

const BUILD = `MMXXVI · v2.2 · BUILD ${new Date().toISOString().slice(5, 10).replace('-', '')}`

export function Hub() {
  const [gamesOpen, setGamesOpen] = useState(false)
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.meta}>
          <span>{BUILD}</span>
          <span className={styles.avail}><span className={styles.dot} />AVAILABLE MAY 2026</span>
        </div>
        <Typewriter as="h1" speed="slow" className={styles.name}>Alex Wilcox</Typewriter>
        <Typewriter as="div" speed="flash" className={styles.role}>
          CYBERSECURITY · WEB DESIGN · GAME DEVELOPMENT
        </Typewriter>
        <div className={styles.gamesBlurb}>
          <button className={styles.gamesToggle} onClick={() => setGamesOpen(o => !o)} data-interactive>
            Just here for the games? {gamesOpen ? '▴' : '▾'}
          </button>
          {gamesOpen && (
            <div className={styles.gamesDropdown}>
              {games.map(g => (
                <div key={g.slug} className={styles.gameRow}>
                  <span>{g.title}</span>
                  <a href={g.links.demo} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>[ PLAY ]</a>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.scrollHint}>
          <div className={styles.bars}><span /><span /><span /><span /></div>
          <span>SCROLL</span>
        </div>
      </section>

      <section className={styles.grid}>
        <Tile index={1} title="Rapid Raccoons" subtitle="Unity · 1–4 player online co-op · Free demo Sep 22 · Wishlist on Steam" to="/rapidraccoons" featured>
{`≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈  THE WAVE  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
≈≈≈≈≈  a wall of water, the whole way down, and it never tires  ≈≈
                                 │
                                 ▼  always closing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                 ┌───────────────────────┐
~~~~~~~~~~~~~~~  │  [#] [#] [#] [#]      │  ~~~~~~  ◀ cargo, loose
~~~~~~~~~~~~~~~  │   o     o     o    o  │  ~~~~~~  ◀ 1-4 critters
                 └───────────────────────┘
~~~~~~~~~~~~~~~~~~~~ no engine · no steering ~~~~~~~~~~~~~~~~~~~~~
      ▲ rock             ▲ log             ▲ the drop
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  two hands ▸ hold the cargo, or hold the raft. you can't do both
  the loop  ▸ hit quota ─▶ ship more ─▶ quota rises ─▶ do it again
  there is no winning, only further`}
        </Tile>
        <Tile index={2} title="The Sanctum Homelab" subtitle="Private network · OpenWrt · WireGuard · Pi-hole · Tailscale" to="/projects?category=cybersecurity" featured>
{`┌─ the sanctum ─┐      ┌─── the Oracle · Pi 5 ────┐    ┌─ 7 roads ────────┐
│               │      │                          │    │                  │
│  pixel        │─:53─▶│  pi-hole  · 1M+ list     │    │  CA      US-MA   │
│  erebus       │      │  immich   · caddy + TLS  │    │  US-VA   US-NC   │
│  kafka        │      │  tailscale · exit node   │    │  US-DC   US-PA   │
│  sonos ×2  ◆  │      │  dash.lan · one screen   │    │  US-TX           │
│  LG TV     ◆  │      └──────────────────────┬───┘    └─────────▲────────┘
└───────┬───────┘  dns upstream · 10.2.0.1    │                  │
        │                                     ▼                  │
        │    ┌──── the Gate · vanilla OpenWrt ────┐              │
        └───▶│  forward = REJECT                  │              │
             │  lan → wg  ◀ the only rule         │═══ wg0 ══════┘
             │  no lan → wan path exists          │  new exit 03:00 ±15m
             └────────────────────────────────────┘  verified, or rolled back

  ◆ warded ▸ no egress until someone opens a window
  ✕ tunnel drops ▸ the LAN goes dark, it never falls back to the ISP`}
        </Tile>
        <Tile index={3} title="About" subtitle="Me" to="/about" />
        <Tile index={4} title="Academics" subtitle="CS · Cyber" to="/academics" />
        <Tile index={5} title="Experience" subtitle="Roles · Timeline" to="/experience" />
        <Tile index={6} title="Projects" subtitle="Security · Game Dev · Web Design" to="/projects" />
        <Tile index={7} title="Contact" subtitle="Hello" to="/contact" />
      </section>
    </div>
  )
}
