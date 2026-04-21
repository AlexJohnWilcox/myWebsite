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
        {`${academics.school} · ${academics.grad} · GPA: ${academics.gpa}`}
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
              {c.pdf && (
                <a
                  className={styles.certDownload}
                  href={c.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Download ${c.title} PDF`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v13m0 0-4-4m4 4 4-4M3 21h18" /></svg>
                  <span>PDF</span>
                </a>
              )}
              <span className={styles.meta}>{c.year}</span>
              <h3>{c.title}</h3>
              <div style={{ color: 'var(--ink-dim)' }}>{c.issuer}</div>
              {c.valid && <div className={styles.valid}>VALID THROUGH {c.valid.toUpperCase()}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
