import { useState } from 'react'
import { fetchJWSTImages, testNASAConnection } from '@/lib/nasa-api'
import { JWSTImage } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

export function NASAApiTester() {
  const [images, setImages] = useState<JWSTImage[]>([])
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('')
  const [error, setError] = useState<string>('')

  const testConnection = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await testNASAConnection()
      setConnectionStatus(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed')
    }
    setLoading(false)
  }

  const fetchImages = async () => {
    setLoading(true)
    setError('')
    try {
      const fetchedImages = await fetchJWSTImages()
      setImages(fetchedImages)
      console.warn('Fetched images for testing:', fetchedImages.length, 'total')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images')
    }
    setLoading(false)
  }

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 525600).toFixed(1)} light-minutes`
    } else if (distance < 1000) {
      return `${distance.toLocaleString()} light-years`
    } else if (distance < 1000000) {
      return `${(distance / 1000).toLocaleString()} thousand light-years`
    } else if (distance < 1000000000) {
      return `${(distance / 1000000).toLocaleString()} million light-years`
    } else {
      return `${(distance / 1000000000).toFixed(1)} billion light-years`
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">NASA API Integration Tester</h2>
        <p className="text-muted-foreground">Test the enhanced JWST image fetching</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={testConnection} disabled={loading}>
          Test API Connection
        </Button>
        <Button onClick={fetchImages} disabled={loading}>
          Fetch JWST Images
        </Button>
      </div>

      {connectionStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{connectionStatus}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      )}

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fetched Images ({images.length} total)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-sm">
                  <h4 className="font-semibold mb-2">Distance Distribution</h4>
                  <div className="space-y-1">
                    <p>Closest: {images[0] ? formatDistance(images[0].distance || 0) : 'N/A'}</p>
                    <p>
                      Farthest:{' '}
                      {images[images.length - 1]
                        ? formatDistance(images[images.length - 1].distance || 0)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <h4 className="font-semibold mb-2">Object Types</h4>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(images.map(img => img.objectType).filter(Boolean))).map(
                      type => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div className="text-sm">
                  <h4 className="font-semibold mb-2">Instruments</h4>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(images.map(img => img.instrument).filter(Boolean))).map(
                      inst => (
                        <Badge key={inst} variant="outline" className="text-xs">
                          {inst}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {images.slice(0, 10).map(image => (
                    <div key={image.id} className="border rounded-lg p-3 bg-muted/30">
                      <div className="flex gap-3">
                        <img
                          src={image.thumbnailUrl}
                          alt={image.title}
                          className="w-20 h-20 object-cover rounded"
                          onError={e => {
                            e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-sm truncate">{image.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {image.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {image.lookbackTime}
                            </Badge>
                            {image.objectType && (
                              <Badge variant="outline" className="text-xs">
                                {image.objectType}
                              </Badge>
                            )}
                            {image.instrument && (
                              <Badge className="text-xs bg-primary/20">{image.instrument}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
