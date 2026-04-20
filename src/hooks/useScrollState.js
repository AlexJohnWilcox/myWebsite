import { useEffect, useState } from 'react'

export function useScrollState(threshold = 48) {
  const [past, setPast] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.scrollY > threshold
  })

  useEffect(() => {
    let rafId = null
    const onScroll = () => {
      if (rafId != null) return
      rafId = requestAnimationFrame(() => {
        setPast(window.scrollY > threshold)
        rafId = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [threshold])

  return past
}
