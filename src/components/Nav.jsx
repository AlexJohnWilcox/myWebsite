import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useScrollState } from '@/hooks/useScrollState'
import styles from './Nav.module.css'

export function Nav() {
  const scrolled = useScrollState(48)
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''} ${open ? styles.open : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} onClick={close}>alex.wilcox</Link>
        <div className={styles.spacer} />
        <button className={styles.toggle} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? '[ ✕ ]' : '[ ≡ ]'}
        </button>
        <nav className={styles.links} onClick={close}>
          <NavLink to="/" end className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>About</NavLink>
          <NavLink to="/academics" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Academics</NavLink>
          <NavLink to="/experience" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Experience</NavLink>
          <div className={styles.dropdownWrap}>
            <NavLink to="/projects" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Projects <span className={styles.caret}>▾</span></NavLink>
            <div className={styles.dropdown}>
              <Link to="/projects?category=cybersecurity">Cybersecurity</Link>
              <Link to="/projects?category=games">Games</Link>
              <Link to="/projects?category=other">Other</Link>
            </div>
          </div>
          <a className={styles.link} href="/Images/Resume-Wilcox,A.pdf" target="_blank" rel="noopener noreferrer">Resume</a>
          <NavLink to="/contact" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Contact</NavLink>
          <div className={styles.socials}>
            <a href="https://github.com/AlexJohnWilcox" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GH</a>
            <a href="https://www.linkedin.com/in/alexjwilcox/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LI</a>
          </div>
        </nav>
      </div>
    </header>
  )
}
