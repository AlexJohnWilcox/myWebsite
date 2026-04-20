import { useEffect, useRef, useState, useCallback } from 'react'

const SPEED_MAP = { slow: 55, fast: 18, flash: 8 }
const MAX_DURATION = 1600

export function useTypewriter(text, { speed = 'fast', trigger = true } = {}) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  const msPerChar = (() => {
    const base = SPEED_MAP[speed] ?? SPEED_MAP.fast
    const totalIfBase = base * text.length
    if (totalIfBase <= MAX_DURATION) return base
    return Math.max(1, MAX_DURATION / text.length)
  })()

  const stop = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const skip = useCallback(() => {
    stop()
    indexRef.current = text.length
    setDisplayed(text)
    setIsDone(true)
  }, [text])

  useEffect(() => {
    if (!trigger) {
      setDisplayed('')
      setIsDone(false)
      indexRef.current = 0
      return
    }

    const tick = () => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        setIsDone(true)
        return
      }
      timerRef.current = setTimeout(tick, msPerChar)
    }

    timerRef.current = setTimeout(tick, msPerChar)
    return stop
  }, [text, trigger, msPerChar])

  return { displayed, isDone, skip }
}
