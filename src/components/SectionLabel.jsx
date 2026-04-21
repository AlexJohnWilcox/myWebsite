import styles from './SectionLabel.module.css'

export function SectionLabel({ index, children, className = '' }) {
  const num = String(index).padStart(2, '0')
  return (
    <span className={`${styles.label} ${className}`}>
      {num} · {children}
    </span>
  )
}
