import { JWSTImage } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Heart } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/InfoTooltip'
import { distanceTooltips } from '@/lib/educational-tooltips'

interface ImageCardProps {
  image: JWSTImage
  isFavorited: boolean
  onImageClick: (image: JWSTImage) => void
  onFavoriteToggle: (imageId: string) => void
}

export function ImageCard({ image, isFavorited, onImageClick, onFavoriteToggle }: ImageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-shrink-0"
    >
      <Card 
        className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 border-border/50 bg-card/50 backdrop-blur-sm w-72 group"
        onClick={() => onImageClick(image)}
      >
        <div className="aspect-square overflow-hidden">
          <img 
            src={image.thumbnailUrl} 
            alt={image.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle(image.id)
          }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10",
            isFavorited 
              ? "bg-accent/90 text-accent-foreground" 
              : "bg-black/40 text-white hover:bg-black/60"
          )}
        >
          <Heart 
            size={20} 
            weight={isFavorited ? "fill" : "regular"}
          />
        </button>
        
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-base line-clamp-2 text-card-foreground">
            {image.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-accent font-medium font-mono">
                {image.lookbackTime}
              </span>
              <InfoTooltip 
                content={distanceTooltips.lightYear}
                side="top"
                iconSize={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            {image.instrument && (
              <span className="px-2 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs">
                {image.instrument}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
