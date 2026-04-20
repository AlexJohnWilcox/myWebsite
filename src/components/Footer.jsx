import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.foot}>
      <div className={styles.left}>
        <a href="mailto:alexwilcox3@icloud.com">alexwilcox3@icloud.com</a>
        <a href="https://github.com/AlexJohnWilcox" target="_blank" rel="noopener noreferrer">github</a>
        <a href="https://www.linkedin.com/in/alexjwilcox/" target="_blank" rel="noopener noreferrer">linkedin</a>
      </div>
      <div>BUILT WITH REACT + VITE · {new Date().getFullYear()}</div>
    </footer>
  )
}
