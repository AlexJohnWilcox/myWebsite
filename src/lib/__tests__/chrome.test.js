import { describe, it, expect } from 'vitest'
import { isBareRoute } from '@/lib/chrome'

describe('isBareRoute', () => {
  it('matches /rapids', () => {
    expect(isBareRoute('/rapids')).toBe(true)
  })
  it('matches /Rapids case-insensitively', () => {
    expect(isBareRoute('/Rapids')).toBe(true)
  })
  it('matches a trailing slash', () => {
    expect(isBareRoute('/rapids/')).toBe(true)
  })
  it('does not match other routes', () => {
    expect(isBareRoute('/')).toBe(false)
    expect(isBareRoute('/about')).toBe(false)
    expect(isBareRoute('/rapids-extra')).toBe(false)
  })
})
