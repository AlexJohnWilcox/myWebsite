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
            <span className={styles.subLabel}>// overview</span>
            {about.overview.map((para, i) => (
              <Typewriter key={i} as="p" speed="fast" className={styles.para}>{para}</Typewriter>
            ))}
          </div>

          <div className={styles.pullWrap}>
            <Typewriter as="blockquote" speed="slow" className={styles.pull}>{about.pullQuote}</Typewriter>
          </div>

          <div className={styles.block}>
            <span className={styles.subLabel}>// skills</span>
            <div className={styles.skillLegend}>
              <span><span className={`${styles.dot} ${styles.strong}`} />Strong</span>
              <span><span className={`${styles.dot} ${styles.intermediate}`} />Intermediate</span>
              <span><span className={`${styles.dot} ${styles.learning}`} />Learning</span>
            </div>
            {about.skills.map(g => (
              <div key={g.group} className={styles.skillGroup}>
                <div className={styles.skillGroupName}>{g.group}</div>
                <div className={styles.pills}>
                  {g.items.map(it => (
                    <span key={it.name} className={`${styles.pill} ${styles[it.level]}`}>{it.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.block}>
            <span className={styles.subLabel}>// interests & hobbies ranked</span>
            <ol className={styles.interests}>
              {about.interests.map((item, i) => <li key={item}>{item}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
