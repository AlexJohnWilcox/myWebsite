import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollState } from '../useScrollState'

beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0)
    return null
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
})

afterEach(() => {
  window.scrollY = 0
  vi.restoreAllMocks()
})

function fireScroll(y) {
  window.scrollY = y
  window.dispatchEvent(new Event('scroll'))
}

describe('useScrollState', () => {
  it('returns false when scroll is below threshold', () => {
    const { result } = renderHook(() => useScrollState(48))
    expect(result.current).toBe(false)
  })

  it('returns true when scroll crosses threshold', () => {
    const { result } = renderHook(() => useScrollState(48))
    act(() => { fireScroll(100) })
    expect(result.current).toBe(true)
  })

  it('returns false again after scrolling back above threshold', () => {
    const { result } = renderHook(() => useScrollState(48))
    act(() => { fireScroll(200) })
    act(() => { fireScroll(10) })
    expect(result.current).toBe(false)
  })
})
