import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowsClockwise,
  Atom,
  CheckCircle,
  Compass,
  Crosshair,
  Engine,
  Gauge,
  Lightning,
  Minus,
  Thermometer,
  TrendDown,
  TrendUp,
  Warning,
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface TelemetryReading {
  value: number
  unit: string
  status: 'nominal' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  min: number
  max: number
  optimal: number
}

interface SubsystemTelemetry {
  name: string
  status: 'nominal' | 'warning' | 'critical'
  uptime: number
  lastUpdate: string
  readings: {
    [key: string]: TelemetryReading
  }
}

interface TelemetryData {
  opticalTelescope: SubsystemTelemetry
  guidanceSensors: SubsystemTelemetry
  thermalControl: SubsystemTelemetry
  reactionWheels: SubsystemTelemetry
  instrumentControl: SubsystemTelemetry
  powerDistribution: SubsystemTelemetry
}

function generateRandomReading(
  base: number,
  variance: number,
  unit: string,
  min: number,
  max: number,
  optimal: number
): TelemetryReading {
  const value = base + (Math.random() * variance * 2 - variance)
  const diff = value - optimal
  const threshold = Math.abs(max - optimal) * 0.1

  let status: 'nominal' | 'warning' | 'critical' = 'nominal'
  if (Math.abs(diff) > threshold * 2) status = 'warning'
  if (value < min || value > max) status = 'critical'

  const trend = Math.abs(diff) < 0.5 ? 'stable' : diff > 0 ? 'up' : 'down'

  return { value, unit, status, trend, min, max, optimal }
}

async function fetchTelemetryData(): Promise<TelemetryData> {
  await new Promise(resolve => setTimeout(resolve, 200))

  return {
    opticalTelescope: {
      name: 'Optical Telescope Element',
      status: 'nominal',
      uptime: 99.97,
      lastUpdate: 'Just now',
      readings: {
        'Primary Mirror Temp': generateRandomReading(-233.5, 0.8, '°C', -235, -230, -233.5),
        'Secondary Mirror Temp': generateRandomReading(-232.8, 0.6, '°C', -235, -230, -232.8),
        'Mirror Alignment Error': generateRandomReading(0.015, 0.008, 'nm RMS', 0, 0.05, 0.015),
        'Wavefront Error': generateRandomReading(131, 8, 'nm RMS', 0, 200, 131),
        'Focus Position': generateRandomReading(12.453, 0.002, 'mm', 12.4, 12.5, 12.453),
        'Optical Path Length': generateRandomReading(6.5, 0.01, 'm', 6.4, 6.6, 6.5),
      },
    },
    guidanceSensors: {
      name: 'Fine Guidance Sensors',
      status: 'nominal',
      uptime: 99.94,
      lastUpdate: 'Just now',
      readings: {
        'FGS1 Sensor Temp': generateRandomReading(-223.4, 0.4, '°C', -225, -220, -223.4),
        'FGS2 Sensor Temp': generateRandomReading(-223.2, 0.4, '°C', -225, -220, -223.2),
        'Pointing Accuracy': generateRandomReading(0.007, 0.002, 'arcsec', 0, 0.02, 0.007),
        'Tracking Error X': generateRandomReading(0.003, 0.001, 'arcsec', -0.01, 0.01, 0),
        'Tracking Error Y': generateRandomReading(-0.002, 0.001, 'arcsec', -0.01, 0.01, 0),
        'Star Lock Signal': generateRandomReading(94.5, 1.5, '%', 85, 100, 95),
      },
    },
    thermalControl: {
      name: 'Thermal Control System',
      status: 'nominal',
      uptime: 99.98,
      lastUpdate: 'Just now',
      readings: {
        'Sunshield Layer 1': generateRandomReading(78.4, 3.2, '°C', 50, 100, 80),
        'Sunshield Layer 5': generateRandomReading(-189.2, 2.1, '°C', -200, -180, -190),
        'Cold Side Temp': generateRandomReading(-233.4, 0.6, '°C', -240, -230, -233),
        'Hot Side Temp': generateRandomReading(67.8, 4.5, '°C', 40, 85, 70),
        'Radiator Efficiency': generateRandomReading(97.2, 1.2, '%', 90, 100, 97),
        'Heat Dissipation': generateRandomReading(385, 15, 'W', 300, 450, 380),
      },
    },
    reactionWheels: {
      name: 'Attitude Control Wheels',
      status: 'nominal',
      uptime: 99.91,
      lastUpdate: 'Just now',
      readings: {
        'Wheel 1 Speed': generateRandomReading(2450, 120, 'RPM', -5000, 5000, 2400),
        'Wheel 2 Speed': generateRandomReading(-1825, 95, 'RPM', -5000, 5000, -1800),
        'Wheel 3 Speed': generateRandomReading(3210, 140, 'RPM', -5000, 5000, 3200),
        'Wheel 4 Speed': generateRandomReading(890, 65, 'RPM', -5000, 5000, 900),
        'Angular Momentum': generateRandomReading(42.3, 2.1, 'Nms', 0, 80, 45),
        'Spin Axis Stability': generateRandomReading(99.7, 0.2, '%', 98, 100, 99.8),
      },
    },
    instrumentControl: {
      name: 'Science Instrument Module',
      status: 'nominal',
      uptime: 99.95,
      lastUpdate: 'Just now',
      readings: {
        'NIRCam Detector Temp': generateRandomReading(-196.4, 0.3, '°C', -200, -190, -196.5),
        'MIRI Cryocooler Temp': generateRandomReading(-266.8, 0.2, '°C', -268, -265, -266.8),
        'NIRSpec Detector Temp': generateRandomReading(-195.7, 0.3, '°C', -200, -190, -195.8),
        'NIRISS Detector Temp': generateRandomReading(-196.1, 0.3, '°C', -200, -190, -196.2),
        'Filter Wheel Position': generateRandomReading(143.24, 0.05, '°', 0, 360, 143.24),
        'Calibration Lamp Power': generateRandomReading(2.45, 0.12, 'W', 0, 5, 2.5),
      },
    },
    powerDistribution: {
      name: 'Electrical Power System',
      status: 'nominal',
      uptime: 99.99,
      lastUpdate: 'Just now',
      readings: {
        'Solar Array Voltage': generateRandomReading(32.4, 0.4, 'V', 28, 36, 32),
        'Battery Voltage': generateRandomReading(31.8, 0.3, 'V', 28, 34, 32),
        'Total Power Draw': generateRandomReading(2015, 85, 'W', 1500, 2500, 2000),
        'Battery Charge': generateRandomReading(87.4, 2.1, '%', 40, 100, 85),
        'Solar Array Current': generateRandomReading(62.3, 3.2, 'A', 40, 80, 62.5),
        'Power Efficiency': generateRandomReading(94.2, 1.5, '%', 85, 100, 94),
      },
    },
  }
}

