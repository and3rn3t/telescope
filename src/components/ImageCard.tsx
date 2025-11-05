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
          'cosmic-card relative overflow-hidden cursor-pointer group',
          isMobile ? 'active:scale-95 active:shadow-md' : 'hover:scale-105 hover:shadow-lg'
        )}
        onClick={() => onImageClick(image)}
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={image.thumbnailUrl}
            alt={image.title}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300',
              isMobile ? 'group-active:scale-105' : 'group-hover:scale-110'
            )}
            loading="lazy"
          />
        </div>

        <div
          className={cn(
            'absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300',
            isMobile ? 'opacity-30' : 'opacity-0 group-hover:opacity-100'
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
            'absolute top-3 right-3 rounded-full backdrop-blur-md transition-all duration-300 z-10 touch-manipulation',
            isMobile ? 'p-3' : 'p-2',
            isFavorited
              ? 'bg-accent/90 text-accent-foreground'
              : 'bg-black/40 text-white hover:bg-black/60 active:bg-black/80'
          )}
        >
          <Heart size={isMobile ? 22 : 20} weight={isFavorited ? 'fill' : 'regular'} />
        </button>

        <div className={cn('space-y-2', isMobile ? 'p-3' : 'p-4')}>
          <h3 className={cn('cosmic-heading-md line-clamp-2', isMobile ? 'text-sm' : 'text-base')}>
            {image.title}
          </h3>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="cosmic-data">{image.lookbackTime}</span>
              {!isMobile && (
                <InfoTooltip
                  content={distanceTooltips.lightYear}
                  side="top"
                  iconSize={12}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
            {image.instrument && (
              <span className="px-2 py-1 rounded-full text-xs cosmic-logo">{image.instrument}</span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
