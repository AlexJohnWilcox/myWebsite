import { useEffect, useRef, useState } from 'react'
import { useTypewriter } from '@/hooks/useTypewriter'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './Typewriter.module.css'

export function Typewriter({ as: Tag = 'span', speed = 'fast', delay = 0, children, className = '', onComplete }) {
  const text = typeof children === 'string' ? children : String(children ?? '')
  const wrapRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [caretVisible, setCaretVisible] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) { setInView(true); return }
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => setInView(true), delay)
            } else {
              setInView(true)
            }
            observer.disconnect()
            return
          }
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced, delay])

  const { displayed, isDone, skip } = useTypewriter(text, { speed, trigger: inView })

  useEffect(() => {
    if (!inView) return
    setCaretVisible(true)
  }, [inView])

  useEffect(() => {
    if (!isDone) return
    if (onComplete) onComplete()
    const id = setTimeout(() => setCaretVisible(false), 800)
    return () => clearTimeout(id)
  }, [isDone, onComplete])

  if (reduced) {
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <Tag
      ref={wrapRef}
      className={`${styles.wrap} ${className}`}
      onClick={skip}
      aria-label={text}
    >
      <span className={styles.ghost} aria-hidden="true">{text}</span>
      <span className={styles.live} aria-hidden="true">
        {displayed}
        {caretVisible && (
          <span className={`${styles.caret} ${isDone ? styles.caretBlink : ''}`} />
        )}
      </span>
    </Tag>
  )
}
