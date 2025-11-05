import { FilterControls } from '@/components/FilterControls'
import { ImageDetailDialog } from '@/components/ImageDetailDialog'
import { InfoTooltip } from '@/components/InfoTooltip'
import { LiveStatusDashboard } from '@/components/LiveStatusDashboard'
import { ObservationMetrics } from '@/components/ObservationMetrics'
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator'
import { SpaceTrajectory } from '@/components/SpaceTrajectory'
import { TelemetryMonitor } from '@/components/TelemetryMonitor'
import { TelescopeAnatomy } from '@/components/TelescopeAnatomy'
import { Timeline } from '@/components/Timeline'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { generalTooltips } from '@/lib/educational-tooltips'
import { fetchJWSTImages } from '@/lib/nasa-api'
import { FilterState, JWSTImage } from '@/lib/types'
import { Broadcast, ChartBar, Cube, Heart, Planet, Sparkle } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

function App() {
  const [images, setImages] = useState<JWSTImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<JWSTImage | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all')
  const [mainView, setMainView] = useState<
    'explore' | 'anatomy' | 'trajectory' | 'metrics' | 'live'
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

  useEffect(() => {
    loadImages()

    // Check if we're using localStorage fallback and notify user
    const checkSparkServices = async () => {
      try {
        // Try to detect if Spark services are available
        const response = await fetch('/_spark/loaded', {
          method: 'POST',
          signal: AbortSignal.timeout(2000),
        })

        if (!response.ok && response.status === 401) {
          toast.info('Using local storage for favorites (Spark services unavailable)', {
            duration: 5000,
          })
        }
      } catch (error) {
        // Spark services unavailable - using localStorage fallback
        console.warn('Spark KV service unavailable, using localStorage:', error)
        toast.info('Running in offline mode - favorites saved locally', {
          duration: 3000,
        })
      }
    }

    // Delay the check to avoid interfering with initial load
    setTimeout(checkSparkServices, 2000)
  }, [])

  const loadImages = async () => {
    setLoading(true)
    try {
      const data = await fetchJWSTImages()
      setImages(data)
      toast.success('Images refreshed successfully')
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

    if (filters.objectType !== 'all') {
      filtered = filtered.filter(img => img.objectType === filters.objectType)
    }

    if (filters.instrument !== 'all') {
      filtered = filtered.filter(img => img.instrument === filters.instrument)
    }

    if (activeTab === 'favorites') {
      filtered = filtered.filter(img => favs.includes(img.id))
    }

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
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />{' '}
        <div className="relative">
          <header className="border-b backdrop-blur-sm cosmic-header">
            <div className="cosmic-container py-4 sm:py-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 rounded-lg cosmic-logo cosmic-glow shrink-0">
                      <Sparkle size={24} weight="fill" className="text-white sm:w-7 sm:h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="cosmic-heading-xl truncate">JWST Deep Sky Explorer</h1>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="cosmic-body truncate">Journey through space and time</p>
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
                  <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                    <TabsList className="cosmic-nav-tabs w-max sm:w-fit">
                      <TabsTrigger
                        value="live"
                        className="cosmic-nav-tab gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 touch-manipulation"
                        data-slot="trigger"
                      >
                        <Broadcast size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Live Status</span>
                        <span className="xs:hidden">Live</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="explore"
                        className="cosmic-nav-tab gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 touch-manipulation"
                        data-slot="trigger"
                      >
                        <Sparkle size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Image Explorer</span>
                        <span className="xs:hidden">Explore</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="anatomy"
                        className="cosmic-nav-tab gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 touch-manipulation"
                        data-slot="trigger"
                      >
                        <Cube size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Telescope Anatomy</span>
                        <span className="xs:hidden">Anatomy</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="trajectory"
                        className="cosmic-nav-tab gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 touch-manipulation"
                        data-slot="trigger"
                      >
                        <Planet size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Mission & Orbit</span>
                        <span className="xs:hidden">Mission</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="metrics"
                        className="cosmic-nav-tab gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 touch-manipulation"
                        data-slot="trigger"
                      >
                        <ChartBar size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Mission Metrics</span>
                        <span className="xs:hidden">Metrics</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>

                {mainView === 'explore' && (
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <Tabs
                        value={activeTab}
                        onValueChange={v => setActiveTab(v as 'all' | 'favorites')}
                      >
                        <TabsList className="cosmic-nav-tabs w-full sm:w-fit">
                          <TabsTrigger
                            value="all"
                            className="cosmic-nav-tab gap-1.5 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
                            data-slot="trigger"
                          >
                            <Sparkle size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Explore All</span>
                            <span className="xs:hidden">All</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="favorites"
                            className="cosmic-nav-tab gap-1.5 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
                            data-slot="trigger"
                          >
                            <Heart
                              size={14}
                              weight={(favorites?.length || 0) > 0 ? 'fill' : 'regular'}
                              className="sm:w-4 sm:h-4"
                            />
                            <span className="hidden xs:inline">My Collection</span>
                            <span className="xs:hidden">Saved</span>
                            {(favorites?.length || 0) > 0 && (
                              <span className="ml-1 px-1.5 py-0.5 rounded-full cosmic-accent text-white text-xs font-medium">
                                {favorites?.length || 0}
                              </span>
                            )}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <div className="w-full sm:w-auto">
                        <FilterControls filters={filters} onFilterChange={setFilters} />
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
                <LiveStatusDashboard />
                <TelemetryMonitor />
              </div>
            )}

            {mainView === 'explore' && (
              <>
                {loading ? (
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

            {mainView === 'anatomy' && <TelescopeAnatomy />}
            {mainView === 'trajectory' && <SpaceTrajectory />}
            {mainView === 'metrics' && <ObservationMetrics />}
          </main>
        </div>
      </div>

      <ImageDetailDialog
        image={selectedImage}
        isOpen={!!selectedImage}
        isFavorited={selectedImage ? (favorites || []).includes(selectedImage.id) : false}
        onClose={() => setSelectedImage(null)}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </div>
  )
}

export default App
