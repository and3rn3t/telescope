import { preloadCriticalAssets, usePreloadOnHover } from '@/lib/preload'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

// Keep essential components for initial render
import { InfoTooltip } from '@/components/InfoTooltip'
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator'

// Lazy load heavy components to reduce initial bundle size
const FilterControls = lazy(() =>
  import('@/components/FilterControls').then(m => ({ default: m.FilterControls }))
)
const ImageDetailDialog = lazy(() =>
  import('@/components/ImageDetailDialog').then(m => ({ default: m.ImageDetailDialog }))
)
const LiveStatusDashboard = lazy(() =>
  import('@/components/LiveStatusDashboard').then(m => ({ default: m.LiveStatusDashboard }))
)
const ObservationMetrics = lazy(() =>
  import('@/components/ObservationMetrics').then(m => ({ default: m.ObservationMetrics }))
)
const SpaceTrajectory = lazy(() =>
  import('@/components/SpaceTrajectory').then(m => ({ default: m.SpaceTrajectory }))
)
const TelemetryMonitor = lazy(() =>
  import('@/components/TelemetryMonitor').then(m => ({ default: m.TelemetryMonitor }))
)
const TelescopeAnatomy = lazy(() =>
  import('@/components/TelescopeAnatomy').then(m => ({ default: m.TelescopeAnatomy }))
)
const NASAApiTester = lazy(() =>
  import('@/components/NASAApiTester').then(m => ({ default: m.NASAApiTester }))
)
// Temporarily import Timeline directly for debugging
import { Timeline } from '@/components/Timeline'
// import { ImageTest } from '@/components/ImageTest'
// const Timeline = lazy(() => import('@/components/Timeline').then(m => ({ default: m.Timeline })))

// Keep essential UI components for initial render
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { generalTooltips } from '@/lib/educational-tooltips'
import { fetchJWSTImages } from '@/lib/nasa-api'
import { FilterState, JWSTImage } from '@/lib/types'

// Keep essential icons for navigation
import { Broadcast, ChartBar, Cube, Heart, Planet, Sparkle, WifiHigh } from '@phosphor-icons/react'

