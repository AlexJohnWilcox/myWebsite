import '@fontsource-variable/fredoka'
import { motion } from 'framer-motion'
import { Media } from '@/components/rapids/Media'
import styles from './Rapids.module.css'

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroMedia}>
        <Media type="video" src="/rapids/hero.mp4" poster="/rapids/hero-poster.jpg" label="hero.mp4" className={styles.heroVideo} />
        <div className={styles.heroScrim} />
      </div>
      <div className={styles.heroContent}>
        <h1 className={styles.wordmark}>RAPIDS</h1>
        <p className={styles.tagline}>You're a tiny critter on a raft that won't stop.</p>
        <div className={styles.scrollCue} aria-hidden="true">
          <span>scroll</span>
          <span className={styles.scrollArrow}>↓</span>
        </div>
      </div>
    </section>
  )
}

export function Rapids() {
  return (
    <main className={styles.page}>
      <Hero />
    </main>
  )
}
