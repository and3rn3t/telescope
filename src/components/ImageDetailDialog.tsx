import { JWSTImage } from '@/lib/types'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Heart } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/InfoTooltip'
import {
  instrumentTooltips,
  distanceTooltips,
  objectTypeTooltips,
} from '@/lib/educational-tooltips'

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
  if (!image) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 bg-card/95 backdrop-blur-xl border-border overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          <div className="relative lg:w-2/3 bg-black">
            <img src={image.imageUrl} alt={image.title} className="w-full h-full object-contain" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white"
              onClick={onClose}
            >
              <X size={24} />
            </Button>
          </div>

          <div className="lg:w-1/3 flex flex-col">
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <DialogTitle className="text-2xl font-semibold text-card-foreground pr-2">
                  {image.title}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onFavoriteToggle(image.id)}
                  className={cn('flex-shrink-0', isFavorited && 'text-accent hover:text-accent')}
                >
                  <Heart size={24} weight={isFavorited ? 'fill' : 'regular'} />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
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
                    <p className="text-3xl font-bold text-accent font-mono">{image.lookbackTime}</p>
                    <p className="text-sm text-muted-foreground">
                      Light from this object has traveled for {image.lookbackTime?.toLowerCase()} to
                      reach us
                    </p>
                    <div className="pt-2">
                      <InfoTooltip
                        content={distanceTooltips.cosmicDistance}
                        side="bottom"
                        iconSize={14}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Description
                  </h3>
                  <p className="text-sm leading-relaxed text-card-foreground">
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
