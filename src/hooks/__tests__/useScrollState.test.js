import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollState } from '../useScrollState'

afterEach(() => {
  window.scrollY = 0
  vi.restoreAllMocks()
})

async function fireScroll(y) {
  window.scrollY = y
  window.dispatchEvent(new Event('scroll'))
  // let rAF callback flush
  await new Promise((r) => setTimeout(r, 20))
}

describe('useScrollState', () => {
  it('returns false when scroll is below threshold', () => {
    const { result } = renderHook(() => useScrollState(48))
    expect(result.current).toBe(false)
  })

  it('returns true when scroll crosses threshold', async () => {
    const { result } = renderHook(() => useScrollState(48))
    await act(async () => { await fireScroll(100) })
    expect(result.current).toBe(true)
  })

  it('returns false again after scrolling back above threshold', async () => {
    const { result } = renderHook(() => useScrollState(48))
    await act(async () => { await fireScroll(200) })
    await act(async () => { await fireScroll(10) })
    expect(result.current).toBe(false)
  })
})
