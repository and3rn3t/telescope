import { InfoTooltip } from '@/components/InfoTooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  distanceTooltips,
  instrumentTooltips,
  objectTypeTooltips,
} from '@/lib/educational-tooltips'
import { JWSTImage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowLeft, Heart, ShareNetwork } from '@phosphor-icons/react'

interface ImageDetailDialogProps {
  image: JWSTImage | null
  isOpen: boolean
  isFavorited: boolean
  onClose: () => void
  onFavoriteToggle: (imageId: string) => void
}

export function ImageDetailDialog({
  image,
  isOpen,
  isFavorited,
  onClose,
  onFavoriteToggle,
}: ImageDetailDialogProps) {
  const isMobile = useIsMobile()

  const handleShare = async () => {
    if (!image) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: `Check out this amazing JWST image: ${image.title}`,
          url: window.location.href,
        })
      } catch {
        // Share cancelled or failed - no action needed
      }
    } else {
      // Fallback for browsers without native share
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${image.title} - ${window.location.href}`)
        // Could show a toast here
      }
    }
  }

  if (!image) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'p-0 gap-0 cosmic-container overflow-hidden',
          isMobile ? 'max-w-full max-h-full w-full h-full rounded-none' : 'max-w-6xl max-h-[90vh]'
        )}
        data-slot="content"
      >
        <div className={cn('flex h-full', isMobile ? 'flex-col' : 'flex-col lg:flex-row')}>
          <div className={cn('relative bg-black', isMobile ? 'h-1/2 min-h-[300px]' : 'lg:w-2/3')}>
            <img src={image.imageUrl} alt={image.title} className="w-full h-full object-contain" />
            <div
              className={cn(
                'absolute top-0 left-0 right-0 flex items-center justify-between p-3 sm:p-4',
                isMobile && 'bg-linear-to-b from-black/50 to-transparent'
              )}
            >
              <div /> {/* Spacer */}
              <div className="flex items-center gap-2">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white touch-manipulation"
                    title="Share image"
                  >
                    <ShareNetwork size={20} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white touch-manipulation',
                    isMobile && 'p-3'
                  )}
                  onClick={onClose}
                  title="Close"
                >
                  <ArrowLeft size={isMobile ? 22 : 24} />
                </Button>
              </div>
            </div>
          </div>

          <div className={cn('flex flex-col', isMobile ? 'h-1/2' : 'lg:w-1/3')}>
            <div className={cn('border-b border-border', isMobile ? 'p-4' : 'p-6')}>
              <div className="flex items-start justify-between gap-3">
                <DialogTitle
                  className={cn(
                    'font-semibold text-card-foreground pr-2',
                    isMobile ? 'text-lg' : 'text-2xl'
                  )}
                >
                  {image.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed view of JWST image: {image.title}
                </DialogDescription>
                <div className="flex items-center gap-2">
                  {!isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShare}
                      className="shrink-0 touch-manipulation"
                      title="Share image"
                    >
                      <ShareNetwork size={20} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFavoriteToggle(image.id)}
                    className={cn(
                      'shrink-0 touch-manipulation',
                      isMobile && 'p-3',
                      isFavorited && 'text-accent hover:text-accent'
                    )}
                    title={isFavorited ? 'Remove from collection' : 'Add to collection'}
                  >
                    <Heart size={isMobile ? 22 : 24} weight={isFavorited ? 'fill' : 'regular'} />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className={cn('space-y-4 sm:space-y-6', isMobile ? 'p-4' : 'p-6')}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Cosmic Distance
                    </h3>
                    <InfoTooltip
                      content={distanceTooltips.lookbackTime}
                      side="right"
                      iconSize={14}
                    />
                  </div>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        'font-bold text-accent font-mono',
                        isMobile ? 'text-2xl' : 'text-3xl'
                      )}
                    >
                      {image.lookbackTime}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Light from this object has traveled for {image.lookbackTime?.toLowerCase()} to
                      reach us
                    </p>
                    {!isMobile && (
                      <div className="pt-2">
                        <InfoTooltip
                          content={distanceTooltips.cosmicDistance}
                          side="bottom"
                          iconSize={14}
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Description
                  </h3>
                  <p className="text-sm leading-relaxed text-card-foreground selectable">
                    {image.description}
                  </p>
                </div>

                {(image.instrument || image.objectType) && (
                  <>
                    <Separator className="bg-border" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Observation Details
                        </h3>
                        <InfoTooltip
                          content={{
                            title: 'How JWST Observes',
                            description:
                              'Each instrument and target type reveals different secrets about the universe.',
                            details:
                              "JWST's instruments work together to build a complete picture. Instruments detect different wavelengths of infrared light, revealing temperature, composition, and structure hidden from visible light telescopes.",
                          }}
                          side="right"
                          iconSize={14}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {image.instrument && instrumentTooltips[image.instrument] && (
                          <div className="flex items-center gap-1.5 group">
                            <Badge
                              variant="secondary"
                              className="bg-primary/20 text-primary-foreground"
                            >
                              {image.instrument}
                            </Badge>
                            <InfoTooltip
                              content={instrumentTooltips[image.instrument]}
                              side="bottom"
                              iconSize={12}
                            />
                          </div>
                        )}
                        {!image.instrument && image.instrument && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/20 text-primary-foreground"
                          >
                            {image.instrument}
                          </Badge>
                        )}
                        {image.objectType && objectTypeTooltips[image.objectType] && (
                          <div className="flex items-center gap-1.5 group">
                            <Badge
                              variant="outline"
                              className="border-border text-card-foreground capitalize"
                            >
                              {image.objectType}
                            </Badge>
                            <InfoTooltip
                              content={objectTypeTooltips[image.objectType]}
                              side="bottom"
                              iconSize={12}
                            />
                          </div>
                        )}
                        {!image.objectType && image.objectType && (
                          <Badge
                            variant="outline"
                            className="border-border text-card-foreground capitalize"
                          >
                            {image.objectType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator className="bg-border" />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Date Captured
                  </h3>
                  <p className="text-sm text-card-foreground font-mono">
                    {new Date(image.dateCreated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
