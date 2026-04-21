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
