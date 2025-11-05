import { JWSTImage } from '@/lib/types'
import { ImageCard } from './ImageCard'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useIsMobile } from '@/hooks/use-mobile'

interface TimelineProps {
  images: JWSTImage[]
  favorites: string[]
  onImageClick: (image: JWSTImage) => void
  onFavoriteToggle: (imageId: string) => void
}

export function Timeline({ images, favorites, onImageClick, onFavoriteToggle }: TimelineProps) {
  const isMobile = useIsMobile()

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-lg">
          No images found. Try adjusting your filters.
        </p>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4 pb-6">
        {images.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            isFavorited={favorites.includes(image.id)}
            onImageClick={onImageClick}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-6">
        {images.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            isFavorited={favorites.includes(image.id)}
            onImageClick={onImageClick}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
