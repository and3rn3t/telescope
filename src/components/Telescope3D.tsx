import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { JWSTGeometries } from '@/lib/jwst-geometries'
import { InstrumentMaterials, JWSTMaterials, SpaceEnvironment } from '@/lib/jwst-materials'
import {
  detectDeviceCapabilities,
  PerformanceConfig,
  PerformanceMonitor,
} from '@/lib/performance-optimization'
import { TelescopeComponent } from '@/lib/telescope-data'
import {
  ArrowClockwise,
  ArrowsOutSimple,
  Cpu,
  Cube,
  EyeSlash,
  Hand,
  HouseLine,
  Info,
  Lightning,
  PlayCircle,
  Target,
} from '@phosphor-icons/react'
import { Environment, Html, MeshReflectorMaterial, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'
import { DeploymentAnimation } from './DeploymentAnimation3D'

interface Telescope3DProps {
  onComponentClick: (component: TelescopeComponent) => void
  selectedComponent: TelescopeComponent | null
  components: TelescopeComponent[]
}

interface MirrorSegmentProps {
  readonly position: readonly [number, number, number]
  readonly rotation: readonly [number, number, number]
  readonly highlighted: boolean
  readonly segmentId: number
}

// Use enhanced materials from the materials library
const Materials = JWSTMaterials

// Individual mirror segment component
// Optimized mirror segment component with smooth animations
function MirrorSegment({
  position,
  rotation,
  highlighted,
  segmentId: _segmentId,
}: Readonly<MirrorSegmentProps>) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetScale = useRef(1)
  const currentScale = useRef(1)

  useFrame(state => {
    if (!meshRef.current) return

    // Smooth material transitions and animations
    if (highlighted) {
      meshRef.current.material = Materials.highlighted
      // Smoother breathing animation
      targetScale.current = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.025
    } else {
      meshRef.current.material = Materials.primaryMirror
      targetScale.current = 1
    }

    // Smooth scale interpolation for better performance
    currentScale.current += (targetScale.current - currentScale.current) * 0.1
    meshRef.current.scale.setScalar(currentScale.current)
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} frustumCulled castShadow>
      <primitive object={JWSTGeometries.primaryMirrorSegment} />
      <primitive object={highlighted ? Materials.highlighted : Materials.primaryMirror} />
    </mesh>
  )
}

// Primary mirror with 18 individual segments
function PrimaryMirror({
  highlighted,
  exploded,
}: Readonly<{ highlighted: boolean; exploded: number }>) {
  const groupRef = useRef<THREE.Group>(null)

  // Accurate hexagonal arrangement of 18 mirror segments matching JWST
  const mirrorSegments = useMemo(() => {
    const segments = []
    const hexRadius = 1.32 // Flat-to-flat distance for accurate hexagon packing

    // Center segment (A1)
    segments.push({ id: 0, position: [0, 0, 0], rotation: [0, 0, 0] })

    // Inner ring (6 segments: A2-A6, B1)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = Math.cos(angle) * hexRadius
      const y = Math.sin(angle) * hexRadius
      segments.push({
        id: i + 1,
        position: [x, y, 0],
        rotation: [0, 0, 0],
      })
    }

    // Outer ring (12 segments: B2-B6, C1-C6)
    // Alternating pattern for proper hexagonal packing
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + Math.PI / 6
      const radius = i % 2 === 0 ? hexRadius * Math.sqrt(3) : hexRadius * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      segments.push({
        id: i + 7,
        position: [x, y, 0],
        rotation: [0, 0, 0],
      })
    }

    return segments
  }, [])

  return (
    <group ref={groupRef}>
      {mirrorSegments.map(segment => (
        <MirrorSegment
          key={segment.id}
          position={[
            segment.position[0] + exploded * segment.position[0] * 0.3,
            segment.position[1] + exploded * segment.position[1] * 0.3,
            segment.position[2] + exploded * segment.id * 0.1,
          ]}
          rotation={segment.rotation as [number, number, number]}
          highlighted={highlighted}
          segmentId={segment.id}
        />
      ))}
    </group>
  )
}

