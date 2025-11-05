import { DeploymentSequence } from '@/components/DeploymentSequence'
import { Telescope3D } from '@/components/Telescope3D'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TelescopeComponent, telescopeComponents } from '@/lib/telescope-data'
import { Airplane, Lightning, Cube, Engine, EyeSlash, GridFour } from '@phosphor-icons/react'
import { useState } from 'react'

const categoryIcons = {
  optics: EyeSlash,
  instruments: Engine,
  structure: Cube,
  power: Lightning,
}

const categoryColors = {
  optics: 'bg-secondary text-secondary-foreground',
  instruments: 'bg-primary text-primary-foreground',
  structure: 'bg-accent text-accent-foreground',
  power: 'bg-muted text-muted-foreground',
}

const categoryLabels = {
  optics: 'Optics',
  instruments: 'Instruments',
  structure: 'Structure',
  power: 'Power & Control',
}

export function TelescopeAnatomy() {
  const [selectedComponent, setSelectedComponent] = useState<TelescopeComponent | null>(null)
  const [activeCategory, setActiveCategory] = useState<'all' | TelescopeComponent['category']>(
    'all'
  )
  const [viewMode, setViewMode] = useState<'3d' | 'grid' | 'deployment'>('3d')

  const filteredComponents =
    activeCategory === 'all'
      ? telescopeComponents
      : telescopeComponents.filter(c => c.category === activeCategory)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Telescope Anatomy</h2>
          <p className="text-muted-foreground mt-2">
            Explore the intricate components that make JWST the most powerful space telescope ever
            built
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Tabs
            value={activeCategory}
            onValueChange={v => setActiveCategory(v as 'all' | TelescopeComponent['category'])}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Parts</TabsTrigger>
              <TabsTrigger value="optics" className="gap-2">
                <EyeSlash size={16} />
                Optics
              </TabsTrigger>
              <TabsTrigger value="instruments" className="gap-2">
                <Engine size={16} />
                Instruments
              </TabsTrigger>
              <TabsTrigger value="structure" className="gap-2">
                <Cube size={16} />
                Structure
              </TabsTrigger>
              <TabsTrigger value="power" className="gap-2">
                <Lightning size={16} />
                Power
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            value={viewMode}
            onValueChange={v => setViewMode(v as '3d' | 'grid' | 'deployment')}
          >
            <TabsList>
              <TabsTrigger value="3d" className="gap-2">
                <Cube size={16} />
                3D View
              </TabsTrigger>
              <TabsTrigger value="grid" className="gap-2">
                <GridFour size={16} />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="deployment" className="gap-2">
                <Airplane size={16} />
                Deployment
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {viewMode === '3d' ? (
        <div className="w-full h-[600px] rounded-lg border border-border overflow-hidden bg-background">
          <Telescope3D
            components={filteredComponents}
            selectedComponent={selectedComponent}
            onComponentClick={setSelectedComponent}
          />
        </div>
      ) : viewMode === 'deployment' ? (
        <DeploymentSequence />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map(component => {
            const Icon = categoryIcons[component.category]
            return (
              <Card
                key={component.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                onClick={() => setSelectedComponent(component)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                    </div>
                    <Badge className={categoryColors[component.category]}>
                      <Icon size={14} className="mr-1" />
                      {categoryLabels[component.category]}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {component.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!selectedComponent} onOpenChange={() => setSelectedComponent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{selectedComponent?.name}</DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed information about the {selectedComponent?.name} component
                </DialogDescription>
                {selectedComponent && (
                  <Badge className={`${categoryColors[selectedComponent.category]} mt-2`}>
                    {(() => {
                      const Icon = categoryIcons[selectedComponent.category]
                      return <Icon size={14} className="mr-1" />
                    })()}
                    {categoryLabels[selectedComponent.category]}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Overview</h3>
                <p className="text-muted-foreground">{selectedComponent?.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Technical Details</h3>
                <p className="text-muted-foreground">{selectedComponent?.technicalDetails}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Specifications</h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedComponent &&
                    Object.entries(selectedComponent.specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-3 rounded-lg bg-muted/50"
                      >
                        <span className="font-medium text-sm">{key}</span>
                        <span className="text-muted-foreground text-sm font-mono">{value}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-sm mb-2 text-primary">Why It Matters</h3>
                <p className="text-sm text-muted-foreground">{selectedComponent?.importance}</p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
