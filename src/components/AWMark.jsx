import styles from './AWMark.module.css'

export function AWMark({ size = 20 }) {
  return (
    <span className={styles.mark} style={{ fontSize: `${size}px` }} aria-hidden="true">
      <span className={styles.aw}>AW</span>
      <span className={styles.us}>_</span>
    </span>
  )
}
