import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  Pause,
  ArrowCounterClockwise,
  SkipForward,
  SkipBack,
  CheckCircle,
} from '@phosphor-icons/react'
import * as THREE from 'three'

interface DeploymentStep {
  id: string
  name: string
  description: string
  duration: string
  day: string
  technical: string
  criticality: 'critical' | 'high' | 'medium'
}

const deploymentSteps: DeploymentStep[] = [
  {
    id: 'launch',
    name: 'Launch Configuration',
    description: 'JWST is fully folded inside the Ariane 5 rocket fairing',
    duration: '0 hours',
    day: 'Day 0',
    technical:
      'All components secured in folded configuration for launch. Primary mirror wings folded back, sunshield compacted, secondary mirror support tower stowed.',
    criticality: 'critical',
  },
  {
    id: 'solar-array',
    name: 'Solar Array Deployment',
    description: 'Solar panels unfold to provide power to the spacecraft',
    duration: '33 minutes after launch',
    day: 'Day 0',
    technical:
      'Single-sided solar array deploys from stowed position. Five sub-panels unfold accordion-style to achieve full ~21 square meter surface area.',
    criticality: 'critical',
  },
  {
    id: 'antenna-deploy',
    name: 'High-Gain Antenna Deployment',
    description: 'Communications antenna deploys for Earth contact',
    duration: '2.5 hours after launch',
    day: 'Day 0',
    technical:
      'High-gain antenna deploys to enable high-speed Ka-band communications at 28 Mbps with ground stations.',
    criticality: 'critical',
  },
  {
    id: 'sunshield-pallet',
    name: 'Sunshield Pallet Deploy',
    description: 'Forward and aft sunshield pallets lower into position',
    duration: 'Day 3-4',
    day: 'Day 3-4',
    technical:
      'Forward pallet structure lowers, then aft pallet deploys. These structures form the support frame for the five sunshield layers.',
    criticality: 'critical',
  },
  {
    id: 'sunshield-unfold',
    name: 'Sunshield Unfolding',
    description: 'Tennis court-sized sunshield unfolds from its compact configuration',
    duration: 'Day 5-8',
    day: 'Day 5-8',
    technical:
      'Sunshield membrane release devices activate. All five Kapton layers unfold simultaneously from their Z-fold configuration to nearly full size.',
    criticality: 'critical',
  },
  {
    id: 'sunshield-tension',
    name: 'Sunshield Layer Tensioning',
    description: 'Each of the five layers is individually separated and tensioned',
    duration: 'Day 8-10',
    day: 'Day 8-10',
    technical:
      'Motor-driven tensioning systems pull each layer taut, creating precise gaps between layers for heat radiation. Each layer must achieve specific tension levels.',
    criticality: 'critical',
  },
  {
    id: 'secondary-mirror',
    name: 'Secondary Mirror Deployment',
    description: 'Secondary mirror support tower extends forward',
    duration: 'Day 11-12',
    day: 'Day 11-12',
    technical:
      'Three-strut support tower extends from stowed position, moving secondary mirror 7.6 meters forward from primary mirror to final optical position.',
    criticality: 'critical',
  },
  {
    id: 'primary-wings',
    name: 'Primary Mirror Wing Deployment',
    description: 'Side segments of primary mirror unfold into final configuration',
    duration: 'Day 13-14',
    day: 'Day 13-14',
    technical:
      'Left and right wing panels rotate outward, locking into position. Each wing contains 3 mirror segments, completing the 18-segment hexagonal array.',
    criticality: 'critical',
  },
  {
    id: 'complete',
    name: 'Deployment Complete',
    description: 'All major deployments finished - telescope in final form',
    duration: 'Day 14',
    day: 'Day 14',
    technical:
      'Telescope achieves full deployed configuration. All 344 single-point failure items successfully deployed. Mirror alignment and commissioning phase begins.',
    criticality: 'high',
  },
]

