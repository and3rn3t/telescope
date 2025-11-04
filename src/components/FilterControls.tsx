import { FilterState, ObjectType, InstrumentType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Funnel, Planet, Spiral, Sparkle, Star } from '@phosphor-icons/react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'

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
        <label className="text-sm font-medium text-muted-foreground">Object Type</label>
        <div className="grid grid-cols-2 gap-2">
          {objectTypes.map((type) => (
            <Button
              key={type.value}
              variant={filters.objectType === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ ...filters, objectType: type.value })}
              className="justify-start gap-2"
            >
              {type.icon}
              <span className="text-xs">{type.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Instrument</label>
        <Select 
          value={filters.instrument} 
          onValueChange={(value) => onFilterChange({ ...filters, instrument: value as InstrumentType })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {instruments.map((instrument) => (
              <SelectItem key={instrument.value} value={instrument.value}>
                {instrument.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(filters.objectType !== 'all' || filters.instrument !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange({ 
            objectType: 'all', 
            instrument: 'all', 
            distanceRange: [0, Infinity] 
          })}
          className="w-full"
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
          <Button variant="outline" size="sm" className="gap-2">
            <Funnel size={16} />
            Filters
            {(filters.objectType !== 'all' || filters.instrument !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-accent" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Filter Images</SheetTitle>
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
      {objectTypes.map((type) => (
        <Button
          key={type.value}
          variant={filters.objectType === type.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange({ ...filters, objectType: type.value })}
          className="gap-2"
        >
          {type.icon}
          <span className="hidden sm:inline">{type.label}</span>
        </Button>
      ))}
      
      <div className="w-px h-6 bg-border" />
      
      <Select 
        value={filters.instrument} 
        onValueChange={(value) => onFilterChange({ ...filters, instrument: value as InstrumentType })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {instruments.map((instrument) => (
            <SelectItem key={instrument.value} value={instrument.value}>
              {instrument.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
