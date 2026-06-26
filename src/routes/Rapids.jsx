import '@fontsource-variable/fredoka'
import { motion } from 'framer-motion'
import { Media } from '@/components/rapids/Media'
import styles from './Rapids.module.css'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

function Reveal({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

const MECHANICS = [
  {
    title: 'Two-Hand Grab',
    body: "Two independent hands. Hold the cargo or hold the raft — you can't do both.",
    media: { type: 'video', src: '/rapids/grab.mp4', label: 'grab.mp4' },
  },
  {
    title: 'No Steering, Only Chaos',
    body: "The current decides where you go. Spot hazards, brace, and clean up the mess.",
    media: { type: 'video', src: '/rapids/collision.mp4', label: 'collision.mp4' },
  },
  {
    title: 'The Wave',
    body: "A wall of water chases you the whole way down — and it never gets tired.",
    media: { type: 'video', src: '/rapids/wave.mp4', label: 'wave.mp4' },
  },
  {
    title: 'Quotas That Only Get Harder',
    body: "Hit the quota, ship more cargo, do it again. There is no winning — only further.",
    media: { type: 'image', src: '/rapids/quota.jpg', label: 'quota.jpg' },
  },
]

const SHOTS = [
  { src: '/rapids/shot-01.jpg', label: 'shot-01.jpg' },
  { src: '/rapids/shot-02.jpg', label: 'shot-02.jpg' },
  { src: '/rapids/shot-03.jpg', label: 'shot-03.jpg' },
]

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

function Pitch() {
  return (
    <section className={styles.pitch}>
      <Reveal>
        <p className={styles.pitchText}>
          Haul cargo down a <em>river you can't steer</em>, with a wall of water
          closing in behind you. Your crew of critters is barely holding on.
          How far will you make it?
        </p>
      </Reveal>
    </section>
  )
}

function Mechanics() {
  return (
    <section className={styles.mechanics}>
      {MECHANICS.map((m, i) => (
        <Reveal key={m.title} className={`${styles.mechCard} ${i % 2 === 1 ? styles.mechReverse : ''}`}>
          <div className={styles.mechMedia}>
            <Media {...m.media} className={styles.mechMediaInner} />
          </div>
          <div className={styles.mechText}>
            <h2 className={styles.mechTitle}>{m.title}</h2>
            <p className={styles.mechBody}>{m.body}</p>
          </div>
        </Reveal>
      ))}
    </section>
  )
}

function Showcase() {
  return (
    <section className={styles.showcase}>
      {SHOTS.map((s) => (
        <Reveal key={s.label} className={styles.shot}>
          <Media type="image" src={s.src} label={s.label} className={styles.shotImg} />
        </Reveal>
      ))}
    </section>
  )
}

function CoOp() {
  return (
    <section className={styles.coop}>
      <div className={styles.coopMedia}>
        <Media type="video" src="/rapids/coop.mp4" label="coop.mp4" className={styles.coopVideo} />
        <div className={styles.coopScrim} />
      </div>
      <Reveal className={styles.coopText}>
        <h2 className={styles.coopTitle}>1–4 Player Co-Op Chaos</h2>
        <p className={styles.coopBody}>
          Online co-op for one to four critters. Losing cargo is funny. Getting
          washed overboard is funnier. Built for the clip.
        </p>
      </Reveal>
    </section>
  )
}

function CallToAction() {
  return (
    <section className={styles.cta}>
      <Reveal className={styles.ctaInner}>
        <h2 className={styles.ctaTitle}>How far will you make it?</h2>
        <button className={styles.steamBtn} type="button" disabled aria-disabled="true">
          Coming to Steam
        </button>
        <p className={styles.ctaNote}>Wishlist coming soon · PC · 1–4 player online co-op</p>
      </Reveal>
    </section>
  )
}

function RapidsFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerMark}>RAPIDS</span>
      <span className={styles.footerMeta}>© 2026 · Made with Unity</span>
    </footer>
  )
}

export function Rapids() {
  return (
    <main className={styles.page}>
      <Hero />
      <Pitch />
      <Mechanics />
      <Showcase />
      <CoOp />
      <CallToAction />
      <RapidsFooter />
    </main>
  )
}