const statusConfig = {
  nominal: {
    color: 'text-green-500',
    bg: 'bg-green-500',
    label: 'NOMINAL',
    icon: CheckCircle,
  },
  warning: {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500',
    label: 'WARNING',
    icon: Warning,
  },
  critical: {
    color: 'text-destructive',
    bg: 'bg-destructive',
    label: 'CRITICAL',
    icon: Warning,
  },
}

const subsystemIcons = {
  'Optical Telescope Element': Crosshair,
  'Fine Guidance Sensors': Compass,
  'Thermal Control System': Thermometer,
  'Attitude Control Wheels': Engine,
  'Science Instrument Module': Atom,
  'Electrical Power System': Lightning,
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  const icons = {
    up: TrendUp,
    down: TrendDown,
    stable: Minus,
  }
  const colors = {
    up: 'text-galaxy-blue',
    down: 'text-instrument-teal',
    stable: 'text-muted-foreground',
  }
  const Icon = icons[trend]
  return <Icon size={12} weight="bold" className={colors[trend]} />
}

function SubsystemPanel({ subsystem }: { subsystem: SubsystemTelemetry }) {
  const StatusIcon = statusConfig[subsystem.status].icon
  const SubsystemIcon = subsystemIcons[subsystem.name as keyof typeof subsystemIcons]

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <SubsystemIcon size={20} weight="fill" className="text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{subsystem.name}</CardTitle>
              <CardDescription className="text-xs mt-1 font-mono">
                Uptime: {subsystem.uptime.toFixed(2)}% • Updated {subsystem.lastUpdate}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`gap-1.5 ${statusConfig[subsystem.status].color} border-current/30 bg-current/5`}
          >
            <StatusIcon size={12} weight="fill" />
            {statusConfig[subsystem.status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(subsystem.readings).map(([name, reading]) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium">{name}</span>
                <TrendIndicator trend={reading.trend} />
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[reading.status].bg}`} />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-xl font-bold font-mono ${statusConfig[reading.status].color}`}>
                {reading.value.toFixed(
                  reading.unit === '%' || reading.unit.includes('arcsec') ? 2 : 1
                )}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{reading.unit}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Min: {reading.min}</span>
                <span>Optimal: {reading.optimal}</span>
                <span>Max: {reading.max}</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, Math.max(0, ((reading.value - reading.min) / (reading.max - reading.min)) * 100))}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/60"
                  style={{
                    left: `${((reading.optimal - reading.min) / (reading.max - reading.min)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

export function TelemetryMonitor() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadTelemetry = async () => {
    const data = await fetchTelemetryData()
    setTelemetry(data)
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    loadTelemetry()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadTelemetry, 3000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const allSubsystems = telemetry
    ? [
        telemetry.opticalTelescope,
        telemetry.guidanceSensors,
        telemetry.thermalControl,
        telemetry.reactionWheels,
        telemetry.instrumentControl,
        telemetry.powerDistribution,
      ]
    : []

  const nominalCount = allSubsystems.filter(s => s.status === 'nominal').length
  const warningCount = allSubsystems.filter(s => s.status === 'warning').length
  const criticalCount = allSubsystems.filter(s => s.status === 'critical').length

  if (loading || !telemetry) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <ArrowsClockwise size={48} className="text-primary mx-auto" />
          </motion.div>
          <p className="text-muted-foreground">Loading telemetry data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <Gauge size={28} weight="fill" className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Real-Time Telemetry</CardTitle>
                <CardDescription className="mt-1">
                  Live subsystem monitoring and diagnostic data
                </CardDescription>
              </div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                autoRefresh
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted border-border hover:bg-muted/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowsClockwise size={16} className={autoRefresh ? 'animate-spin' : ''} />
                <span className="text-sm font-medium">{autoRefresh ? 'Auto' : 'Manual'}</span>
              </div>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} weight="fill" className="text-green-500" />
                <span className="text-xs font-medium text-green-500">NOMINAL</span>
              </div>
              <p className="text-3xl font-bold text-green-500">{nominalCount}</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Warning size={16} weight="fill" className="text-yellow-500" />
                <span className="text-xs font-medium text-yellow-500">WARNING</span>
              </div>
              <p className="text-3xl font-bold text-yellow-500">{warningCount}</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-2 mb-1">
                <Warning size={16} weight="fill" className="text-destructive" />
                <span className="text-xs font-medium text-destructive">CRITICAL</span>
              </div>
              <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
            <span>Refresh rate: {autoRefresh ? '3s' : 'Manual'}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="optical" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="optical" className="text-xs">
            <Crosshair size={14} className="mr-1" />
            Optical
          </TabsTrigger>
          <TabsTrigger value="guidance" className="text-xs">
            <Compass size={14} className="mr-1" />
            Guidance
          </TabsTrigger>
          <TabsTrigger value="thermal" className="text-xs">
            <Thermometer size={14} className="mr-1" />
            Thermal
          </TabsTrigger>
          <TabsTrigger value="wheels" className="text-xs">
            <Engine size={14} className="mr-1" />
            Attitude
          </TabsTrigger>
          <TabsTrigger value="instruments" className="text-xs">
            <Atom size={14} className="mr-1" />
            Instruments
          </TabsTrigger>
          <TabsTrigger value="power" className="text-xs">
            <Lightning size={14} className="mr-1" />
            Power
          </TabsTrigger>
        </TabsList>

        <TabsContent value="optical" className="space-y-4">
          <SubsystemPanel subsystem={telemetry.opticalTelescope} />
        </TabsContent>

        <TabsContent value="guidance" className="space-y-4">
          <SubsystemPanel subsystem={telemetry.guidanceSensors} />
        </TabsContent>

        <TabsContent value="thermal" className="space-y-4">
          <SubsystemPanel subsystem={telemetry.thermalControl} />
        </TabsContent>

        <TabsContent value="wheels" className="space-y-4">
          <SubsystemPanel subsystem={telemetry.reactionWheels} />
        </TabsContent>

        <TabsContent value="instruments" className="space-y-4">
          <SubsystemPanel subsystem={telemetry.instrumentControl} />
        </TabsContent>

        <TabsContent value="power" className="space-y-4">
          <SubsystemPanel subsystem={telemetry.powerDistribution} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