// Secondary mirror assembly with accurate tripod positioning
function SecondaryMirror({
  highlighted,
  exploded,
}: Readonly<{ highlighted: boolean; exploded: number }>) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <group position={[0, 0, 4.5 + exploded * 2.5]}>
      {/* Secondary Mirror with enhanced shadow */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <primitive object={JWSTGeometries.secondaryMirror} />
        <primitive object={highlighted ? Materials.highlighted : Materials.secondaryMirror} />
      </mesh>

      {/* Three support struts in tripod configuration */}
      {[0, 1, 2].map(i => {
        const angle = (i * Math.PI * 2) / 3
        const strutRadius = 2.5
        const strutX = Math.cos(angle) * strutRadius
        const strutY = Math.sin(angle) * strutRadius

        // Calculate strut angle to point toward center
        const strutAngle = Math.atan2(-strutY, -strutX)

        return (
          <mesh
            key={i}
            position={[strutX, strutY, -2.25]}
            rotation={[Math.PI / 2, 0, strutAngle + Math.PI / 2]}
            castShadow
          >
            <primitive object={JWSTGeometries.supportStrut} />
            <primitive object={Materials.supportStrut} />
          </mesh>
        )
      })}
    </group>
  )
}

// Sunshield with 5 distinct layers and accurate positioning
function Sunshield({
  highlighted,
  exploded,
}: Readonly<{ highlighted: boolean; exploded: number }>) {
  const layers = 5
  const layerColors = [
    Materials.sunshieldLayer1, // Layer 1 (hottest)
    Materials.sunshieldLayer2,
    Materials.sunshieldLayer1,
    Materials.sunshieldLayer2,
    Materials.sunshieldLayer1, // Layer 5 (coldest)
  ]

  return (
    <group position={[0, -4, -1.5]} rotation={[Math.PI * 0.05, 0, 0]}>
      {Array.from({ length: layers }, (_, i) => {
        // Progressive spacing between layers (closer at bottom)
        const spacing = 0.15 + i * 0.05
        const zOffset = -i * (spacing + exploded * 0.6)
        // Each layer rotates slightly for membrane tension effect
        const layerRotation = (i * Math.PI) / 12 + Math.sin(i) * 0.1

        return (
          <mesh
            key={i}
            position={[0, 0, zOffset]}
            rotation={[0, 0, layerRotation]}
            castShadow
            receiveShadow
          >
            <primitive object={JWSTGeometries.sunshieldLayer} />
            <primitive object={highlighted ? Materials.highlighted : layerColors[i]} />
          </mesh>
        )
      })}
    </group>
  )
}

