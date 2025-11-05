import { InfoTooltip } from '@/components/InfoTooltip'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { instrumentTooltips, objectTypeTooltips } from '@/lib/educational-tooltips'
import { FilterState, InstrumentType, ObjectType } from '@/lib/types'
import { Funnel, Planet, Sparkle, Spiral, Star } from '@phosphor-icons/react'

interface FilterControlsProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function FilterControls({ filters, onFilterChange }: FilterControlsProps) {
  const isMobile = useIsMobile()

  const objectTypes: { value: ObjectType; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Objects', icon: <Sparkle size={16} /> },
    { value: 'galaxy', label: 'Galaxies', icon: <Spiral size={16} /> },
    { value: 'nebula', label: 'Nebulae', icon: <Planet size={16} /> },
    { value: 'star', label: 'Stars & Planets', icon: <Star size={16} /> },
  ]

  const instruments: { value: InstrumentType; label: string }[] = [
    { value: 'all', label: 'All Instruments' },
    { value: 'NIRCam', label: 'NIRCam' },
    { value: 'MIRI', label: 'MIRI' },
    { value: 'NIRSpec', label: 'NIRSpec' },
    { value: 'NIRISS', label: 'NIRISS' },
  ]

  const FilterContent = () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="cosmic-body-sm text-starlight-gold">Object Type</label>
          <InfoTooltip
            content={{
              title: 'Cosmic Objects',
              description: 'JWST observes various types of celestial objects across the universe.',
              details:
                'Each object type reveals different aspects of cosmic evolution. Hover over individual categories to learn more about what makes each unique.',
            }}
            side="right"
            iconSize={14}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {objectTypes.map(type => (
            <div key={type.value} className="relative group">
              <Button
                variant={filters.objectType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ ...filters, objectType: type.value })}
                className="justify-start gap-2 w-full cosmic-nav-tab"
                data-slot="button"
              >
                {type.icon}
                <span className="text-xs">{type.label}</span>
              </Button>
              {type.value !== 'all' && objectTypeTooltips[type.value] && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <InfoTooltip
                    content={objectTypeTooltips[type.value]}
                    side="right"
                    iconSize={14}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="cosmic-body-sm text-starlight-gold">Instrument</label>
          <InfoTooltip
            content={{
              title: 'JWST Science Instruments',
              description:
                'JWST carries four main instruments, each designed to observe different wavelengths and phenomena.',
              details:
                'All instruments operate in infrared, allowing JWST to see through cosmic dust and observe the earliest galaxies. Select an instrument to see images captured with it.',
            }}
            side="right"
            iconSize={14}
          />
        </div>
        <Select
          value={filters.instrument}
          onValueChange={value =>
            onFilterChange({ ...filters, instrument: value as InstrumentType })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {instruments.map(instrument => (
              <SelectItem key={instrument.value} value={instrument.value}>
                <div className="flex items-center gap-2">
                  {instrument.label}
                  {instrument.value !== 'all' && instrumentTooltips[instrument.value] && (
                    <span className="text-muted-foreground text-xs">
                      ({instrumentTooltips[instrument.value].title})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(filters.objectType !== 'all' || filters.instrument !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onFilterChange({
              objectType: 'all',
              instrument: 'all',
              distanceRange: [0, Infinity],
            })
          }
          className="w-full text-infrared-orange hover:text-starlight-gold cosmic-body-sm"
          data-slot="button"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 cosmic-nav-tab" data-slot="button">
            <Funnel size={16} />
            Filters
            {(filters.objectType !== 'all' || filters.instrument !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-infrared-orange" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto cosmic-surface">
          <SheetHeader>
            <SheetTitle className="cosmic-heading-md text-starlight-gold">Filter Images</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {objectTypes.map(type => (
        <Button
          key={type.value}
          variant={filters.objectType === type.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange({ ...filters, objectType: type.value })}
          className="gap-2 cosmic-nav-tab"
          data-slot="button"
        >
          {type.icon}
          <span className="hidden sm:inline">{type.label}</span>
        </Button>
      ))}

      <div className="w-px h-6 bg-cosmic-deep-space-violet/30" />

      <Select
        value={filters.instrument}
        onValueChange={value => onFilterChange({ ...filters, instrument: value as InstrumentType })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {instruments.map(instrument => (
            <SelectItem key={instrument.value} value={instrument.value}>
              {instrument.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
