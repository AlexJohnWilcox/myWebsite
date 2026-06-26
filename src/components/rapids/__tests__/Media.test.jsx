import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Media } from '@/components/rapids/Media'

describe('Media', () => {
  it('renders a labeled placeholder when no src is given', () => {
    render(<Media label="hero.mp4" />)
    expect(screen.getByLabelText('hero.mp4')).toBeInTheDocument()
    expect(screen.getByText('hero.mp4')).toBeInTheDocument()
  })

  it('renders an image element for an image src', () => {
    render(<Media type="image" src="/rapids/shot-01.jpg" label="Screenshot one" />)
    const img = screen.getByAltText('Screenshot one')
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', '/rapids/shot-01.jpg')
  })

  it('renders a muted looping video for a video src', () => {
    const { container } = render(<Media type="video" src="/rapids/hero.mp4" label="Hero clip" />)
    const video = container.querySelector('video')
    expect(video).toBeTruthy()
    expect(video).toHaveAttribute('src', '/rapids/hero.mp4')
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(true)
  })
})
