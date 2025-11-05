import { useCallback, useEffect, useRef, useState } from 'react'
import { useIsMobile } from './use-mobile'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  resistance?: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) {
  const isMobile = useIsMobile()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)
  const [canPull, setCanPull] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      if (scrollTop === 0) {
        setStartY(e.touches[0].clientY)
        setCanPull(true)
      }
    },
    [isMobile]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isMobile || !canPull || isRefreshing) return

      const currentY = e.touches[0].clientY
      const diff = currentY - startY

      if (diff > 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault()
        const distance = Math.min(diff / resistance, threshold * 1.5)
        setPullDistance(distance)
      }
    },
    [isMobile, canPull, isRefreshing, startY, resistance, threshold]
  )

  const handleTouchEnd = useCallback(async () => {
    if (!isMobile || !canPull || isRefreshing) return

    setCanPull(false)

    if (pullDistance >= threshold) {
      // Haptic feedback when refresh is triggered
      import('@/lib/haptic-feedback').then(({ impactFeedback }) => {
        impactFeedback()
      })

      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull to refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
  }, [isMobile, canPull, isRefreshing, pullDistance, threshold, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !isMobile) return

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isMobile])

  const pullToRefreshStyle = {
    transform: `translateY(${pullDistance}px)`,
    transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
  }

  const indicatorOpacity = Math.min(pullDistance / threshold, 1)
  const shouldShowIndicator = pullDistance > 0 || isRefreshing

  return {
    containerRef,
    pullToRefreshStyle,
    shouldShowIndicator,
    indicatorOpacity,
    isRefreshing,
    pullDistance,
    threshold,
  }
}
