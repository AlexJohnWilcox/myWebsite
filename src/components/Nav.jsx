import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useScrollState } from '@/hooks/useScrollState'
import { AWMark } from './AWMark'
import styles from './Nav.module.css'

export function Nav() {
  const scrolled = useScrollState(48)
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''} ${open ? styles.open : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} onClick={close}>
          <span className={styles.slashes}>//</span>
          <span className={styles.wordmark}>alex john wilcox</span>
        </Link>
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
              <Link to="/projects?category=web-design">Web Design</Link>
              <Link to="/projects?category=internship">Internship</Link>
              <Link to="/projects?category=games">Games</Link>
            </div>
          </div>
          <NavLink to="/security" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Security</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Contact</NavLink>
          <div className={styles.socials}>
            <a href="https://github.com/AlexJohnWilcox" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.63 7.63 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/alexjwilcox/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169H6.29c.032.678 0 7.225 0 7.225h2.36z"/></svg>
            </a>
            <a href="/Images/Resume-Wilcox,A.pdf" target="_blank" rel="noopener noreferrer" aria-label="Resume" title="Resume" download>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5.414a1 1 0 0 0-.293-.707L10.293 1.293A1 1 0 0 0 9.586 1H4zm5 1.5L12.5 6H10a1 1 0 0 1-1-1V2.5zM4.5 9h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1zm0 2h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1zm0-4h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1z"/></svg>
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
