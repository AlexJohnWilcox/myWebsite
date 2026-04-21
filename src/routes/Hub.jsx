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
        <Tile index={1} title="Pi-hole + Forward Proxy" subtitle="Home server · Arch · Docker · WireGuard" to="/projects?category=other" featured />
        <Tile index={2} title="About" subtitle="Who I am" to="/about" />
        <Tile index={3} title="Academics" subtitle="HPU · CS · Cyber spec" to="/academics" />
        <Tile index={4} title="Experience" subtitle="Roles + timeline" to="/experience" />
        <Tile index={5} title="Projects" subtitle="Security · Games · Other" to="/projects" />
        <Tile index={6} title="Contact" subtitle="Say hi" to="/contact" />
      </section>
    </div>
  )
}
