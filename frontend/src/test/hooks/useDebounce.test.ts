import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useDebounce } from '../../hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated' })
    expect(result.current).toBe('initial') // Should still be initial

    // Fast-forward time by 250ms
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('initial') // Should still be initial

    // Fast-forward time by another 250ms (total 500ms)
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('updated') // Should now be updated
  })

  it('should reset timer on new value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    // Change value
    rerender({ value: 'first' })
    act(() => {
      vi.advanceTimersByTime(250)
    })

    // Change value again before first debounce completes
    rerender({ value: 'second' })
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('initial') // Should still be initial

    // Complete the debounce
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('second') // Should be the latest value
  })

  it('should work with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })
    
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('updated')
  })
})
