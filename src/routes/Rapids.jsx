import '@fontsource-variable/fredoka'
import { motion } from 'framer-motion'
import { Media } from '@/components/rapids/Media'
import styles from './Rapids.module.css'

export const STEAM_URL = 'https://store.steampowered.com/app/4896950/Rapid_Raccoons/'
const M = '/rapidraccoons'

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
    title: 'You Are the Clean-Up Crew',
    body: 'Nothing is loaded for you. The cargo is out in the current, wedged against rocks and stranded on islands. Go and get it, then get it to the dock in one piece. Or close enough.',
    media: { type: 'video', src: `${M}/overboard.mp4`, label: 'A critter goes overboard reaching for cargo' },
  },
  {
    title: 'Success Is the Problem',
    body: 'You start empty, light and quick. Every crate you win makes the raft heavier, slower and more stressed, and hands the river more to take from you. "Do we go for that one?" gets answered out loud, at speed, with the crew disagreeing.',
    media: { type: 'image', src: `${M}/shot-04.jpg`, label: 'A loaded raft heading for a drop' },
  },
  {
    title: 'The River Fights Back',
    body: 'Rocks, logs and branches that hold the raft while you cut loose. Bears on the bank, eagles overhead, a troll in the caves, an octopus under the boards. And behind all of it, a wall of water that never stops and never gets tired.',
    media: { type: 'video', src: `${M}/flying.mp4`, label: 'A critter is thrown clear off the raft' },
  },
]

const SHOTS = [
  { src: `${M}/shot-01.jpg`, label: 'Four critters on a loaded raft in the rapids' },
  { src: `${M}/shot-02.jpg`, label: 'A bear on the bank watches the raft pass' },
  { src: `${M}/shot-03.jpg`, label: 'Looking up the mast at the sky' },
  { src: `${M}/shot-05.jpg`, label: 'The foreman at the dock' },
  { src: `${M}/shot-06.jpg`, label: 'The raft upgrade board' },
  { src: `${M}/shot-08.jpg`, label: 'The prize machine in the tavern' },
  { src: `${M}/shot-07.jpg`, label: 'Blackjack at the tavern table' },
  { src: `${M}/shot-09.jpg`, label: 'A thunderstorm over the river' },
  { src: `${M}/shot-10.jpg`, label: 'The journey map at the end of a run' },
]

const DATES = [
  { when: 'Sep 22', what: 'Free demo on Steam' },
  { when: 'Oct 19 – 26', what: 'Steam Next Fest' },
  { when: 'Dec 1', what: 'Early Access, $6.99' },
]

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroMedia}>
        <Media type="video" src={`${M}/hero.mp4`} poster={`${M}/hero-poster.jpg`} label="Rapid Raccoons trailer" className={styles.heroVideo} />
        <div className={styles.heroScrim} />
      </div>
      <div className={styles.heroContent}>
        <h1 className={styles.wordmark}>
          <img className={styles.sign} src={`${M}/sign.png`} alt="Rapid Raccoons" />
        </h1>
        <p className={styles.tagline}>1 to 4 tiny critters. One raft. A rudder that barely helps.</p>
        <a className={`${styles.steamBtn} ${styles.heroBtn}`} href={STEAM_URL} target="_blank" rel="noopener noreferrer">
          Wishlist on Steam
        </a>
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
          Haul cargo down a river on a raft with <em>no engine and no brakes</em>,
          just a rudder that nudges and a current that decides, with a wall of
          water closing in behind you.
          Everything worth money is already in the water. Go and get it.
        </p>
      </Reveal>
    </section>
  )
}

function Trailer() {
  return (
    <section className={styles.trailer}>
      <Reveal className={styles.trailerInner}>
        <h2 className={styles.trailerTitle}>Watch the trailer</h2>
        <video
          className={styles.trailerVideo}
          src={`${M}/trailer.mp4`}
          poster={`${M}/trailer-poster.jpg`}
          controls
          playsInline
          preload="metadata"
          aria-label="Rapid Raccoons gameplay trailer"
        />
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
        <Reveal key={s.src} className={styles.shot}>
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
        <Media type="video" src={`${M}/craig.mp4`} label="Co-op gameplay" className={styles.coopVideo} />
        <div className={styles.coopScrim} />
      </div>
      <Reveal className={styles.coopText}>
        <h2 className={styles.coopTitle}>Better With a Crew</h2>
        <p className={styles.coopBody}>
          1 to 4 player online co-op, invite friends straight through Steam.
          No fixed roles: somebody works the rudder, somebody wrangles cargo,
          somebody watches the water. It sorts itself out, badly, at volume.
        </p>
      </Reveal>
    </section>
  )
}

function BetweenRuns() {
  return (
    <section className={styles.between}>
      <Reveal className={styles.betweenInner}>
        <h2 className={styles.betweenTitle}>Spend it between runs</h2>
        <p className={styles.betweenBody}>
          Shiny acorns buy raft modifications: a bigger hold, a tougher hull,
          a collection net on the bow, a storage chest, a raft that answers the
          rudder a little sooner. Acorns go into the tavern's prize machine and
          perks come out at random. Hit the quota and the next one is bigger.
          There is no winning, only further.
        </p>
      </Reveal>
    </section>
  )
}

function Dates() {
  return (
    <section className={styles.dates}>
      {DATES.map((d) => (
        <Reveal key={d.when} className={styles.date}>
          <span className={styles.dateWhen}>{d.when}</span>
          <span className={styles.dateWhat}>{d.what}</span>
        </Reveal>
      ))}
    </section>
  )
}

function CallToAction() {
  return (
    <section className={styles.cta}>
      <Reveal className={styles.ctaInner}>
        <h2 className={styles.ctaTitle}>How far will you make it?</h2>
        <a className={styles.steamBtn} href={STEAM_URL} target="_blank" rel="noopener noreferrer">
          Wishlist on Steam
        </a>
        <p className={styles.ctaNote}>PC · 1 to 4 player online co-op · Free demo Sep 22</p>
      </Reveal>
    </section>
  )
}

const SOCIALS = [
  { label: 'Steam', href: STEAM_URL },
  { label: 'YouTube', href: 'https://www.youtube.com/@rapidraccoons' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@rapidraccoons' },
  { label: 'Instagram', href: 'https://www.instagram.com/rapidraccoons' },
]

function RapidsFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerMark}>RAPID RACCOONS</span>
      <div className={styles.footerLinks}>
        {SOCIALS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
        ))}
      </div>
      <span className={styles.footerMeta}>© 2026 · Made with Unity</span>
    </footer>
  )
}

export function Rapids() {
  return (
    <main className={styles.page}>
      <Hero />
      <Pitch />
      <Trailer />
      <Mechanics />
      <Showcase />
      <CoOp />
      <BetweenRuns />
      <Dates />
      <CallToAction />
      <RapidsFooter />
    </main>
  )
}
