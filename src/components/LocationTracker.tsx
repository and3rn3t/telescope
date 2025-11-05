import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Globe, Rocket, Timer } from '@phosphor-icons/react'
import { InfoTooltip } from '@/components/InfoTooltip'

export function LocationTracker() {
  const [elapsedTime, setElapsedTime] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  const launchDate = new Date('2021-12-25T12:20:00Z')
  const l2Distance = 1500000
  const orbitPeriod = 180

  useEffect(() => {
    const now = new Date()
    const daysSinceLaunch = (now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)
    setElapsedTime(daysSinceLaunch)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const scale = Math.min(rect.width, rect.height) / 2.5

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      ctx.strokeStyle = 'oklch(0.25 0.03 290)'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, scale * 0.4, scale * 0.15, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = 'oklch(0.75 0.15 85)'
      ctx.shadowBlur = 20
      ctx.shadowColor = 'oklch(0.75 0.15 85)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      const now = new Date()
      const daysSinceLaunch = (now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)
      const orbitProgress = (daysSinceLaunch % orbitPeriod) / orbitPeriod
      const angle = orbitProgress * Math.PI * 2

      const jwstX = centerX + Math.cos(angle) * scale * 0.4
      const jwstY = centerY + Math.sin(angle) * scale * 0.15

      const gradient = ctx.createRadialGradient(jwstX, jwstY, 0, jwstX, jwstY, 15)
      gradient.addColorStop(0, 'oklch(0.65 0.20 50)')
      gradient.addColorStop(0.5, 'oklch(0.55 0.18 50 / 0.6)')
      gradient.addColorStop(1, 'oklch(0.45 0.15 50 / 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(jwstX, jwstY, 15, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'oklch(0.95 0.01 290)'
      ctx.font = 'bold 14px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('JWST', jwstX, jwstY)

      const earthLabel = 'Earth-Sun L2'
      ctx.fillStyle = 'oklch(0.75 0.01 290)'
      ctx.font = '12px Inter'
      ctx.fillText(earthLabel, centerX, centerY + 25)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [launchDate, orbitPeriod])

  const formatDuration = (days: number) => {
    const years = Math.floor(days / 365)
    const remainingDays = Math.floor(days % 365)
    return `${years}y ${remainingDays}d`
  }

  const getNextMilestone = () => {
    const daysSinceLaunch = elapsedTime
    const daysInOrbit = daysSinceLaunch - 30
    const currentOrbitNumber = Math.floor(daysInOrbit / orbitPeriod) + 1
    const daysUntilNextOrbit = orbitPeriod - (daysInOrbit % orbitPeriod)

    return {
      orbitNumber: currentOrbitNumber,
      daysUntilComplete: Math.floor(daysUntilNextOrbit),
    }
  }

  const milestone = getNextMilestone()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <MapPin size={24} weight="fill" className="text-secondary" />
          Real-Time Location
        </h2>
        <p className="text-muted-foreground">
          Track JWST's current position orbiting the Earth-Sun L2 Lagrange point
        </p>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
        <div className="aspect-[2/1] relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-primary" weight="fill" />
              <h3 className="font-semibold">Current Distance</h3>
            </div>
            <InfoTooltip
              content={{
                title: 'L2 Distance',
                description:
                  'JWST orbits around the Earth-Sun L2 Lagrange point, located approximately 1.5 million kilometers from Earth.',
                details:
                  "This stable gravitational point allows JWST to maintain a constant distance from Earth while keeping its sensitive instruments shielded from the Sun's heat and light.",
              }}
              side="left"
            />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono text-secondary">
              {l2Distance.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">kilometers from Earth</div>
          </div>
          <Badge variant="secondary" className="w-fit">
            ~4x Moon's distance
          </Badge>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Rocket size={20} className="text-accent" weight="fill" />
              <h3 className="font-semibold">Mission Duration</h3>
            </div>
            <InfoTooltip
              content={{
                title: 'Time in Space',
                description:
                  'JWST was launched on December 25, 2021, and reached its operational orbit at L2 in late January 2022.',
                details:
                  'The telescope has a planned mission lifetime of 5-10 years, with sufficient propellant to potentially extend operations beyond that timeframe.',
              }}
              side="left"
            />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono text-accent">
              {formatDuration(elapsedTime)}
            </div>
            <div className="text-sm text-muted-foreground">since launch</div>
          </div>
          <Badge variant="outline" className="w-fit border-accent text-accent">
            Launched Dec 25, 2021
          </Badge>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Timer size={20} className="text-primary" weight="fill" />
              <h3 className="font-semibold">Orbital Period</h3>
            </div>
            <InfoTooltip
              content={{
                title: 'Halo Orbit',
                description:
                  "JWST doesn't orbit Earth directly. Instead, it follows a 'halo orbit' around the L2 point.",
                details:
                  'This orbit takes approximately 6 months to complete and requires periodic thruster firings to maintain stability. The halo orbit keeps the telescope from being eclipsed by Earth or Moon.',
              }}
              side="left"
            />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono text-primary">~{orbitPeriod}</div>
            <div className="text-sm text-muted-foreground">days per orbit</div>
          </div>
          <Badge variant="outline" className="w-fit border-primary text-primary">
            Orbit #{milestone.orbitNumber}
          </Badge>
        </Card>

        <Card className="p-4 space-y-3 border-secondary/30 bg-secondary/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <h3 className="font-semibold">Live Status</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="secondary" className="bg-secondary/20">
                Operational
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Next Orbit Complete</span>
              <span className="font-mono text-foreground">~{milestone.daysUntilComplete}d</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Phase</span>
              <span className="font-medium text-foreground">Science Operations</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-muted/30 border-muted">
        <div className="flex gap-4 items-start">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <MapPin size={20} className="text-primary" weight="fill" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">What is L2?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Earth-Sun L2 Lagrange point is a gravitationally stable location in space where
              the gravitational forces of Earth and Sun balance with the orbital motion. Located 1.5
              million km beyond Earth (opposite the Sun), it's the perfect spot for JWST to maintain
              a constant view of deep space while keeping its sunshield between the telescope and
              the Sun-Earth system, ensuring ultra-cold operating temperatures for its infrared
              instruments.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
