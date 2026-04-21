import { useEffect, useRef, useState } from 'react'
import styles from './Cursor.module.css'

export function Cursor() {
  const dotRef = useRef(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { x: target.x, y: target.y }
    let rafId = null

    const onMove = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!rafId) rafId = requestAnimationFrame(animate)
    }

    const animate = () => {
      pos.x += (target.x - pos.x) * 0.15
      pos.y += (target.y - pos.y) * 0.15
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
      }
      if (Math.abs(target.x - pos.x) > 0.1 || Math.abs(target.y - pos.y) > 0.1) {
        rafId = requestAnimationFrame(animate)
      } else {
        rafId = null
      }
    }

    const onOver = (e) => {
      const t = e.target
      if (t.closest('a, button, [role="button"], [data-interactive]')) setHovering(true)
    }
    const onOut = () => setHovering(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return <div ref={dotRef} className={`${styles.cursor} ${hovering ? styles.hover : ''}`} />
}
