import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export function NotFound() {
  return (
    <div className={styles.wrap}>
      <div className={styles.code}>404</div>
      <div className={styles.meta}>// PAGE NOT FOUND</div>
      <Link to="/" className={styles.cta}>[ GO HOME ]</Link>
    </div>
  )
}
