import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, Binoculars, Clock, Eye, MapPin, Sparkle } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface ObservationTarget {
  id: string
  targetName: string
  category: string
  instrument: string
  startTime: string
  duration: string
  description: string
  coordinates: {
    ra: string
    dec: string
  }
  priority: 'high' | 'medium' | 'low'
  principalInvestigator: string
  program: string
}

async function fetchNextObservation(): Promise<ObservationTarget> {
  // Check if Spark LLM service is available
  try {
    if (typeof window !== 'undefined' && window.spark?.llm) {
      const promptText = `You are generating realistic data for the James Webb Space Telescope's next scheduled observation target.

Generate a single JSON object (not an array) with a property called "observation" containing an observation target with these exact fields:
- id: a unique observation ID (format: "JWST-{number}")
- targetName: name of a real cosmic object (galaxy, nebula, exoplanet, star cluster, etc.)
- category: one of ["Galaxy", "Nebula", "Exoplanet", "Star Cluster", "Supernova Remnant", "Protoplanetary Disk"]
- instrument: one of ["NIRCam", "MIRI", "NIRSpec", "NIRISS", "FGS"]
- startTime: a realistic near-future date/time (within next 24-48 hours from now), format as human readable like "Today at 14:30 UTC" or "Tomorrow at 09:15 UTC"
- duration: observation duration in hours and minutes like "3h 45m" or "1h 20m"
- description: 2-3 sentences about what this observation aims to discover or study
- coordinates: object with "ra" (right ascension in format like "05h 35m 17s") and "dec" (declination in format like "-05° 23' 28"")
- priority: one of ["high", "medium", "low"]
- principalInvestigator: a realistic researcher name
- program: observation program number (format: "Program #{number}")

Make the data scientifically plausible and interesting. Return ONLY the JSON object in this format:
{
  "observation": { ...all fields here... }
}`

      const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const parsed = JSON.parse(result)
      return parsed.observation
    }
  } catch {
    // Silently fall through to mock data - this is expected outside Spark environment
  }

  // Fallback: Generate realistic mock observation
  return generateMockObservation()
}

function generateMockObservation(): ObservationTarget {
  const targets = [
    {
      name: 'TRAPPIST-1 System',
      category: 'Exoplanet' as const,
      description:
        'Atmospheric characterization of potentially habitable exoplanets in the TRAPPIST-1 system to search for signs of water vapor and other biosignatures.',
    },
    {
      name: 'NGC 1365 (Great Barred Spiral Galaxy)',
      category: 'Galaxy' as const,
      description:
        'Deep infrared observations of the central supermassive black hole and active galactic nucleus to study star formation and galactic evolution processes.',
    },
    {
      name: 'Herbig Haro 211',
      category: 'Protoplanetary Disk' as const,
      description:
        'Investigation of protostellar outflows and accretion processes in one of the youngest known star-forming regions in the galaxy.',
    },
    {
      name: 'IC 443 (Jellyfish Nebula)',
      category: 'Supernova Remnant' as const,
      description:
        'Multi-wavelength infrared study of shock wave interactions with interstellar medium and heavy element distribution patterns.',
    },
    {
      name: 'Westerlund 2',
      category: 'Star Cluster' as const,
      description:
        'Characterization of massive star formation processes and stellar winds in one of the most active star-forming clusters in the Milky Way.',
    },
  ]

  const instruments = ['NIRCam', 'MIRI', 'NIRSpec', 'NIRISS', 'FGS'] as const
  const priorities = ['high', 'medium', 'low'] as const
  const investigators = [
    'Dr. Sarah Chen (MIT)',
    'Prof. Michael Rodriguez (ESO)',
    'Dr. Aisha Patel (STScI)',
    'Prof. Johannes Mueller (MPE)',
    'Dr. Elena Volkov (CNES)',
    'Prof. Kenji Nakamura (JAXA)',
  ]

  const target = targets[Math.floor(Math.random() * targets.length)]
  const instrument = instruments[Math.floor(Math.random() * instruments.length)]
  const priority = priorities[Math.floor(Math.random() * priorities.length)]
  const investigator = investigators[Math.floor(Math.random() * investigators.length)]
  const obsId = Math.floor(Math.random() * 9000) + 1000
  const programNum = Math.floor(Math.random() * 500) + 1000

  // Generate future time (next 24-48 hours)
  const now = new Date()
  const hoursFromNow = Math.floor(Math.random() * 48) + 2
  const futureTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000)
  const isToday = futureTime.getDate() === now.getDate()
  const timeStr = futureTime.toTimeString().slice(0, 5) // HH:MM format
  const startTime = isToday ? `Today at ${timeStr} UTC` : `Tomorrow at ${timeStr} UTC`

  const durationHours = Math.floor(Math.random() * 6) + 1
  const durationMinutes = Math.floor(Math.random() * 60)
  const duration = `${durationHours}h ${String(durationMinutes).padStart(2, '0')}m`

  // Generate realistic coordinates
  const raHours = Math.floor(Math.random() * 24)
  const raMinutes = Math.floor(Math.random() * 60)
  const raSeconds = Math.floor(Math.random() * 60)
  const decDegrees = Math.floor(Math.random() * 180) - 90
  const decMinutes = Math.floor(Math.random() * 60)
  const decSeconds = Math.floor(Math.random() * 60)
  const decSign = decDegrees >= 0 ? '+' : ''

  return {
    id: `JWST-${obsId}`,
    targetName: target.name,
    category: target.category,
    instrument: instrument,
    startTime: startTime,
    duration: duration,
    description: target.description,
    coordinates: {
      ra: `${String(raHours).padStart(2, '0')}h ${String(raMinutes).padStart(2, '0')}m ${String(raSeconds).padStart(2, '0')}s`,
      dec: `${decSign}${Math.abs(decDegrees)}° ${String(decMinutes).padStart(2, '0')}' ${String(decSeconds).padStart(2, '0')}"`,
    },
    priority: priority,
    principalInvestigator: investigator,
    program: `Program #${programNum}`,
  }
}

