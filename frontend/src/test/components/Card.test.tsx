import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from '../../components/ui/Card'

describe('Card', () => {
  it('renders with children', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies default classes', () => {
    render(<Card>Test Card</Card>)
    const card = screen.getByText('Test Card').closest('div')
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Test Card</Card>)
    const card = screen.getByText('Test Card').closest('div')
    expect(card).toHaveClass('custom-class')
  })

  it('renders as different element when as prop is provided', () => {
    render(<Card as="section">Test Card</Card>)
    const card = screen.getByText('Test Card')
    expect(card.tagName).toBe('SECTION')
  })
})
