import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { 
  ChartBar, 
  Target, 
  Database, 
  Clock, 
  CheckCircle,
  Camera,
  FileText,
  Users,
  TrendUp,
  Eye,
  Star,
  Atom
} from '@phosphor-icons/react'

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subtext?: string
  trend?: string
  progress?: number
  color?: string
}

function MetricCard({ icon, label, value, subtext, trend, progress, color = 'primary' }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}`} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg bg-${color}/10`}>
              {icon}
            </div>
            {trend && (
              <Badge variant="secondary" className="gap-1">
                <TrendUp size={12} />
                {trend}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
            {subtext && (
              <div className="text-xs text-muted-foreground">{subtext}</div>
            )}
            {progress !== undefined && (
              <Progress value={progress} className="h-1.5 mt-3" />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface InstrumentStatsProps {
  name: string
  observations: number
  dataVolume: string
  hoursActive: number
  specialty: string
  icon: React.ReactNode
}

function InstrumentStats({ name, observations, dataVolume, hoursActive, specialty, icon }: InstrumentStatsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <CardDescription className="text-xs">{specialty}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-primary">{observations.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Observations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{dataVolume}</div>
            <div className="text-xs text-muted-foreground">Data Volume</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">{hoursActive.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Hours Active</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ScienceCategory {
  category: string
  observations: number
  percentage: number
  color: string
  icon: React.ReactNode
}

export function ObservationMetrics() {
  const [missionDays, setMissionDays] = useState(0)

  useEffect(() => {
    const launchDate = new Date('2021-12-25')
    const today = new Date()
    const days = Math.floor((today.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24))
    setMissionDays(days)
  }, [])

  const instruments: InstrumentStatsProps[] = [
    {
      name: 'NIRCam',
      observations: 8742,
      dataVolume: '156 TB',
      hoursActive: 12430,
      specialty: 'Near-Infrared Camera',
      icon: <Camera size={20} className="text-primary" weight="fill" />
    },
    {
      name: 'NIRSpec',
      observations: 4521,
      dataVolume: '89 TB',
      hoursActive: 8920,
      specialty: 'Near-Infrared Spectrograph',
      icon: <Atom size={20} className="text-secondary" weight="fill" />
    },
    {
      name: 'MIRI',
      observations: 3108,
      dataVolume: '67 TB',
      hoursActive: 6234,
      specialty: 'Mid-Infrared Instrument',
      icon: <Eye size={20} className="text-accent" weight="fill" />
    },
    {
      name: 'NIRISS',
      observations: 2894,
      dataVolume: '52 TB',
      hoursActive: 5681,
      specialty: 'Near-Infrared Imager',
      icon: <Star size={20} className="text-primary" weight="fill" />
    }
  ]

  const scienceCategories: ScienceCategory[] = [
    {
      category: 'Galaxies & Early Universe',
      observations: 6847,
      percentage: 35,
      color: 'bg-primary',
      icon: <Target size={16} weight="fill" />
    },
    {
      category: 'Stars & Stellar Evolution',
      observations: 5234,
      percentage: 27,
      color: 'bg-secondary',
      icon: <Star size={16} weight="fill" />
    },
    {
      category: 'Exoplanets & Atmospheres',
      observations: 3921,
      percentage: 20,
      color: 'bg-accent',
      icon: <Eye size={16} weight="fill" />
    },
    {
      category: 'Nebulae & Star Formation',
      observations: 3463,
      percentage: 18,
      color: 'bg-muted',
      icon: <Atom size={16} weight="fill" />
    }
  ]

  const totalObservations = 19465
  const totalDataVolume = 364
  const successRate = 98.7
  const papersPublished = 847
  const activePrograms = 134

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Mission Performance & Scientific Output</h2>
        <p className="text-muted-foreground">
          Real-time metrics tracking JWST's observations, data collection, and scientific discoveries
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <ChartBar size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="instruments" className="gap-2">
            <Camera size={16} />
            Instruments
          </TabsTrigger>
          <TabsTrigger value="science" className="gap-2">
            <Target size={16} />
            Science Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<Target size={24} className="text-primary" weight="fill" />}
              label="Total Observations Completed"
              value={totalObservations.toLocaleString()}
              subtext={`${missionDays} days of operations`}
              trend="+2.4%"
              color="primary"
            />
            <MetricCard
              icon={<Database size={24} className="text-secondary" weight="fill" />}
              label="Scientific Data Collected"
              value={`${totalDataVolume} TB`}
              subtext="Stored in MAST archive"
              trend="+12 TB"
              color="secondary"
            />
            <MetricCard
              icon={<CheckCircle size={24} className="text-accent" weight="fill" />}
              label="Success Rate"
              value={`${successRate}%`}
              subtext="Observations executed successfully"
              progress={successRate}
              color="accent"
            />
            <MetricCard
              icon={<Clock size={24} className="text-primary" weight="fill" />}
              label="Mission Duration"
              value={`${missionDays} days`}
              subtext="Since December 25, 2021"
              color="primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-primary" weight="fill" />
                  <CardTitle className="text-base">Publications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{papersPublished}</div>
                <div className="text-sm text-muted-foreground mt-1">Peer-reviewed papers</div>
                <div className="mt-4 flex items-center gap-2">
                  <Progress value={72} className="flex-1" />
                  <span className="text-xs text-muted-foreground">+72 this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-secondary" weight="fill" />
                  <CardTitle className="text-base">Research Programs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{activePrograms}</div>
                <div className="text-sm text-muted-foreground mt-1">Active observation programs</div>
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Cycle 1</span>
                    <span className="font-medium">Complete</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Cycle 2</span>
                    <span className="font-medium">In Progress</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-accent" weight="fill" />
                  <CardTitle className="text-base">Unique Targets</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">7,342</div>
                <div className="text-sm text-muted-foreground mt-1">Celestial objects observed</div>
                <div className="mt-4 flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    1,247 Galaxies
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    892 Stars
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Observation Efficiency Timeline</CardTitle>
              <CardDescription>
                Daily observation completion rate over the mission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Planned Observing Time</div>
                    <div className="text-2xl font-bold">85%</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">33,265 hours</div>
                    <div className="text-xs text-muted-foreground">of 39,100 total</div>
                  </div>
                </div>
                <Progress value={85} className="h-2" />
                <div className="grid grid-cols-4 gap-4 pt-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Prime Time</div>
                    <div className="text-sm font-medium">91%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Engineering</div>
                    <div className="text-sm font-medium">8%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Calibration</div>
                    <div className="text-sm font-medium">5%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Downtime</div>
                    <div className="text-sm font-medium">1.3%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instruments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {instruments.map((instrument) => (
              <InstrumentStats key={instrument.name} {...instrument} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Instrument Performance Comparison</CardTitle>
              <CardDescription>
                Relative usage and data output across all four primary instruments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instruments.map((instrument, index) => {
                  const maxObs = Math.max(...instruments.map(i => i.observations))
                  const percentage = (instrument.observations / maxObs) * 100
                  
                  return (
                    <div key={instrument.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {instrument.icon}
                          <span className="font-medium">{instrument.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {instrument.observations.toLocaleString()} observations
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="science" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Science Category Distribution</CardTitle>
                <CardDescription>
                  Observations organized by primary scientific goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scienceCategories.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${category.color}`}>
                            {category.icon}
                          </div>
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {category.observations.toLocaleString()} ({category.percentage}%)
                        </span>
                      </div>
                      <Progress value={category.percentage * 2.5} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Scientific Discoveries</CardTitle>
                <CardDescription>
                  Major breakthroughs enabled by JWST observations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 h-fit">
                      <Target size={16} className="text-primary" weight="fill" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Earliest Galaxies</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Discovered galaxies from just 300 million years after the Big Bang
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">z~13-14 redshift</Badge>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10 h-fit">
                      <Eye size={16} className="text-secondary" weight="fill" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Exoplanet Atmospheres</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Detected water, methane, and CO₂ in distant exoplanet atmospheres
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">247 exoplanets analyzed</Badge>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 h-fit">
                      <Atom size={16} className="text-accent" weight="fill" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Star Formation Regions</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Revealed intricate details of stellar nurseries and protoplanetary disks
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">189 nebulae mapped</Badge>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 h-fit">
                      <Star size={16} className="text-primary" weight="fill" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Supermassive Black Holes</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Found active black holes in the early universe, challenging formation theories
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">82 AGN detected</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Impact & Accessibility</CardTitle>
              <CardDescription>
                How JWST data is being used by the global scientific community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">3.2M</div>
                  <div className="text-sm text-muted-foreground">Data Downloads</div>
                  <div className="text-xs text-muted-foreground">
                    From MAST archive by researchers worldwide
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-secondary">89</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                  <div className="text-xs text-muted-foreground">
                    Institutions actively analyzing JWST data
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-accent">100%</div>
                  <div className="text-sm text-muted-foreground">Open Access</div>
                  <div className="text-xs text-muted-foreground">
                    All data becomes public after 12-month proprietary period
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
