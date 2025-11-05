// Preload critical assets and components for better perceived performance
export const preloadCriticalAssets = () => {
  // Preload essential images that are likely to be needed immediately
  const criticalImages = [
    // Add paths to critical images here
  ]

  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = src
    document.head.appendChild(link)
  })
}

// Preload components based on user interaction hints
export const preloadComponent = (componentName: string) => {
  switch (componentName) {
    case 'timeline':
      import('@/components/Timeline')
      break
    case 'filters':
      import('@/components/FilterControls')
      break
    case 'anatomy':
      import('@/components/TelescopeAnatomy')
      break
    case 'trajectory':
      import('@/components/SpaceTrajectory')
      break
    case 'metrics':
      import('@/components/ObservationMetrics')
      break
    case 'live':
      import('@/components/LiveStatusDashboard')
      import('@/components/TelemetryMonitor')
      break
    case 'dialog':
      import('@/components/ImageDetailDialog')
      break
  }
}

// Preload on hover - start loading component before user clicks
export const usePreloadOnHover = () => {
  const preloadOnHover = (componentName: string) => {
    let timeoutId: NodeJS.Timeout

    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        preloadComponent(componentName)
      }, 100) // Small delay to avoid unnecessary preloads
    }

    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    return { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
  }

  return { preloadOnHover }
}