function App() {
  const [images, setImages] = useState<JWSTImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<JWSTImage | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all')
  const [mainView, setMainView] = useState<
    'explore' | 'anatomy' | 'trajectory' | 'metrics' | 'live' | 'api-test'
  >('explore')
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('jwst-favorites')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [filters, setFilters] = useState<FilterState>({
    objectType: 'all',
    instrument: 'all',
    distanceRange: [0, Infinity],
  })

  const { preloadOnHover } = usePreloadOnHover()

  useEffect(() => {
    loadImages()
    preloadCriticalAssets()

    // Register service worker for performance improvements
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silently fail if service worker registration fails
      })
    }

    // Check if we're using localStorage fallback and notify user only when needed
    const checkSparkServices = async () => {
      try {
        // Only check for Spark services if we're in a GitHub Spark environment
        if (typeof window !== 'undefined' && window.location.hostname.includes('github')) {
          const response = await fetch('/_spark/loaded', {
            method: 'GET',
            signal: AbortSignal.timeout(1000),
          })

          if (!response.ok) {
            // Silently fall back to localStorage - this is expected in most deployments
          }
        }
      } catch {
        // Silently use localStorage fallback - this is expected in most deployments
      }
    }

    // Only check if we might be in a Spark environment
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('github') || window.location.hostname.includes('spark'))
    ) {
      setTimeout(checkSparkServices, 2000)
    }
  }, [])

  const loadImages = async () => {
    setLoading(true)
    try {
      console.warn('🚀 Starting to fetch JWST images...')
      const data = await fetchJWSTImages()
      console.warn(`📊 Received ${data.length} images from NASA API`)
      if (data.length > 0) {
        console.warn(
          'First 3 images:',
          data.slice(0, 3).map(img => ({
            title: img.title,
            thumbnailUrl: img.thumbnailUrl,
            distance: img.distance,
          }))
        )
      }
      setImages(data)
      toast.success(`Images refreshed successfully (${data.length} found)`)
    } catch (error) {
      console.error('Failed to load JWST images:', error)
      toast.error('Failed to load JWST images. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const {
    containerRef,
    pullToRefreshStyle,
    shouldShowIndicator,
    indicatorOpacity,
    isRefreshing,
    pullDistance,
    threshold,
  } = usePullToRefresh({
    onRefresh: loadImages,
  })

  const handleFavoriteToggle = (imageId: string) => {
    setFavorites(currentFavorites => {
      const favs = currentFavorites || []
      const isFavorited = favs.includes(imageId)
      const newFavorites = isFavorited ? favs.filter(id => id !== imageId) : [...favs, imageId]

      // Save to localStorage
      try {
        localStorage.setItem('jwst-favorites', JSON.stringify(newFavorites))
      } catch (error) {
        console.warn('Failed to save favorites:', error)
      }

      // Haptic feedback for mobile
      import('@/lib/haptic-feedback').then(({ successFeedback }) => {
        successFeedback()
      })

      // Show toast notification
      if (isFavorited) {
        toast.success('Removed from collection')
      } else {
        toast.success('Added to collection')
      }

      return newFavorites
    })
  }

  const filteredImages = useMemo(() => {
    let filtered = images
    const favs = favorites || []

    console.warn(`🔍 Filtering ${images.length} total images`)
    console.warn(`   Active tab: ${activeTab}`)
    console.warn(`   Object type filter: ${filters.objectType}`)
    console.warn(`   Instrument filter: ${filters.instrument}`)
    console.warn(`   Favorites: ${favs.length}`)

    if (filters.objectType !== 'all') {
      filtered = filtered.filter(img => img.objectType === filters.objectType)
      console.warn(`   After object type filter: ${filtered.length}`)
    }

    if (filters.instrument !== 'all') {
      filtered = filtered.filter(img => img.instrument === filters.instrument)
      console.warn(`   After instrument filter: ${filtered.length}`)
    }

    if (activeTab === 'favorites') {
      filtered = filtered.filter(img => favs.includes(img.id))
      console.warn(`   After favorites filter: ${filtered.length}`)
    }

    console.warn(`✅ Final filtered images: ${filtered.length}`)

    return filtered
  }, [images, filters, activeTab, favorites])

  return (
    <div className="min-h-screen cosmic-gradient-bg cosmic-starfield" ref={containerRef}>
      <PullToRefreshIndicator
        isVisible={shouldShowIndicator}
        opacity={indicatorOpacity}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        threshold={threshold}
      />

      <div
        className="relative overflow-hidden transition-transform duration-300 ease-out"
        style={pullToRefreshStyle}
      >
        <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />{' '}
        <div className="relative">
          <header className="border-b backdrop-blur-sm cosmic-header">
            <div className="cosmic-container py-3 sm:py-6">
              <div className="flex flex-col gap-2.5 sm:gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 rounded-lg cosmic-logo cosmic-glow shrink-0">
                      <Sparkle size={20} weight="fill" className="text-white sm:w-7 sm:h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Improved mobile title handling */}
                      <h1 className="text-lg sm:text-2xl font-bold text-white leading-tight">
                        <span className="hidden sm:inline">JWST Deep Sky Explorer</span>
                        <span className="sm:hidden">JWST Explorer</span>
                      </h1>
                      <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                        <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
                          <span className="hidden sm:inline">Journey through space and time</span>
                          <span className="sm:hidden">Explore the cosmos</span>
                        </p>
                        <div className="hidden sm:block">
                          <InfoTooltip
                            content={generalTooltips.cosmicTimeline}
                            side="bottom"
                            iconSize={14}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs
                  value={mainView}
                  onValueChange={v => {
                    // Haptic feedback for tab selection
                    import('@/lib/haptic-feedback').then(({ selectionFeedback }) => {
                      selectionFeedback()
                    })
                    setMainView(v as typeof mainView)
                  }}
                >
                  {/* Desktop Navigation - Horizontal Tabs */}
                  <div className="hidden sm:block">
                    <TabsList className="cosmic-nav-tabs w-fit">
                      <TabsTrigger
                        value="live"
                        className="cosmic-nav-tab gap-2 text-sm px-4 touch-manipulation"
                        data-slot="trigger"
                      >
                        <Broadcast size={16} className="shrink-0" />
                        <span>Live Status</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="explore"
                        className="cosmic-nav-tab gap-2 text-sm px-4 touch-manipulation"
                        data-slot="trigger"
                      >
                        <Sparkle size={16} className="shrink-0" />
                        <span>Explorer</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="anatomy"
                        className="cosmic-nav-tab gap-2 text-sm px-4 touch-manipulation"
                        data-slot="trigger"
                        {...preloadOnHover('anatomy')}
                      >
                        <Cube size={16} className="shrink-0" />
                        <span>Anatomy</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="trajectory"
                        className="cosmic-nav-tab gap-2 text-sm px-4 touch-manipulation"
                        data-slot="trigger"
                        {...preloadOnHover('trajectory')}
                      >
                        <Planet size={16} className="shrink-0" />
                        <span>Mission</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="metrics"
                        className="cosmic-nav-tab gap-2 text-sm px-4 touch-manipulation"
                        data-slot="trigger"
                      >
                        <ChartBar size={16} className="shrink-0" />
                        <span>Metrics</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="api-test"
                        className="cosmic-nav-tab gap-2 text-sm px-4 touch-manipulation"
                        data-slot="trigger"
                      >
                        <WifiHigh size={16} className="shrink-0" />
                        <span>API Test</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Mobile Navigation - Compact with Scroll Snap */}
                  <div className="sm:hidden overflow-x-auto -mx-4 px-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
                    <TabsList className="cosmic-nav-tabs inline-flex w-max min-w-full gap-1.5">
                      <TabsTrigger
                        value="live"
                        className="cosmic-nav-tab flex-col gap-1 min-w-[70px] px-2 py-2 touch-manipulation snap-start"
                        data-slot="trigger"
                      >
                        <Broadcast size={20} className="shrink-0" />
                        <span className="text-[10px] leading-none">Live</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="explore"
                        className="cosmic-nav-tab flex-col gap-1 min-w-[70px] px-2 py-2 touch-manipulation snap-start"
                        data-slot="trigger"
                      >
                        <Sparkle size={20} className="shrink-0" />
                        <span className="text-[10px] leading-none">Explore</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="anatomy"
                        className="cosmic-nav-tab flex-col gap-1 min-w-[70px] px-2 py-2 touch-manipulation snap-start"
                        data-slot="trigger"
                      >
                        <Cube size={20} className="shrink-0" />
                        <span className="text-[10px] leading-none">3D View</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="trajectory"
                        className="cosmic-nav-tab flex-col gap-1 min-w-[70px] px-2 py-2 touch-manipulation snap-start"
                        data-slot="trigger"
                      >
                        <Planet size={20} className="shrink-0" />
                        <span className="text-[10px] leading-none">Orbit</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="metrics"
                        className="cosmic-nav-tab flex-col gap-1 min-w-[70px] px-2 py-2 touch-manipulation snap-start"
                        data-slot="trigger"
                      >
                        <ChartBar size={20} className="shrink-0" />
                        <span className="text-[10px] leading-none">Data</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="api-test"
                        className="cosmic-nav-tab flex-col gap-1 min-w-[70px] px-2 py-2 touch-manipulation snap-start"
                        data-slot="trigger"
                      >
                        <WifiHigh size={20} className="shrink-0" />
                        <span className="text-[10px] leading-none">API</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>

                {mainView === 'explore' && (
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <Tabs
                        value={activeTab}
                        onValueChange={v => {
                          // Haptic feedback for sub-tab selection
                          import('@/lib/haptic-feedback').then(({ selectionFeedback }) => {
                            selectionFeedback()
                          })
                          setActiveTab(v as 'all' | 'favorites')
                        }}
                      >
                        <TabsList className="cosmic-nav-tabs w-full sm:w-fit grid grid-cols-2 sm:inline-flex">
                          <TabsTrigger
                            value="all"
                            className="cosmic-nav-tab gap-2 text-sm px-4 py-2.5 touch-manipulation"
                            data-slot="trigger"
                          >
                            <Sparkle size={18} className="shrink-0" />
                            <span>All Images</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="favorites"
                            className="cosmic-nav-tab gap-2 text-sm px-4 py-2.5 touch-manipulation relative"
                            data-slot="trigger"
                          >
                            <Heart
                              size={18}
                              weight={(favorites?.length || 0) > 0 ? 'fill' : 'regular'}
                              className="shrink-0"
                            />
                            <span>Favorites</span>
                            {(favorites?.length || 0) > 0 && (
                              <span className="ml-1.5 px-1.5 py-0.5 min-w-5 text-center rounded-full bg-yellow-400 text-slate-900 text-xs font-bold leading-none">
                                {favorites.length}
                              </span>
                            )}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <div className="w-full sm:w-auto">
                        <Suspense fallback={<Skeleton className="w-full h-10 rounded-lg" />}>
                          <FilterControls filters={filters} onFilterChange={setFilters} />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="cosmic-container py-6 sm:py-8">
            {mainView === 'live' && (
              <div className="space-y-8">
                <Suspense fallback={<Skeleton className="w-full h-64 rounded-lg" />}>
                  <LiveStatusDashboard />
                </Suspense>
                <Suspense fallback={<Skeleton className="w-full h-32 rounded-lg" />}>
                  <TelemetryMonitor />
                </Suspense>
              </div>
            )}

            {mainView === 'explore' && (
              <>
                {(() => {
                  console.warn(
                    `🔄 Render state: loading=${loading}, images=${images.length}, filteredImages=${filteredImages.length}`
                  )
                  return null
                })()}
                {loading ? (
                  /* Debug: Currently loading... */
                  <>
                    <div className="hidden sm:flex gap-4 overflow-hidden pb-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="shrink-0 w-72">
                          <Skeleton className="w-full aspect-square rounded-lg" />
                          <Skeleton className="w-3/4 h-4 mt-4" />
                          <Skeleton className="w-1/2 h-3 mt-2" />
                        </div>
                      ))}
                    </div>
                    <div className="sm:hidden space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={`mobile-${i}`} className="w-full">
                          <Skeleton className="w-full aspect-square rounded-lg" />
                          <Skeleton className="w-3/4 h-4 mt-4" />
                          <Skeleton className="w-1/2 h-3 mt-2" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : activeTab === 'favorites' && (favorites?.length || 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center cosmic-float">
                    <div className="p-6 rounded-full cosmic-logo cosmic-glow mb-4">
                      <Heart size={48} className="text-white" />
                    </div>
                    <h2 className="cosmic-heading-lg mb-2">No favorites yet</h2>
                    <p className="cosmic-body max-w-md">
                      Start exploring and add images to your collection by clicking the heart icon
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-baseline gap-3">
                      <h2 className="cosmic-heading-lg">
                        {activeTab === 'favorites' ? 'Your Collection' : 'Cosmic Timeline'}
                      </h2>
                      <p className="cosmic-caption">
                        {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
                        {activeTab === 'all' && ' • Sorted by distance from Earth'}
                      </p>
                      {activeTab === 'all' && (
                        <InfoTooltip
                          content={generalTooltips.infraredVision}
                          side="bottom"
                          iconSize={14}
                        />
                      )}
                    </div>

                    <Timeline
                      images={filteredImages}
                      favorites={favorites || []}
                      onImageClick={setSelectedImage}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </div>
                )}
              </>
            )}

            {mainView === 'anatomy' && (
              <Suspense fallback={<Skeleton className="w-full h-96 rounded-lg" />}>
                <TelescopeAnatomy />
              </Suspense>
            )}
            {mainView === 'trajectory' && (
              <Suspense fallback={<Skeleton className="w-full h-96 rounded-lg" />}>
                <SpaceTrajectory />
              </Suspense>
            )}
            {mainView === 'metrics' && (
              <Suspense fallback={<Skeleton className="w-full h-96 rounded-lg" />}>
                <ObservationMetrics images={images} />
              </Suspense>
            )}
            {mainView === 'api-test' && (
              <Suspense fallback={<Skeleton className="w-full h-96 rounded-lg" />}>
                <NASAApiTester />
              </Suspense>
            )}
          </main>
        </div>
      </div>

      <Suspense fallback={null}>
        <ImageDetailDialog
          image={selectedImage}
          isOpen={!!selectedImage}
          isFavorited={selectedImage ? (favorites || []).includes(selectedImage.id) : false}
          onClose={() => setSelectedImage(null)}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </Suspense>
    </div>
  )
}

export default App