// Scientific instruments cluster - ISIM (Integrated Science Instrument Module)
function InstrumentCluster({
  highlighted,
  exploded,
}: Readonly<{ highlighted: boolean; exploded: number }>) {
  // Accurate instrument positions in ISIM module
  const instruments = [
    { name: 'NIRCam', position: [0.8, -2, 0.3], scale: 1.2 }, // Main near-infrared imager
    { name: 'NIRSpec', position: [-0.9, -2, 0.3], scale: 1.1 }, // Near-infrared spectrograph
    { name: 'MIRI', position: [0, -2.2, 0.1], scale: 1 }, // Mid-infrared instrument (coldest)
    { name: 'NIRISS', position: [0, -1.8, 0.5], scale: 0.9 }, // Near-infrared imager and slitless spectrograph
    { name: 'FGS', position: [-0.4, -1.8, 0.4], scale: 0.85 }, // Fine guidance sensor
  ]

  return (
    <group>
      {instruments.map(inst => {
        const explodedX = inst.position[0] * (1 + exploded * 0.6)
        const explodedY = inst.position[1] - exploded * 0.5
        const explodedZ = inst.position[2] + exploded * 1.2

        return (
          <group key={inst.name} position={[explodedX, explodedY, explodedZ]} scale={inst.scale}>
            <mesh castShadow receiveShadow>
              <primitive object={JWSTGeometries.instrumentHousing} />
              <primitive
                object={
                  highlighted
                    ? Materials.highlighted
                    : InstrumentMaterials[inst.name as keyof typeof InstrumentMaterials] ||
                      Materials.instrumentHousing
                }
              />
            </mesh>
            {exploded > 0.3 && (
              <Html distanceFactor={10} center>
                <div className="text-xs text-white bg-black/90 px-2 py-1 rounded pointer-events-none whitespace-nowrap font-semibold">
                  {inst.name}
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}

// Main JWST 3D model
function JWSTModel({
  selectedComponent,
  onComponentClick,
  components,
  exploded,
  perfConfig,
  onPerformanceUpdate,
}: Readonly<{
  selectedComponent: TelescopeComponent | null
  onComponentClick: (component: TelescopeComponent) => void
  components: TelescopeComponent[]
  exploded: number
  perfConfig: PerformanceConfig
  onPerformanceUpdate?: (fps: number) => void
}>) {
  const groupRef = useRef<THREE.Group>(null)
  const performanceMonitor = useRef<PerformanceMonitor | null>(null)

  // Initialize performance monitor
  performanceMonitor.current ??= new PerformanceMonitor(perfConfig, true)

  // Smooth rotation animation with performance monitoring
  useFrame(state => {
    if (groupRef.current) {
      // Smoother, more subtle breathing rotation
      const time = state.clock.elapsedTime
      const animationIntensity = perfConfig.textureResolution === 'low' ? 0.03 : 0.06

      // Gentle floating motion
      groupRef.current.rotation.y = Math.sin(time * 0.15) * animationIntensity
      groupRef.current.rotation.x = Math.cos(time * 0.12) * (animationIntensity * 0.5)

      // Very subtle vertical floating
      groupRef.current.position.y = Math.sin(time * 0.2) * 0.05
    }

    // Monitor performance
    if (performanceMonitor.current) {
      const { fps, shouldAdaptQuality } = performanceMonitor.current.update()

      if (onPerformanceUpdate) {
        onPerformanceUpdate(fps)
      }

      // Adaptive quality adjustments would go here in a real implementation
      if (shouldAdaptQuality && import.meta.env.DEV) {
        console.warn('Performance: Adaptive quality adjustment recommended', { fps })
      }
    }
  })

  // Helper to find components by ID (currently unused but may be needed for future enhancements)
  // const getComponent = (id: string) => components.find(c => c.id === id)

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Primary Mirror */}
      <PrimaryMirror highlighted={selectedComponent?.id === 'primary-mirror'} exploded={exploded} />

      {/* Secondary Mirror */}
      <SecondaryMirror
        highlighted={selectedComponent?.id === 'secondary-mirror'}
        exploded={exploded}
      />

      {/* Sunshield */}
      <Sunshield highlighted={selectedComponent?.id === 'sunshield'} exploded={exploded} />

      {/* Instruments */}
      <InstrumentCluster
        highlighted={selectedComponent?.category === 'instruments'}
        exploded={exploded}
      />

      {/* Spacecraft Bus - Main structural hub */}
      <mesh
        position={[0, -2.8 - exploded * 1.5, -0.8]}
        rotation={[0, Math.PI / 12, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={JWSTGeometries.spacecraftBus} />
        <primitive
          object={
            selectedComponent?.id === 'spacecraft-bus' ? Materials.highlighted : Materials.structure
          }
        />
      </mesh>

      {/* Solar Arrays - Two panels with proper orientation */}
      <mesh
        position={[3.5 + exploded * 2.5, -2.5, -1.2]}
        rotation={[Math.PI * 0.1, 0, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={JWSTGeometries.solarPanel} />
        <primitive
          object={
            selectedComponent?.id === 'solar-arrays' ? Materials.highlighted : Materials.solarPanel
          }
        />
      </mesh>

      <mesh
        position={[-3.5 - exploded * 2.5, -2.5, -1.2]}
        rotation={[Math.PI * 0.1, 0, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={JWSTGeometries.solarPanel} />
        <primitive
          object={
            selectedComponent?.id === 'solar-arrays' ? Materials.highlighted : Materials.solarPanel
          }
        />
      </mesh>

      {/* Interaction spheres for components */}
      {components.map(component => {
        const position = getComponentPosition(component.id, exploded)
        return (
          <mesh
            key={component.id}
            position={position}
            onClick={() => onComponentClick(component)}
            visible={false} // Invisible click targets
          >
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )
      })}
    </group>
  )
}

// Helper function to get component positions for interaction
function getComponentPosition(componentId: string, exploded: number): [number, number, number] {
  const positions: Record<string, [number, number, number]> = {
    'primary-mirror': [0, 0, 0],
    'secondary-mirror': [0, 0, 4.5 + exploded * 2.5],
    sunshield: [0, -4, -1.5 - exploded * 2],
    nircam: [0.8 * (1 + exploded * 0.6), -2 - exploded * 0.5, 0.3 + exploded * 1.2],
    nirspec: [-0.9 * (1 + exploded * 0.6), -2 - exploded * 0.5, 0.3 + exploded * 1.2],
    miri: [0, -2.2 - exploded * 0.5, 0.1 + exploded * 1.2],
    'spacecraft-bus': [0, -2.8 - exploded * 1.5, -0.8],
    'solar-arrays': [0, -2.5, -1.2],
  }
  return positions[componentId] || [0, 0, 0]
}

// Enhanced 3D controls component
function Controls3D({
  exploded,
  setExploded,
  autoRotate,
  setAutoRotate,
  viewMode,
  setViewMode,
  onReset,
  onShowDeployment,
  fps,
  perfConfig,
}: Readonly<{
  exploded: number
  setExploded: (value: number) => void
  autoRotate: boolean
  setAutoRotate: (value: boolean) => void
  viewMode: string
  setViewMode: (value: string) => void
  onReset: () => void
  onShowDeployment: () => void
  fps: number
  perfConfig: PerformanceConfig
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 right-4 z-10"
    >
      <Card className="backdrop-blur-md bg-black/20 border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Mobile-first control buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={autoRotate ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRotate(!autoRotate)}
                className="flex-1 min-w-0"
              >
                <ArrowClockwise size={16} className={autoRotate ? 'animate-spin' : ''} />
                <span className="ml-2 hidden sm:inline">Auto Rotate</span>
              </Button>

              <Button variant="outline" size="sm" onClick={onReset} className="flex-1 min-w-0">
                <HouseLine size={16} />
                <span className="ml-2 hidden sm:inline">Reset View</span>
              </Button>

              <Button
                variant={viewMode === 'exploded' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(viewMode === 'exploded' ? 'normal' : 'exploded')}
                className="flex-1 min-w-0"
              >
                <ArrowsOutSimple size={16} />
                <span className="ml-2 hidden sm:inline">Exploded</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onShowDeployment}
                className="flex-1 min-w-0 bg-linear-to-r from-blue-600 to-purple-600 border-blue-500 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <PlayCircle size={16} />
                <span className="ml-2 hidden sm:inline">Deployment</span>
              </Button>
            </div>

            {/* Exploded view slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80 flex items-center gap-1">
                  <Target size={14} />
                  Exploded View
                </span>
                <span className="text-xs text-white/60">{Math.round(exploded * 100)}%</span>
              </div>
              <Slider
                value={[exploded]}
                onValueChange={([value]) => setExploded(value)}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Performance indicator */}
            <div className="flex items-center justify-between text-xs">
              <div className="text-white/60 flex items-center gap-2">
                <span>Performance:</span>
                <span
                  className={(() => {
                    if (fps >= 30) return 'text-green-400'
                    if (fps >= 20) return 'text-yellow-400'
                    return 'text-red-400'
                  })()}
                >
                  {Math.round(fps)} FPS
                </span>
                <span className="text-white/40">
                  {perfConfig.textureResolution.charAt(0).toUpperCase() +
                    perfConfig.textureResolution.slice(1)}{' '}
                  Quality
                </span>
              </div>
            </div>

            {/* Mobile touch hint */}
            <div className="text-xs text-white/60 flex items-center gap-2 sm:hidden">
              <Hand size={14} />
              <span>Pinch to zoom • Drag to rotate • Tap components for info</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Component info panel
function ComponentInfoPanel({
  component,
  onClose,
}: Readonly<{
  component: TelescopeComponent | null
  onClose: () => void
}>) {
  if (!component) return null

  const categoryIcons = {
    optics: EyeSlash,
    instruments: Cpu,
    structure: Cube,
    power: Lightning,
  }

  const Icon = categoryIcons[component.category] || Info

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="absolute top-4 right-4 w-80 max-w-[calc(100vw-2rem)] z-20"
      >
        <Card className="backdrop-blur-md bg-black/80 border-white/20 text-white">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Icon size={20} weight="fill" className="text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white">{component.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {component.category}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/60 hover:text-white"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-white/80 leading-relaxed">{component.description}</p>

            <Separator className="bg-white/20" />

            <div className="space-y-2">
              <h4 className="font-semibold text-white">Technical Details</h4>
              <p className="text-xs text-white/70 leading-relaxed">{component.technicalDetails}</p>
            </div>

            {component.specifications && (
              <>
                <Separator className="bg-white/20" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Specifications</h4>
                  <div className="grid gap-1 text-xs">
                    {Object.entries(component.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-white/60">{key}:</span>
                        <span className="text-white/80 text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Main Telescope3D component
export function Telescope3D({
  onComponentClick,
  selectedComponent,
  components,
}: Readonly<Telescope3DProps>) {
  const [exploded, setExploded] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [viewMode, setViewMode] = useState('normal')
  const [showDeployment, setShowDeployment] = useState(false)

  // Performance optimization
  const [perfConfig] = useState<PerformanceConfig>(() => detectDeviceCapabilities())
  const performanceMonitor = useRef<PerformanceMonitor | null>(null)
  const [fps, setFps] = useState(60)
  const controlsRef = useRef<OrbitControlsType | null>(null)

  // Initialize performance monitoring
  useMemo(() => {
    performanceMonitor.current = new PerformanceMonitor(perfConfig, true)
  }, [perfConfig])

  const handleReset = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
    setExploded(0)
    setViewMode('normal')
    // Clear selection - TypeScript workaround for null
    onComponentClick({} as TelescopeComponent)
  }, [onComponentClick])

  const handleComponentClick = useCallback(
    (component: TelescopeComponent) => {
      onComponentClick(component)
    },
    [onComponentClick]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Interactive 3D Model</h2>
        <p className="text-muted-foreground mt-2">
          Explore JWST's revolutionary design in stunning detail
        </p>
      </div>

      <Card className="relative h-[70vh] overflow-hidden border-2 border-primary/20">
        <Canvas
          camera={{ position: [8, 8, 8], fov: 50 }}
          dpr={perfConfig.devicePixelRatio}
          gl={{
            antialias: perfConfig.antialiasing,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            try {
              gl.setClearColor('#000011', 1)

              // Shadow settings based on performance config
              gl.shadowMap.enabled = perfConfig.shadowQuality !== 'off'
              if (gl.shadowMap.enabled) {
                gl.shadowMap.type =
                  perfConfig.shadowQuality === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap
              }

              // Performance optimizations
              if (perfConfig.frustumCulling) {
                gl.setPixelRatio(perfConfig.devicePixelRatio)
              }

              // Add context lost/restored handlers
              gl.domElement.addEventListener('webglcontextlost', event => {
                event.preventDefault()
                console.warn('WebGL context lost, attempting to restore...')
              })

              gl.domElement.addEventListener('webglcontextrestored', () => {
                console.warn('WebGL context restored')
              })
            } catch (error) {
              console.error('WebGL setup error:', error)
            }
          }}
        >
          {/* Lighting setup for realistic space appearance */}
          <ambientLight
            intensity={SpaceEnvironment.ambientLight.intensity}
            color={SpaceEnvironment.ambientLight.color}
          />
          <directionalLight
            position={SpaceEnvironment.sunLight.position}
            intensity={SpaceEnvironment.sunLight.intensity}
            color={SpaceEnvironment.sunLight.color}
            castShadow
            shadow-mapSize={SpaceEnvironment.sunLight.shadowMapSize}
          />
          <pointLight
            position={SpaceEnvironment.fillLight.position}
            intensity={SpaceEnvironment.fillLight.intensity}
            color={SpaceEnvironment.fillLight.color}
          />
          <pointLight
            position={SpaceEnvironment.rimLight.position}
            intensity={SpaceEnvironment.rimLight.intensity}
            color={SpaceEnvironment.rimLight.color}
          />

          {/* Environment and atmosphere */}
          <Environment preset="night" />

          {/* Ground plane with reflections */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={2048}
              mixBlur={1}
              mixStrength={40}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#050505"
              metalness={0.5}
            />
          </mesh>

          {/* Main JWST Model */}
          <JWSTModel
            selectedComponent={selectedComponent}
            onComponentClick={handleComponentClick}
            components={components}
            exploded={exploded}
            perfConfig={perfConfig}
            onPerformanceUpdate={setFps}
          />

          {/* Camera controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            maxDistance={20}
            minDistance={3}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 6}
            dampingFactor={0.05}
            enableDamping={true}
            touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN,
            }}
          />
        </Canvas>

        {/* 3D Controls Overlay */}
        <Controls3D
          exploded={exploded}
          setExploded={setExploded}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onReset={handleReset}
          onShowDeployment={() => setShowDeployment(true)}
          fps={fps}
          perfConfig={perfConfig}
        />

        {/* Component Info Panel */}
        <ComponentInfoPanel
          component={selectedComponent}
          onClose={() => onComponentClick({} as TelescopeComponent)}
        />
      </Card>

      {/* Deployment Animation Modal */}
      <AnimatePresence>
        {showDeployment && <DeploymentAnimation onClose={() => setShowDeployment(false)} />}
      </AnimatePresence>
    </div>
  )
}
