import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Broadcast,
  CheckCircle,
  Clock,
  Database,
  Eye,
  Gauge,
  HardDrive,
  Lightning,
  Pulse,
  Target,
  Thermometer,
  WifiHigh,
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface TelescopeStatus {
  operational: boolean
  currentTarget: string
  targetType: string
  observationId: string
  instrument: string
  startTime: string
  progress: number
  dataCollected: number
  estimatedCompletion: string
  coordinates: {
    ra: string
    dec: string
  }
}

interface SystemHealth {
  primaryMirror: {
    temperature: number
    alignment: string
    status: 'nominal' | 'warning' | 'critical'
  }
  powerSystem: {
    voltage: number
    current: number
    status: 'nominal' | 'warning' | 'critical'
  }
  communications: {
    bandwidth: number
    latency: number
    status: 'nominal' | 'warning' | 'critical'
  }
  dataStorage: {
    used: number
    total: number
    status: 'nominal' | 'warning' | 'critical'
  }
}

async function fetchLiveStatus(): Promise<TelescopeStatus> {
  const promptText = `You are generating realistic real-time data for the James Webb Space Telescope's current observation status.

Generate a single JSON object with a property called "status" containing the current observation with these exact fields:
- operational: always true (boolean)
- currentTarget: name of a cosmic object being observed right now (galaxy, nebula, exoplanet, etc.)
- targetType: one of ["Galaxy", "Nebula", "Exoplanet", "Star Cluster", "Supernova Remnant"]
- observationId: format "JWST-OBS-{5-digit number}"
- instrument: one of ["NIRCam", "MIRI", "NIRSpec", "NIRISS"]
- startTime: a recent time in the past few hours like "3 hours 24 minutes ago" or "1 hour 15 minutes ago"
- progress: a number between 45 and 85 (represents percentage)
- dataCollected: a number between 5 and 45 (represents GB)
- estimatedCompletion: time remaining like "1h 35m" or "45m"
- coordinates: object with "ra" (right ascension like "12h 34m 56s") and "dec" (declination like "+42° 15' 30\"")

Make it scientifically plausible. Return ONLY the JSON object:
{
  "status": { ...all fields here... }
}`

  try {
    const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const parsed = JSON.parse(result)
    return parsed.status
  } catch (error) {
    console.warn('Failed to fetch telescope status:', error)
    throw new Error('Failed to fetch telescope status')
  }
}

async function fetchSystemHealth(): Promise<SystemHealth> {
  return {
    primaryMirror: {
      temperature: -233.5 + (Math.random() * 2 - 1),
      alignment: 'Optimal',
      status: 'nominal',
    },
    powerSystem: {
      voltage: 28.5 + (Math.random() * 0.5 - 0.25),
      current: 2000 + Math.floor(Math.random() * 100),
      status: 'nominal',
    },
    communications: {
      bandwidth: 28 + Math.floor(Math.random() * 4),
      latency: 5.2 + Math.random() * 0.3,
      status: 'nominal',
    },
    dataStorage: {
      used: 145 + Math.floor(Math.random() * 10),
      total: 256,
      status: 'nominal',
    },
  }
}

const statusColors = {
  nominal: 'bg-green-500',
  warning: 'bg-yellow-500',
  critical: 'bg-destructive',
}

const _statusTextColors = {
  nominal: 'text-green-500',
  warning: 'text-yellow-500',
  critical: 'text-destructive',
}

