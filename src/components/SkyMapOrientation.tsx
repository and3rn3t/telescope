import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crosshair, ArrowsClockwise, Compass, Eye } from '@phosphor-icons/react'
import { InfoTooltip } from '@/components/InfoTooltip'
import { motion } from 'framer-motion'

interface OrientationData {
  rightAscension: number
  declination: number
  roll: number
  pitch: number
  yaw: number
  fieldOfView: number
  targetName: string
  coordinateDisplay: string
}

export function SkyMapOrientation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [orientation, setOrientation] = useState<OrientationData>({
    rightAscension: 53.16,
    declination: -27.79,
    roll: 0,
    pitch: 0,
    yaw: 0,
    fieldOfView: 2.2,
    targetName: 'NGC 1365',
    coordinateDisplay: '03h 33m 38s, -27° 47\' 24"',
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setOrientation(prev => ({
        ...prev,
        roll: (prev.roll + 0.05) % 360,
        pitch: Math.sin(Date.now() / 5000) * 0.3,
        yaw: Math.cos(Date.now() / 7000) * 0.2,
      }))
    }, 50)

    return () => clearInterval(interval)
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
    const mapRadius = Math.min(rect.width, rect.height) / 2 - 40

    const drawSkyMap = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      ctx.fillStyle = 'oklch(0.15 0.02 290)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, mapRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'oklch(0.25 0.03 290)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])

      for (let i = 1; i <= 3; i++) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, (mapRadius / 3) * i, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.setLineDash([])

      ctx.strokeStyle = 'oklch(0.3 0.03 290 / 0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX - mapRadius, centerY)
      ctx.lineTo(centerX + mapRadius, centerY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - mapRadius)
      ctx.lineTo(centerX, centerY + mapRadius)
      ctx.stroke()

      const numStars = 150
      for (let i = 0; i < numStars; i++) {
        const angle = (Math.PI * 2 * i) / numStars + Date.now() / 20000
        const distance = Math.random() * mapRadius * 0.95
        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance
        const size = Math.random() * 2 + 0.5
        const brightness = 0.5 + Math.random() * 0.5

        ctx.fillStyle = `oklch(${brightness} 0.01 290 / ${brightness})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      const constellations = [
        {
          points: [
            [0.3, 0.2],
            [0.5, 0.3],
            [0.7, 0.25],
            [0.6, 0.5],
          ],
        },
        {
          points: [
            [0.2, 0.6],
            [0.3, 0.7],
            [0.25, 0.8],
          ],
        },
        {
          points: [
            [0.7, 0.6],
            [0.8, 0.65],
            [0.75, 0.75],
            [0.7, 0.8],
          ],
        },
      ]

      ctx.strokeStyle = 'oklch(0.4 0.05 290 / 0.3)'
      ctx.lineWidth = 1
      constellations.forEach(constellation => {
        ctx.beginPath()
        constellation.points.forEach((point, i) => {
          const x = centerX + (point[0] - 0.5) * mapRadius * 1.8
          const y = centerY + (point[1] - 0.5) * mapRadius * 1.8
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      })

      const raOffset = (orientation.rightAscension / 360) * Math.PI * 2
      const decOffset = (orientation.declination / 90) * mapRadius * 0.3

      const targetX = centerX + Math.cos(raOffset) * decOffset
      const targetY = centerY + Math.sin(raOffset) * decOffset

      const gradient = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 30)
      gradient.addColorStop(0, 'oklch(0.75 0.15 85 / 0.8)')
      gradient.addColorStop(0.4, 'oklch(0.75 0.15 85 / 0.3)')
      gradient.addColorStop(1, 'oklch(0.75 0.15 85 / 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(targetX, targetY, 30, 0, Math.PI * 2)
      ctx.fill()

      const fovSize = (orientation.fieldOfView / 180) * mapRadius
      ctx.save()
      ctx.translate(targetX, targetY)
      ctx.rotate((orientation.roll * Math.PI) / 180)

      ctx.strokeStyle = 'oklch(0.65 0.20 50)'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.strokeRect(-fovSize / 2, -fovSize / 2, fovSize, fovSize)

      ctx.strokeStyle = 'oklch(0.65 0.20 50 / 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-fovSize / 2, 0)
      ctx.lineTo(fovSize / 2, 0)
      ctx.moveTo(0, -fovSize / 2)
      ctx.lineTo(0, fovSize / 2)
      ctx.stroke()

      const arrowSize = fovSize * 0.15
      ctx.fillStyle = 'oklch(0.65 0.20 50)'
      ctx.beginPath()
      ctx.moveTo(0, -fovSize / 2 - arrowSize)
      ctx.lineTo(-arrowSize / 2, -fovSize / 2 - arrowSize / 2)
      ctx.lineTo(arrowSize / 2, -fovSize / 2 - arrowSize / 2)
      ctx.closePath()
      ctx.fill()

      ctx.restore()

      ctx.fillStyle = 'oklch(0.75 0.15 85)'
      ctx.shadowBlur = 15
      ctx.shadowColor = 'oklch(0.75 0.15 85)'
      ctx.beginPath()
      ctx.arc(targetX, targetY, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = 'oklch(0.85 0.01 290)'
      ctx.font = 'bold 12px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(orientation.targetName, targetX, targetY + fovSize / 2 + 15)

      const labels = [
        { text: '0°', x: centerX + mapRadius + 15, y: centerY },
        { text: '90°', x: centerX, y: centerY - mapRadius - 15 },
        { text: '180°', x: centerX - mapRadius - 20, y: centerY },
        { text: '270°', x: centerX, y: centerY + mapRadius + 20 },
      ]

      ctx.fillStyle = 'oklch(0.6 0.01 290)'
      ctx.font = '10px Inter'
      labels.forEach(label => {
        ctx.textAlign =
          label.x > centerX + 10 ? 'left' : label.x < centerX - 10 ? 'right' : 'center'
        ctx.textBaseline =
          label.y > centerY + 10 ? 'top' : label.y < centerY - 10 ? 'bottom' : 'middle'
        ctx.fillText(label.text, label.x, label.y)
      })

      animationRef.current = requestAnimationFrame(drawSkyMap)
    }

    drawSkyMap()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [orientation])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <Compass size={24} weight="fill" className="text-accent" />
          Telescope Orientation & Pointing
        </h2>
        <p className="text-muted-foreground">
          Real-time view of JWST's orientation and current pointing direction on the celestial
          sphere
        </p>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye size={20} weight="fill" />
              Celestial Sky Map
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 border-accent text-accent">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Live View
              </Badge>
              <InfoTooltip
                content={{
                  title: 'Sky Map Projection',
                  description:
                    "This celestial map shows JWST's current pointing direction in the sky using equatorial coordinates (Right Ascension and Declination).",
                  details:
                    "The yellow crosshair indicates the telescope's field of view and orientation. The arrow shows the 'north' direction of the detector. Background stars and constellations provide reference points.",
                }}
                side="left"
              />
            </div>
          </div>

          <div className="aspect-square max-w-2xl mx-auto">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Right Ascension</div>
              <div className="text-lg font-bold font-mono text-accent">
                {orientation.rightAscension.toFixed(2)}°
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Declination</div>
              <div className="text-lg font-bold font-mono text-accent">
                {orientation.declination > 0 ? '+' : ''}
                {orientation.declination.toFixed(2)}°
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Field of View</div>
              <div className="text-lg font-bold font-mono text-secondary">
                {orientation.fieldOfView.toFixed(1)}′
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Detector Roll</div>
              <div className="text-lg font-bold font-mono text-primary">
                {orientation.roll.toFixed(1)}°
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Crosshair size={20} className="text-accent" weight="bold" />
              <h3 className="font-semibold text-sm">Current Target</h3>
            </div>
            <InfoTooltip
              content={{
                title: 'Target Coordinates',
                description:
                  "The astronomical object currently in JWST's field of view, specified in equatorial coordinates.",
                details:
                  'Right Ascension (RA) measures east-west position like longitude, while Declination (Dec) measures north-south like latitude on the celestial sphere.',
              }}
              side="left"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-accent">{orientation.targetName}</div>
            <div className="text-sm text-muted-foreground font-mono">
              {orientation.coordinateDisplay}
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <ArrowsClockwise size={20} className="text-primary" weight="bold" />
              <h3 className="font-semibold text-sm">Attitude Control</h3>
            </div>
            <InfoTooltip
              content={{
                title: 'Spacecraft Attitude',
                description:
                  "JWST's orientation in 3D space, controlled by reaction wheels and thrusters.",
                details:
                  'Roll controls rotation around the viewing axis, pitch controls up/down tilt, and yaw controls left/right rotation. Precise attitude control is critical for long exposures.',
              }}
              side="left"
            />
          </div>
          <div className="space-y-2">
            <motion.div
              className="flex justify-between items-center text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-muted-foreground">Roll:</span>
              <span className="font-mono font-semibold">{orientation.roll.toFixed(2)}°</span>
            </motion.div>
            <motion.div
              className="flex justify-between items-center text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-muted-foreground">Pitch:</span>
              <span className="font-mono font-semibold">{orientation.pitch.toFixed(2)}°</span>
            </motion.div>
            <motion.div
              className="flex justify-between items-center text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-muted-foreground">Yaw:</span>
              <span className="font-mono font-semibold">{orientation.yaw.toFixed(2)}°</span>
            </motion.div>
          </div>
        </Card>

        <Card className="p-4 space-y-3 border-secondary/30 bg-secondary/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <h3 className="font-semibold text-sm">Pointing Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Pointing Mode</span>
              <Badge variant="secondary" className="bg-secondary/20">
                Fine Guidance
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Guide Star</span>
              <span className="font-medium text-foreground">Locked</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Stability</span>
              <span className="font-mono font-semibold text-secondary">± 0.007"</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-muted/30 border-muted">
        <div className="flex gap-4 items-start">
          <div className="p-2 rounded-lg bg-accent/10 shrink-0">
            <Compass size={20} className="text-accent" weight="fill" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Ultra-Precise Pointing</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              JWST's pointing precision is extraordinary - it can hold its position within 0.007
              arcseconds (about 1/10,000th of a degree). This is equivalent to holding a laser
              pointer steady on a dime from 200 miles away! The Fine Guidance Sensor locks onto
              guide stars to maintain this incredible stability during long exposures, while
              reaction wheels make continuous micro-adjustments to compensate for any drift. This
              precision enables JWST to capture razor-sharp images of the most distant galaxies in
              the universe.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
