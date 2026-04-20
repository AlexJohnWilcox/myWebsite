import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from '../useTypewriter'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useTypewriter', () => {
  it('starts empty when trigger is false', () => {
    const { result } = renderHook(() => useTypewriter('hello', { speed: 'fast', trigger: false }))
    expect(result.current.displayed).toBe('')
    expect(result.current.isDone).toBe(false)
  })

  it('types all characters when trigger is true', () => {
    const { result } = renderHook(() => useTypewriter('hi', { speed: 'fast', trigger: true }))
    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.displayed).toBe('hi')
    expect(result.current.isDone).toBe(true)
  })

  it('caps long paragraphs at 1600ms', () => {
    const long = 'x'.repeat(200) // 200 chars × 18ms = 3600ms (over cap)
    const { result } = renderHook(() => useTypewriter(long, { speed: 'fast', trigger: true }))
    act(() => { vi.advanceTimersByTime(1700) })
    expect(result.current.isDone).toBe(true)
    expect(result.current.displayed).toBe(long)
  })

  it('skip() completes instantly', () => {
    const { result } = renderHook(() => useTypewriter('hello world', { speed: 'slow', trigger: true }))
    act(() => { result.current.skip() })
    expect(result.current.displayed).toBe('hello world')
    expect(result.current.isDone).toBe(true)
  })

  it('uses slow speed for headings', () => {
    const { result } = renderHook(() => useTypewriter('abc', { speed: 'slow', trigger: true }))
    act(() => { vi.advanceTimersByTime(54) })
    expect(result.current.displayed.length).toBeLessThan(2)
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current.isDone).toBe(true)
  })
})