const priorityColors = {
  high: 'bg-destructive text-destructive-foreground',
  medium: 'bg-secondary text-secondary-foreground',
  low: 'bg-muted text-muted-foreground',
}

const categoryIcons = {
  Galaxy: Sparkle,
  Nebula: Eye,
  Exoplanet: MapPin,
  'Star Cluster': Sparkle,
  'Supernova Remnant': Eye,
  'Protoplanetary Disk': MapPin,
  default: Binoculars,
}

export function NextObservation() {
  const [observation, setObservation] = useState<ObservationTarget | null>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    loadObservation()
  }, [])

  useEffect(() => {
    if (!observation) return

    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [observation])

  const loadObservation = async () => {
    setLoading(true)
    try {
      const data = await fetchNextObservation()
      setObservation(data)
      setCountdown(Math.floor(Math.random() * 3600) + 1800)
    } catch {
      toast.error('Failed to load observation schedule')
    } finally {
      setLoading(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Binoculars size={24} weight="fill" className="text-primary" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!observation) return null

  const CategoryIcon =
    categoryIcons[observation.category as keyof typeof categoryIcons] || categoryIcons['default']

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

          <CardHeader className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <motion.div
                  className="p-2.5 rounded-lg bg-primary/20"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Binoculars size={24} weight="fill" className="text-primary" />
                </motion.div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                    Next Scheduled Observation
                    <Badge variant="outline" className="text-xs">
                      Live Schedule
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">{observation.program}</CardDescription>
                </div>
              </div>
              <Badge className={priorityColors[observation.priority]}>
                {observation.priority.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 relative">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="p-2 rounded-lg bg-accent/10">
                <CategoryIcon size={20} weight="fill" className="text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-xl mb-1">{observation.targetName}</h3>
                <p className="text-sm text-muted-foreground mb-2">{observation.category}</p>
                <p className="text-sm leading-relaxed">{observation.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Start Time</p>
                  <p className="text-sm font-medium">{observation.startTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <ArrowRight size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Duration</p>
                  <p className="text-sm font-medium">{observation.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Binoculars size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Instrument</p>
                  <p className="text-sm font-medium font-mono">{observation.instrument}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Coordinates</p>
                  <p className="text-xs font-mono">
                    {observation.coordinates.ra}, {observation.coordinates.dec}
                  </p>
                </div>
              </div>
            </div>

            {countdown > 0 && (
              <motion.div
                className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Time Until Observation</p>
                    <p className="text-2xl font-bold font-mono tracking-tight">
                      {formatCountdown(countdown)}
                    </p>
                  </div>
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Clock size={32} weight="fill" className="text-primary opacity-50" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">Principal Investigator</p>
                <p className="text-sm font-medium">{observation.principalInvestigator}</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadObservation} className="gap-2">
                <ArrowRight size={16} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
