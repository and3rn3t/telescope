import { useState, useEffect, useMemo } from 'react'
import { JWSTImage, FilterState } from '@/lib/types'
import { fetchJWSTImages } from '@/lib/nasa-api'
import { Timeline } from '@/components/Timeline'
import { ImageDetailDialog } from '@/components/ImageDetailDialog'
import { FilterControls } from '@/components/FilterControls'
import { InfoTooltip } from '@/components/InfoTooltip'
import { TelescopeAnatomy } from '@/components/TelescopeAnatomy'
import { SpaceTrajectory } from '@/components/SpaceTrajectory'
import { ObservationMetrics } from '@/components/ObservationMetrics'
import { LiveStatusDashboard } from '@/components/LiveStatusDashboard'
import { TelemetryMonitor } from '@/components/TelemetryMonitor'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Sparkle, Heart, Cube, Planet, ChartBar, Broadcast } from '@phosphor-icons/react'
import { generalTooltips } from '@/lib/educational-tooltips'

function App() {
  const [images, setImages] = useState<JWSTImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<JWSTImage | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all')
  const [mainView, setMainView] = useState<'explore' | 'anatomy' | 'trajectory' | 'metrics' | 'live'>('explore')
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
          signal: AbortSignal.timeout(2000)
        })
        
        if (!response.ok && response.status === 401) {
          toast.info('Using local storage for favorites (Spark services unavailable)', {
            duration: 5000
          })
        }
      } catch (error) {
        // Spark services unavailable - using localStorage fallback
        toast.info('Running in offline mode - favorites saved locally', {
          duration: 3000
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
    } catch (error) {
      toast.error('Failed to load JWST images. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = (imageId: string) => {
    setFavorites((currentFavorites) => {
      const favs = currentFavorites || []
      const isFavorited = favs.includes(imageId)
      const newFavorites = isFavorited
        ? favs.filter(id => id !== imageId)
        : [...favs, imageId]
      
      // Save to localStorage
      try {
        localStorage.setItem('jwst-favorites', JSON.stringify(newFavorites))
      } catch (error) {
        console.warn('Failed to save favorites:', error)
      }
      
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
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative">
          <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
            <div className="container mx-auto px-4 sm:px-6 py-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkle size={28} weight="fill" className="text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        JWST Deep Sky Explorer
                      </h1>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-muted-foreground">
                          Journey through space and time
                        </p>
                        <InfoTooltip 
                          content={generalTooltips.cosmicTimeline}
                          side="bottom"
                          iconSize={14}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs value={mainView} onValueChange={(v) => setMainView(v as any)}>
                  <TabsList>
                    <TabsTrigger value="live" className="gap-2">
                      <Broadcast size={16} />
                      Live Status
                    </TabsTrigger>
                    <TabsTrigger value="explore" className="gap-2">
                      <Sparkle size={16} />
                      Image Explorer
                    </TabsTrigger>
                    <TabsTrigger value="anatomy" className="gap-2">
                      <Cube size={16} />
                      Telescope Anatomy
                    </TabsTrigger>
                    <TabsTrigger value="trajectory" className="gap-2">
                      <Planet size={16} />
                      Mission & Orbit
                    </TabsTrigger>
                    <TabsTrigger value="metrics" className="gap-2">
                      <ChartBar size={16} />
                      Mission Metrics
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {mainView === 'explore' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'favorites')}>
                      <TabsList>
                        <TabsTrigger value="all" className="gap-2">
                          <Sparkle size={16} />
                          Explore All
                        </TabsTrigger>
                        <TabsTrigger value="favorites" className="gap-2">
                          <Heart size={16} weight={(favorites?.length || 0) > 0 ? "fill" : "regular"} />
                          My Collection
                          {(favorites?.length || 0) > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                              {favorites?.length || 0}
                            </span>
                          )}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <FilterControls filters={filters} onFilterChange={setFilters} />
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 sm:px-6 py-8">
            {mainView === 'live' && (
              <div className="space-y-8">
                <LiveStatusDashboard />
                <TelemetryMonitor />
              </div>
            )}
            
            {mainView === 'explore' && (
              <>
                {loading ? (
                  <div className="flex gap-4 overflow-hidden pb-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-shrink-0 w-72">
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-3/4 h-4 mt-4" />
                        <Skeleton className="w-1/2 h-3 mt-2" />
                      </div>
                    ))}
                  </div>
                ) : activeTab === 'favorites' && (favorites?.length || 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="p-6 rounded-full bg-muted/50 mb-4">
                      <Heart size={48} className="text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
                    <p className="text-muted-foreground max-w-md">
                      Start exploring and add images to your collection by clicking the heart icon
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-xl font-semibold">
                        {activeTab === 'favorites' ? 'Your Collection' : 'Cosmic Timeline'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
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