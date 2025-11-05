import { cn } from '@/lib/utils'
import { ArrowClockwise, Sparkle } from '@phosphor-icons/react'

interface PullToRefreshIndicatorProps {
  isVisible: boolean
  opacity: number
  isRefreshing: boolean
  pullDistance: number
  threshold: number
}

export function PullToRefreshIndicator({
  isVisible,
  opacity,
  isRefreshing,
  pullDistance,
  threshold,
}: PullToRefreshIndicatorProps) {
  if (!isVisible) return null

  const progress = Math.min(pullDistance / threshold, 1)
  const rotationDegrees = progress * 180

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 transition-opacity duration-200"
      style={{ opacity }}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300',
          isRefreshing
            ? 'bg-primary/90 text-primary-foreground'
            : progress >= 1
              ? 'bg-accent/90 text-accent-foreground'
              : 'bg-muted/90 text-muted-foreground'
        )}
      >
        {isRefreshing ? (
          <>
            <Sparkle size={16} weight="fill" className="animate-spin" />
            <span className="text-sm font-medium">Loading images...</span>
          </>
        ) : progress >= 1 ? (
          <>
            <ArrowClockwise
              size={16}
              weight="bold"
              style={{ transform: `rotate(${rotationDegrees}deg)` }}
            />
            <span className="text-sm font-medium">Release to refresh</span>
          </>
        ) : (
          <>
            <ArrowClockwise
              size={16}
              style={{
                transform: `rotate(${rotationDegrees}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
            />
            <span className="text-sm font-medium">Pull to refresh</span>
          </>
        )}
      </div>
    </div>
  )
}