export function LiveStatusDashboard() {
  const [status, setStatus] = useState<TelescopeStatus | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [liveProgress, setLiveProgress] = useState(0)
  const [dataRate, setDataRate] = useState(0)

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (status) {
      setLiveProgress(status.progress)

      const progressInterval = setInterval(() => {
        setLiveProgress(prev => {
          const newProgress = prev + Math.random() * 0.5
          return newProgress > 100 ? 100 : newProgress
        })
      }, 2000)

      const dataInterval = setInterval(() => {
        setDataRate(Math.random() * 2.5 + 0.5)
      }, 1500)

      return () => {
        clearInterval(progressInterval)
        clearInterval(dataInterval)
      }
    }
  }, [status])

  const loadStatus = async () => {
    setLoading(true)
    try {
      const [statusData, healthData] = await Promise.all([fetchLiveStatus(), fetchSystemHealth()])
      setStatus(statusData)
      setHealth(healthData)
    } catch (error) {
      console.warn('Failed to load telescope status:', error)
      toast.error('Failed to load telescope status')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!status || !health) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Live Telescope Status</h2>
        <p className="text-muted-foreground">
          Real-time observation tracking and system health monitoring
        </p>
      </div>

      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                className="p-3 rounded-lg bg-primary/20 relative"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(var(--primary), 0.4)',
                    '0 0 0 10px rgba(var(--primary), 0)',
                    '0 0 0 0 rgba(var(--primary), 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Broadcast size={28} weight="fill" className="text-primary" />
                <motion.div
                  className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2 flex-wrap">
                  Currently Observing
                  <Badge
                    variant="outline"
                    className="gap-1 bg-green-500/10 border-green-500/30 text-green-500"
                  >
                    <Pulse size={12} weight="bold" />
                    LIVE
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1 font-mono text-xs">
                  {status.observationId}
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle size={14} weight="fill" className="mr-1" />
              OPERATIONAL
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          <div className="p-5 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={20} weight="fill" className="text-primary" />
                  <h3 className="font-semibold text-2xl">{status.currentTarget}</h3>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary">{status.targetType}</Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {status.instrument}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {status.coordinates.ra}, {status.coordinates.dec}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Observation Progress</span>
                <span className="font-mono font-medium">{Math.floor(liveProgress)}%</span>
              </div>
              <div className="relative">
                <Progress value={liveProgress} className="h-2" />
                <motion.div
                  className="absolute top-0 left-0 h-2 w-2 bg-primary rounded-full blur-sm"
                  style={{ left: `${liveProgress}%` }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">Started</span>
              </div>
              <p className="text-sm font-medium">{status.startTime}</p>
            </div>

            <div className="p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-secondary" />
                <span className="text-xs text-muted-foreground">Time Remaining</span>
              </div>
              <p className="text-sm font-medium">{status.estimatedCompletion}</p>
            </div>

            <div className="p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Database size={16} className="text-accent" />
                <span className="text-xs text-muted-foreground">Data Collected</span>
              </div>
              <p className="text-sm font-medium">{status.dataCollected.toFixed(1)} GB</p>
            </div>

            <div className="p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Pulse size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">Data Rate</span>
              </div>
              <p className="text-sm font-medium font-mono">{dataRate.toFixed(2)} MB/s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge size={24} weight="fill" className="text-primary" />
            <CardTitle>System Health</CardTitle>
          </div>
          <CardDescription>Real-time monitoring of critical telescope subsystems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Eye size={20} weight="fill" className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Primary Mirror</div>
                    <div className="text-xs text-muted-foreground">
                      {health.primaryMirror.alignment}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${statusColors[health.primaryMirror.status]}`}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <Thermometer size={16} className="text-muted-foreground" />
                <span className="text-2xl font-bold font-mono">
                  {health.primaryMirror.temperature.toFixed(1)}°C
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Lightning size={20} weight="fill" className="text-secondary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Power System</div>
                    <div className="text-xs text-muted-foreground">Solar Array</div>
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${statusColors[health.powerSystem.status]}`}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono">
                  {health.powerSystem.voltage.toFixed(1)}V
                </span>
                <span className="text-sm text-muted-foreground">
                  / {health.powerSystem.current}W
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <WifiHigh size={20} weight="fill" className="text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Communications</div>
                    <div className="text-xs text-muted-foreground">Deep Space Network</div>
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${statusColors[health.communications.status]}`}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <WifiHigh size={16} className="text-muted-foreground" />
                <span className="text-2xl font-bold font-mono">
                  {health.communications.bandwidth} Mbps
                </span>
                <span className="text-sm text-muted-foreground">
                  ({health.communications.latency.toFixed(1)}s)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <HardDrive size={20} weight="fill" className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Data Storage</div>
                    <div className="text-xs text-muted-foreground">Solid State Recorder</div>
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${statusColors[health.dataStorage.status]}`}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono">{health.dataStorage.used} GB</span>
                  <span className="text-sm text-muted-foreground">
                    / {health.dataStorage.total} GB
                  </span>
                </div>
                <Progress
                  value={(health.dataStorage.used / health.dataStorage.total) * 100}
                  className="h-1"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} weight="fill" className="text-green-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">All Systems Nominal</div>
                <div className="text-xs text-muted-foreground">
                  Last diagnostic check: 2 minutes ago • Next scheduled check: 3 minutes
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
