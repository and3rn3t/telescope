import { useState } from 'react'
import { trajectoryData, orbitFacts, TrajectoryPoint } from '@/lib/telescope-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Planet, Path, ShieldChevron, Drop, Rocket, Globe, CircleDashed } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { LocationTracker } from '@/components/LocationTracker'
import { NextObservation } from '@/components/NextObservation'

const orbitFactIcons = {
  orbit: CircleDashed,
  path: Path,
  shield: ShieldChevron,
  fuel: Drop
}

const typeColors = {
  past: 'bg-muted text-muted-foreground',
  present: 'bg-primary text-primary-foreground',
  future: 'bg-secondary text-secondary-foreground'
}

const typeLabels = {
  past: 'Completed',
  present: 'Current',
  future: 'Planned'
}

export function SpaceTrajectory() {
  const [selectedPoint, setSelectedPoint] = useState<TrajectoryPoint | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">JWST Journey & Orbit</h2>
          <p className="text-muted-foreground mt-2">
            Follow the telescope's path from Earth to its permanent home at L2, 1.5 million km away
          </p>
        </div>
      </div>

      <LocationTracker />

      <NextObservation />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Mission Timeline</h3>
            
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {trajectoryData.map((point, index) => (
                  <motion.div
                    key={point.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-10"
                  >
                    <div
                      className={`absolute left-0 top-1 p-2 rounded-full ${
                        point.type === 'present'
                          ? 'bg-primary text-primary-foreground animate-pulse'
                          : point.type === 'past'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {point.type === 'present' ? (
                        <Planet size={16} weight="fill" />
                      ) : point.type === 'past' ? (
                        <Rocket size={16} weight="fill" />
                      ) : (
                        <Globe size={16} />
                      )}
                    </div>
                    
                    <Card
                      className="cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => setSelectedPoint(point)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{point.name}</CardTitle>
                          <Badge className={typeColors[point.type]} variant="secondary">
                            {typeLabels[point.type]}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">{point.date}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {point.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CircleDashed size={20} />
              L2 Orbit Facts
            </h3>
            <div className="space-y-4">
              {orbitFacts.map((fact, index) => {
                const Icon = orbitFactIcons[fact.icon as keyof typeof orbitFactIcons]
                return (
                  <motion.div
                    key={fact.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-primary/10">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">{fact.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {fact.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Planet size={24} weight="fill" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Current Status</h3>
                <p className="text-sm text-muted-foreground">
                  JWST is currently orbiting L2, conducting groundbreaking observations of the cosmos. The telescope performs station-keeping maneuvers every 21 days to maintain its position.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedPoint} onOpenChange={() => setSelectedPoint(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{selectedPoint?.name}</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {selectedPoint?.date}
                </DialogDescription>
              </div>
              {selectedPoint && (
                <Badge className={typeColors[selectedPoint.type]}>
                  {typeLabels[selectedPoint.type]}
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Overview</h3>
                <p className="text-muted-foreground">{selectedPoint?.description}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm mb-2">Details</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedPoint?.details}
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
