import styles from './GlitchText.module.css'

export function GlitchText({ as: Tag = 'span', children, className = '' }) {
  return <Tag className={`${styles.glitch} ${className}`}>{children}</Tag>
}
