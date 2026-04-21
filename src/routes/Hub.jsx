import { Tile } from '@/components/Tile'
import { Typewriter } from '@/components/Typewriter'
import styles from './Hub.module.css'

const BUILD = `MMXXVI · v2.2 · BUILD ${new Date().toISOString().slice(5, 10).replace('-', '')}`

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
          CYBERSECURITY · WEB DESIGN · GAME DEVELOPMENT
        </Typewriter>
        <div className={styles.scrollHint}>
          <div className={styles.bars}><span /><span /><span /><span /></div>
          <span>SCROLL</span>
        </div>
      </section>

      <section className={styles.grid}>
        <Tile index={1} title="Pi-hole + Forward Proxy" subtitle="Home server · Arch · Docker · WireGuard" to="/projects?category=cybersecurity" featured>
{`┌─ clients ─────┐       ┌──── ThinkPad · Arch Linux ────┐       ┌─ upstream ──┐
│               │       │                                │       │             │
│  phone        │◀═WG══▶│   WireGuard   :51820/udp      │       │   1.1.1.1   │
│  laptop       │       │          │                     │       │   9.9.9.9   │
│  desktop      │       │          ▼                     │       │   (DoT/DoH) │
│               │◀─DNS─▶│   Pi-hole · 1M+ blocklist     │──────▶│             │
└───────────────┘  :53  │          │                     │ allow └─────────────┘
                        │     ┌────┴────┐                │
                        │   match?    clean              │
                        │     │          \\              │
                        │  NXDOMAIN    forward           │
                        │     ▼            │             │
                        │   client   ◀─────┘             │
                        │                                │
                        └────────────────────────────────┘`}
        </Tile>
        <Tile index={2} title="About" subtitle="Me" to="/about" />
        <Tile index={3} title="Academics" subtitle="CS · Cyber" to="/academics" />
        <Tile index={4} title="Experience" subtitle="Roles · Timeline" to="/experience" />
        <Tile index={5} title="Projects" subtitle="Security · Game Dev · Web Design" to="/projects" />
        <Tile index={6} title="Contact" subtitle="Hello" to="/contact" />
      </section>
    </div>
  )
}
