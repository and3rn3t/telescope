import { InfoTooltip } from '@/components/InfoTooltip'
import { Card } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'
import { distanceTooltips } from '@/lib/educational-tooltips'
import { JWSTImage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Heart } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ImageCardProps {
  image: JWSTImage
  isFavorited: boolean
  onImageClick: (image: JWSTImage) => void
  onFavoriteToggle: (imageId: string) => void
}

export function ImageCard({ image, isFavorited, onImageClick, onFavoriteToggle }: ImageCardProps) {
  const isMobile = useIsMobile()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.2, 0, 0.38, 0.9], // cosmic-ease-out
      }}
      className={cn('shrink-0', isMobile ? 'w-full' : 'w-72')}
    >
      <Card
        className={cn(
          'cosmic-card relative overflow-hidden cursor-pointer group h-full flex flex-col',
          isMobile ? 'active:scale-95 active:shadow-md' : 'hover:scale-105 hover:shadow-lg'
        )}
        onClick={() => onImageClick(image)}
      >
        <div className="aspect-square overflow-hidden relative">
          <img
            src={image.thumbnailUrl}
            alt={image.title}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300',
              isMobile ? 'group-active:scale-105' : 'group-hover:scale-110'
            )}
            loading="lazy"
            onError={e => {
              const target = e.target as HTMLImageElement
              console.error(`🖼️ Image loading failed for: ${target.src}`)
              console.error(`   Title: ${image.title}`)
              console.error(`   Thumbnail URL: ${image.thumbnailUrl}`)
              console.error(`   Image URL: ${image.imageUrl}`)

              // Try to fall back to the main image URL if thumbnail fails
              if (target.src === image.thumbnailUrl && image.imageUrl !== image.thumbnailUrl) {
                console.warn(`🔄 Trying fallback image: ${image.imageUrl}`)
                target.src = image.imageUrl
              } else {
                // If both fail, show a cosmic placeholder
                console.error(`❌ Both image URLs failed for: ${image.title}`)
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-linear-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
                      <div class="text-center text-muted-foreground">
                        <div class="text-2xl mb-2">🌌</div>
                        <div class="text-xs">Image unavailable</div>
                      </div>
                    </div>
                  `
                }
              }
            }}
            onLoad={() => {
              console.warn(`✅ Image loaded successfully: ${image.title}`)
            }}
          />
        </div>

        {/* Always-visible gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

        {/* Additional hover overlay for enhanced effect */}
        <div
          className={cn(
            'absolute inset-0 bg-linear-to-t from-black/20 via-black/10 to-transparent transition-opacity duration-300',
            isMobile ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
          )}
        />

        <button
          onClick={e => {
            e.stopPropagation()

            // Haptic feedback
            if (isMobile) {
              import('@/lib/haptic-feedback').then(({ buttonPressFeedback }) => {
                buttonPressFeedback()
              })
            }

            onFavoriteToggle(image.id)
          }}
          title={isFavorited ? 'Remove from collection' : 'Add to collection'}
          className={cn(
            'absolute top-3 right-3 rounded-full backdrop-blur-md transition-all duration-300 z-20 touch-manipulation shadow-lg',
            isMobile ? 'p-3' : 'p-2',
            isFavorited
              ? 'bg-red-500/90 text-white shadow-red-500/25'
              : 'bg-black/70 text-white hover:bg-black/80 active:bg-black/90 hover:shadow-xl'
          )}
        >
          <Heart size={isMobile ? 22 : 20} weight={isFavorited ? 'fill' : 'regular'} />
        </button>

        <div
          className={cn(
            'flex-1 flex flex-col justify-between space-y-2 relative z-10',
            isMobile ? 'p-3' : 'p-4',
            'min-h-20',
            'bg-linear-to-t from-black/95 via-black/80 to-black/40',
            'backdrop-blur-sm'
          )}
        >
          <h3
            className={cn(
              'font-semibold line-clamp-2 text-white drop-shadow-lg',
              isMobile ? 'text-sm' : 'text-base'
            )}
          >
            {image.title}
          </h3>

          <div className="flex items-center justify-between text-xs mt-auto">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-blue-300 drop-shadow-md">
                {image.lookbackTime}
              </span>
              {!isMobile && (
                <InfoTooltip
                  content={distanceTooltips.lightYear}
                  side="top"
                  iconSize={12}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              )}
            </div>
            {image.instrument && (
              <span className="px-2 py-1 rounded-full text-xs bg-purple-600/90 text-white font-medium shadow-md">
                {image.instrument}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