export function DeploymentSequence() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    let interval: number | undefined
    if (isPlaying && currentStep < deploymentSteps.length - 1) {
      interval = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= deploymentSteps.length - 1) {
            setIsPlaying(false)
            setHasCompleted(true)
            return prev
          }
          return prev + 1
        })
      }, 3000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentStep])

  const handlePlayPause = () => {
    if (currentStep >= deploymentSteps.length - 1) {
      setCurrentStep(0)
      setHasCompleted(false)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setHasCompleted(false)
  }

  const handleNext = () => {
    if (currentStep < deploymentSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setIsPlaying(false)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setIsPlaying(false)
      setHasCompleted(false)
    }
  }

  const progress = ((currentStep + 1) / deploymentSteps.length) * 100
  const step = deploymentSteps[currentStep]

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground'
      case 'high':
        return 'bg-secondary text-secondary-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Deployment Sequence</h2>
        <p className="text-muted-foreground mt-2">
          Watch JWST unfold in space over 14 days - the most complex deployment ever attempted
        </p>
      </div>

      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Deployment Progress</span>
                <span className="text-muted-foreground">
                  Step {currentStep + 1} of {deploymentSteps.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handlePlayPause} size="lg" className="gap-2">
                {isPlaying ? (
                  <>
                    <Pause size={20} weight="fill" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} weight="fill" />
                    {hasCompleted ? 'Replay' : 'Play'}
                  </>
                )}
              </Button>
              <Button onClick={handleReset} variant="secondary" size="lg" className="gap-2">
                <ArrowCounterClockwise size={20} />
                Reset
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  size="lg"
                  disabled={currentStep === 0}
                >
                  <SkipBack size={20} />
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="lg"
                  disabled={currentStep >= deploymentSteps.length - 1}
                >
                  <SkipForward size={20} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative aspect-square bg-gradient-to-br from-background via-primary/5 to-background rounded-lg border-2 border-border overflow-hidden">
          <DeploymentVisualization step={step.id} />

          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="text-sm font-mono">
              {step.day}
            </Badge>
          </div>

          {hasCompleted && currentStep === deploymentSteps.length - 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="absolute top-4 left-4"
            >
              <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg">
                <CheckCircle size={20} weight="fill" />
                <span className="font-semibold text-sm">Complete!</span>
              </div>
            </motion.div>
          )}
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <motion.h3
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold"
                >
                  {step.name}
                </motion.h3>
                <motion.p
                  key={`duration-${currentStep}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-muted-foreground mt-1 font-mono"
                >
                  {step.duration}
                </motion.p>
              </div>
              <Badge className={getCriticalityColor(step.criticality)}>{step.criticality}</Badge>
            </div>

            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-foreground"
            >
              {step.description}
            </motion.p>

            <motion.div
              key={`tech-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-muted/50 rounded-lg"
            >
              <h4 className="font-semibold text-sm mb-2">Technical Details</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.technical}</p>
            </motion.div>

            {step.id === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-secondary/20 border border-secondary rounded-lg"
              >
                <p className="text-sm text-foreground">
                  <strong>Success Rate:</strong> All 344 single-point failure items deployed
                  successfully. JWST became the most complex spacecraft ever deployed in space, with
                  zero failures during the deployment sequence.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Deployment Timeline</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {deploymentSteps.map((s, index) => (
                <motion.button
                  key={s.id}
                  onClick={() => {
                    setCurrentStep(index)
                    setIsPlaying(false)
                  }}
                  className={`relative flex items-start gap-4 w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentStep
                      ? 'bg-primary/10 border border-primary/30'
                      : index < currentStep
                        ? 'bg-muted/50 hover:bg-muted'
                        : 'hover:bg-muted/30'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      index < currentStep
                        ? 'bg-secondary border-secondary'
                        : index === currentStep
                          ? 'bg-primary border-primary'
                          : 'bg-background border-border'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle size={16} weight="fill" className="text-secondary-foreground" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm">{s.name}</h4>
                      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                        {s.day}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DeploymentVisualization({ step }: { step: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const meshesRef = useRef<{
    primaryMirror: THREE.Group
    secondaryMirror: THREE.Mesh
    sunshield: THREE.Mesh[]
    solarArray: THREE.Mesh[]
    antenna: THREE.Group
    instruments: THREE.Mesh[]
    struts: THREE.Mesh[]
    leftWing: THREE.Group
    rightWing: THREE.Group
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050510)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 3, 12)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(5, 10, 5)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0x6666ff, 0.3)
    directionalLight2.position.set(-5, 3, -5)
    scene.add(directionalLight2)

    const pointLight = new THREE.PointLight(0xffd700, 0.5, 20)
    pointLight.position.set(0, 0, 0)
    scene.add(pointLight)

    const primaryMirrorGroup = new THREE.Group()
    const hexagonShape = new THREE.Shape()
    const size = 0.35
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = size * Math.cos(angle)
      const y = size * Math.sin(angle)
      if (i === 0) {
        hexagonShape.moveTo(x, y)
      } else {
        hexagonShape.lineTo(x, y)
      }
    }
    hexagonShape.lineTo(size * Math.cos(0), size * Math.sin(0))

    const extrudeSettings = {
      steps: 1,
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3,
    }
    const hexGeometry = new THREE.ExtrudeGeometry(hexagonShape, extrudeSettings)
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.05,
      emissive: 0xaa6600,
      emissiveIntensity: 0.3,
    })

    const centerPositions = [[0, 0]]
    centerPositions.forEach(([x, y]) => {
      const hex = new THREE.Mesh(hexGeometry, mirrorMaterial)
      hex.position.set(x, y, 0)
      primaryMirrorGroup.add(hex)
    })

    const leftWing = new THREE.Group()
    const leftPositions = [
      [-0.77, 0],
      [-1.155, 0.66],
      [-1.155, -0.66],
      [-1.54, 0],
    ]
    leftPositions.forEach(([x, y]) => {
      const hex = new THREE.Mesh(hexGeometry, mirrorMaterial)
      hex.position.set(x, y, 0)
      leftWing.add(hex)
    })
    primaryMirrorGroup.add(leftWing)

    const rightWing = new THREE.Group()
    const rightPositions = [
      [0.77, 0],
      [1.155, 0.66],
      [1.155, -0.66],
      [1.54, 0],
    ]
    rightPositions.forEach(([x, y]) => {
      const hex = new THREE.Mesh(hexGeometry, mirrorMaterial)
      hex.position.set(x, y, 0)
      rightWing.add(hex)
    })
    primaryMirrorGroup.add(rightWing)

    scene.add(primaryMirrorGroup)

    const secondaryMirrorGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 32)
    const secondaryMirror = new THREE.Mesh(secondaryMirrorGeometry, mirrorMaterial)
    secondaryMirror.position.set(0, 0, 3.5)
    secondaryMirror.rotation.x = Math.PI / 2
    scene.add(secondaryMirror)

    const strutMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.2,
    })
    const struts: THREE.Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3
      const x = Math.cos(angle) * 0.35
      const y = Math.sin(angle) * 0.35
      const strutGeometry = new THREE.CylinderGeometry(0.025, 0.025, 3.5, 8)
      const strut = new THREE.Mesh(strutGeometry, strutMaterial)
      strut.position.set(x, y, 1.75)
      strut.rotation.x = Math.PI / 2
      scene.add(strut)
      struts.push(strut)
    }

    const sunshieldLayers: THREE.Mesh[] = []
    for (let i = 0; i < 5; i++) {
      const sunshieldGeometry = new THREE.PlaneGeometry(4.5, 3, 12, 8)
      const sunshieldMaterial = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xcccccc : 0xaaaaaa,
        metalness: 0.3,
        roughness: 0.7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      })
      const sunshield = new THREE.Mesh(sunshieldGeometry, sunshieldMaterial)
      sunshield.position.set(0, 0, -2.5 - i * 0.15)
      sunshield.rotation.x = Math.PI / 2
      scene.add(sunshield)
      sunshieldLayers.push(sunshield)
    }

    const solarArrayPanels: THREE.Mesh[] = []
    for (let i = 0; i < 5; i++) {
      const panelGeometry = new THREE.BoxGeometry(0.3, 1.8, 0.02)
      const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a3e,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x0a0a2e,
        emissiveIntensity: 0.4,
      })
      const panel = new THREE.Mesh(panelGeometry, panelMaterial)
      panel.position.set(3 + i * 0.3, 0, -2)
      solarArrayPanels.push(panel)
      scene.add(panel)
    }

    const antennaGroup = new THREE.Group()
    const dishGeometry = new THREE.SphereGeometry(0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)
    const dishMaterial = new THREE.MeshStandardMaterial({
      color: 0xddaa00,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x886600,
      emissiveIntensity: 0.2,
    })
    const dish = new THREE.Mesh(dishGeometry, dishMaterial)
    const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8)
    const arm = new THREE.Mesh(armGeometry, strutMaterial)
    arm.position.y = -0.25
    antennaGroup.add(dish, arm)
    antennaGroup.position.set(2, 1, -1.5)
    scene.add(antennaGroup)

    const instrumentGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.25)
    const instruments: THREE.Mesh[] = []
    const instrumentPositions = [
      { pos: [0, -0.8, -0.3], color: 0x8844ff },
      { pos: [-0.6, -0.8, -0.3], color: 0xff4488 },
      { pos: [0.6, -0.8, -0.3], color: 0x44ff88 },
    ]
    instrumentPositions.forEach(({ pos, color }) => {
      const material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.7,
        roughness: 0.3,
        emissive: color,
        emissiveIntensity: 0.4,
      })
      const mesh = new THREE.Mesh(instrumentGeometry, material)
      mesh.position.set(pos[0], pos[1], pos[2])
      scene.add(mesh)
      instruments.push(mesh)
    })

    const starGeometry = new THREE.BufferGeometry()
    const starPositions: number[] = []
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 200
      const y = (Math.random() - 0.5) * 200
      const z = (Math.random() - 0.5) * 200
      starPositions.push(x, y, z)
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3))
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    meshesRef.current = {
      primaryMirror: primaryMirrorGroup,
      secondaryMirror,
      sunshield: sunshieldLayers,
      solarArray: solarArrayPanels,
      antenna: antennaGroup,
      instruments,
      struts,
      leftWing,
      rightWing,
    }

    const handleResize = () => {
      if (!containerRef.current) return
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }
    window.addEventListener('resize', handleResize)

    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      primaryMirrorGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.1
      stars.rotation.y += 0.0001
      stars.rotation.x += 0.00005

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (!meshesRef.current) return

    const meshes = meshesRef.current

    switch (step) {
      case 'launch':
        meshes.leftWing.rotation.y = -Math.PI / 3
        meshes.rightWing.rotation.y = Math.PI / 3
        meshes.secondaryMirror.position.z = 0.5
        meshes.struts.forEach(s => {
          s.scale.z = 0.2
        })
        meshes.sunshield.forEach(s => {
          s.scale.set(0.3, 0.3, 1)
          s.position.z = -1
        })
        meshes.solarArray.forEach(p => {
          p.rotation.y = -Math.PI / 2
          p.position.x = 0.5
        })
        meshes.antenna.rotation.x = -Math.PI / 2
        break

      case 'solar-array':
        meshes.leftWing.rotation.y = -Math.PI / 3
        meshes.rightWing.rotation.y = Math.PI / 3
        meshes.secondaryMirror.position.z = 0.5
        meshes.struts.forEach(s => {
          s.scale.z = 0.2
        })
        meshes.sunshield.forEach(s => {
          s.scale.set(0.3, 0.3, 1)
          s.position.z = -1
        })
        meshes.solarArray.forEach((p, _i) => {
          p.rotation.y = 0
          p.position.x = 3 + _i * 0.3
        })
        meshes.antenna.rotation.x = -Math.PI / 2
        break

      case 'antenna-deploy':
        meshes.leftWing.rotation.y = -Math.PI / 3
        meshes.rightWing.rotation.y = Math.PI / 3
        meshes.secondaryMirror.position.z = 0.5
        meshes.struts.forEach(s => {
          s.scale.z = 0.2
        })
        meshes.sunshield.forEach(s => {
          s.scale.set(0.3, 0.3, 1)
          s.position.z = -1
        })
        meshes.solarArray.forEach((p, _i) => {
          p.rotation.y = 0
          p.position.x = 3 + _i * 0.3
        })
        meshes.antenna.rotation.x = 0
        break

      case 'sunshield-pallet':
        meshes.leftWing.rotation.y = -Math.PI / 3
        meshes.rightWing.rotation.y = Math.PI / 3
        meshes.secondaryMirror.position.z = 0.5
        meshes.struts.forEach(s => {
          s.scale.z = 0.2
        })
        meshes.sunshield.forEach((s, i) => {
          s.scale.set(0.5, 0.5, 1)
          s.position.z = -1.5 - i * 0.05
        })
        meshes.solarArray.forEach((p, i) => {
          p.rotation.y = 0
          p.position.x = 3 + i * 0.3
        })
        meshes.antenna.rotation.x = 0
        break

      case 'sunshield-unfold':
        meshes.leftWing.rotation.y = -Math.PI / 3
        meshes.rightWing.rotation.y = Math.PI / 3
        meshes.secondaryMirror.position.z = 0.5
        meshes.struts.forEach(s => {
          s.scale.z = 0.2
        })
        meshes.sunshield.forEach((s, i) => {
          s.scale.set(1, 1, 1)
          s.position.z = -2.2 - i * 0.08
        })
        meshes.solarArray.forEach((p, i) => {
          p.rotation.y = 0
          p.position.x = 3 + i * 0.3
        })
        meshes.antenna.rotation.x = 0
        break

      case 'sunshield-tension':
        meshes.leftWing.rotation.y = -Math.PI / 3
        meshes.rightWing.rotation.y = Math.PI / 3
        meshes.secondaryMirror.position.z = 0.5
        meshes.struts.forEach(s => {
          s.scale.z = 0.2
        })
        meshes.sunshield.forEach((s, i) => {
          s.scale.set(1, 1, 1)
          s.position.z = -2.5 - i * 0.15
        })
        meshes.solarArray.forEach((p, i) => {
          p.rotation.y = 0
          p.position.x = 3 + i * 0.3
        })
        meshes.antenna.rotation.x = 0
        break

      case 'secondary-mirror':
        meshes.leftWing.rotation.y = -Math.PI / 3
        meshes.rightWing.rotation.y = Math.PI / 3
        meshes.secondaryMirror.position.z = 3.5
        meshes.struts.forEach(s => {
          s.scale.z = 1
        })
        meshes.sunshield.forEach((s, i) => {
          s.scale.set(1, 1, 1)
          s.position.z = -2.5 - i * 0.15
        })
        meshes.solarArray.forEach((p, i) => {
          p.rotation.y = 0
          p.position.x = 3 + i * 0.3
        })
        meshes.antenna.rotation.x = 0
        break

      case 'primary-wings':
      case 'complete':
        meshes.leftWing.rotation.y = 0
        meshes.rightWing.rotation.y = 0
        meshes.secondaryMirror.position.z = 3.5
        meshes.struts.forEach(s => {
          s.scale.z = 1
        })
        meshes.sunshield.forEach((s, i) => {
          s.scale.set(1, 1, 1)
          s.position.z = -2.5 - i * 0.15
        })
        meshes.solarArray.forEach((p, i) => {
          p.rotation.y = 0
          p.position.x = 3 + i * 0.3
        })
        meshes.antenna.rotation.x = 0
        break
    }
  }, [step])

  return <div ref={containerRef} className="w-full h-full" />
}
