import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AWMark } from '../AWMark'

describe('AWMark', () => {
  it('renders AW letters and an underscore', () => {
    render(<AWMark size={20} />)
    expect(screen.getByText('AW')).toBeInTheDocument()
    expect(screen.getByText('_')).toBeInTheDocument()
  })

  it('applies the size prop as font-size', () => {
    const { container } = render(<AWMark size={32} />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveStyle({ fontSize: '32px' })
  })
})
