import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { experience } from '@/data/experience'
import styles from './Experience.module.css'

export function Experience() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <SectionLabel index={4}>EXPERIENCE</SectionLabel>
        <Typewriter as="h1" speed="slow">The Real Work</Typewriter>
      </header>

      <div className={styles.timeline}>
        {experience.map(e => (
          <article key={e.role + e.org} className={styles.role}>
            <span className={styles.node} />
            <div className={styles.dates}>{e.start} — {e.end}</div>
            <h2>{e.role}</h2>
            <div className={styles.org}>{e.org}</div>
            <Typewriter as="p" speed="fast" className={styles.lede}>{e.lede}</Typewriter>
            <p className={styles.summary}>{e.summary}</p>
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
