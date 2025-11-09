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
  ArrowsClockwise,
  ArrowsOut,
  Cpu,
  Cube,
  Eye,
  HandTap,
  House,
  Info,
  Lightning,
  Play,
  Target,
} from '@phosphor-icons/react'
import { Environment, Html, MeshReflectorMaterial, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { DeploymentAnimation } from './DeploymentAnimation3D'

interface Telescope3DProps {
  onComponentClick: (component: TelescopeComponent) => void
  selectedComponent: TelescopeComponent | null
  components: TelescopeComponent[]
}

interface MirrorSegmentProps {
  position: [number, number, number]
  rotation: [number, number, number]
  highlighted: boolean
  segmentId: number
}

// Use enhanced materials from the materials library
const Materials = JWSTMaterials

// Individual mirror segment component
// Optimized mirror segment component with LOD
function MirrorSegment({
  position,
  rotation,
  highlighted,
  segmentId: _segmentId,
}: MirrorSegmentProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(state => {
    if (!meshRef.current) return

    // Material and animation updates
    if (highlighted) {
      meshRef.current.material = Materials.highlighted
      // Optimized animation for performance
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03
      meshRef.current.scale.setScalar(scale)
    } else {
      meshRef.current.material = Materials.primaryMirror
      meshRef.current.scale.setScalar(1)
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} frustumCulled>
      <primitive object={JWSTGeometries.primaryMirrorSegment} />
      <primitive object={highlighted ? Materials.highlighted : Materials.primaryMirror} />
    </mesh>
  )
}

// Primary mirror with 18 individual segments
function PrimaryMirror({ highlighted, exploded }: { highlighted: boolean; exploded: number }) {
  const groupRef = useRef<THREE.Group>(null)

  // Hexagonal arrangement of mirror segments
  const mirrorSegments = useMemo(() => {
    const segments = []
    // Center segment
    segments.push({ id: 0, position: [0, 0, 0], rotation: [0, 0, 0] })

    // Inner ring (6 segments)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = Math.cos(angle) * 1.4
      const y = Math.sin(angle) * 1.4
      segments.push({
        id: i + 1,
        position: [x, y, 0],
        rotation: [0, 0, angle],
      })
    }

    // Outer ring (12 segments)
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6
      const radius = i % 2 === 0 ? 2.8 : 2.4
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      segments.push({
        id: i + 7,
        position: [x, y, 0],
        rotation: [0, 0, angle],
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

// Secondary mirror assembly
function SecondaryMirror({ highlighted, exploded }: { highlighted: boolean; exploded: number }) {
  return (
    <group position={[0, 0, 4 + exploded * 2]}>
      {/* Mirror */}
      <mesh>
        <primitive object={JWSTGeometries.secondaryMirror} />
        <primitive object={highlighted ? Materials.highlighted : Materials.secondaryMirror} />
      </mesh>

      {/* Support struts */}
      {[0, 1, 2].map(i => (
        <mesh
          key={i}
          position={[Math.cos((i * Math.PI * 2) / 3) * 2, Math.sin((i * Math.PI * 2) / 3) * 2, -2]}
          rotation={[0, 0, (i * Math.PI * 2) / 3]}
        >
          <primitive object={JWSTGeometries.supportStrut} />
          <primitive object={Materials.supportStrut} />
        </mesh>
      ))}
    </group>
  )
}

// Sunshield layers
function Sunshield({ highlighted, exploded }: { highlighted: boolean; exploded: number }) {
  const layers = 5

  return (
    <group position={[0, -3, -2]}>
      {Array.from({ length: layers }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0, -i * (0.2 + exploded * 0.5)]}
          rotation={[0, 0, (i * Math.PI) / 8]} // Slight rotation for each layer
        >
          <primitive object={JWSTGeometries.sunshieldLayer} />
          <primitive
            object={
              highlighted
                ? Materials.highlighted
                : i % 2 === 0
                  ? Materials.sunshieldLayer1
                  : Materials.sunshieldLayer2
            }
          />
        </mesh>
      ))}
    </group>
  )
}

// Scientific instruments cluster
function InstrumentCluster({ highlighted, exploded }: { highlighted: boolean; exploded: number }) {
  const instruments = [
    { name: 'NIRCam', position: [0, -1.5, 0.5], color: '#FF6B6B' },
    { name: 'NIRSpec', position: [-1.2, -1.5, 0.5], color: '#4ECDC4' },
    { name: 'MIRI', position: [1.2, -1.5, 0.5], color: '#45B7D1' },
    { name: 'NIRISS', position: [0.6, -1.5, 0.5], color: '#96CEB4' },
    { name: 'FGS', position: [-0.6, -1.5, 0.5], color: '#FFEAA7' },
  ]

  return (
    <group>
      {instruments.map(inst => (
        <group
          key={inst.name}
          position={[
            inst.position[0] * (1 + exploded * 0.5),
            inst.position[1],
            inst.position[2] + exploded * 1,
          ]}
        >
          <mesh>
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
          <Html distanceFactor={10}>
            <div className="text-xs text-white bg-black/80 px-2 py-1 rounded pointer-events-none">
              {inst.name}
            </div>
          </Html>
        </group>
      ))}
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
}: {
  selectedComponent: TelescopeComponent | null
  onComponentClick: (component: TelescopeComponent) => void
  components: TelescopeComponent[]
  exploded: number
  perfConfig: PerformanceConfig
  onPerformanceUpdate?: (fps: number) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const performanceMonitor = useRef<PerformanceMonitor>()

  // Initialize performance monitor
  if (!performanceMonitor.current) {
    performanceMonitor.current = new PerformanceMonitor(perfConfig, true)
  }

  // Rotation animation with performance monitoring
  useFrame(state => {
    if (groupRef.current) {
      // Reduce animation complexity based on performance
      const animationIntensity = perfConfig.textureResolution === 'low' ? 0.05 : 0.1
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * animationIntensity
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

      {/* Spacecraft Bus */}
      <mesh position={[0, -2 - exploded * 1, -1]}>
        <primitive object={JWSTGeometries.spacecraftBus} />
        <primitive
          object={
            selectedComponent?.id === 'spacecraft-bus' ? Materials.highlighted : Materials.structure
          }
        />
      </mesh>

      {/* Solar Arrays */}
      <mesh position={[3 + exploded * 2, -2, -1]} rotation={[0, 0, Math.PI / 2]}>
        <primitive object={JWSTGeometries.solarPanel} />
        <primitive
          object={
            selectedComponent?.id === 'solar-arrays' ? Materials.highlighted : Materials.solarPanel
          }
        />
      </mesh>

      <mesh position={[-3 - exploded * 2, -2, -1]} rotation={[0, 0, Math.PI / 2]}>
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

// Helper function to get component positions
function getComponentPosition(componentId: string, exploded: number): [number, number, number] {
  const positions: Record<string, [number, number, number]> = {
    'primary-mirror': [0, 0, 0],
    'secondary-mirror': [0, 0, 4 + exploded * 2],
    sunshield: [0, -3, -2 - exploded * 2],
    nircam: [0, -1.5, 0.5 + exploded * 1],
    nirspec: [-1.2 * (1 + exploded * 0.5), -1.5, 0.5 + exploded * 1],
    miri: [1.2 * (1 + exploded * 0.5), -1.5, 0.5 + exploded * 1],
    'spacecraft-bus': [0, -2 - exploded * 1, -1],
    'solar-arrays': [0, -2, -1],
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
}: {
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
}) {
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
                <ArrowsClockwise size={16} className={autoRotate ? 'animate-spin' : ''} />
                <span className="ml-2 hidden sm:inline">Auto Rotate</span>
              </Button>

              <Button variant="outline" size="sm" onClick={onReset} className="flex-1 min-w-0">
                <House size={16} />
                <span className="ml-2 hidden sm:inline">Reset View</span>
              </Button>

              <Button
                variant={viewMode === 'exploded' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(viewMode === 'exploded' ? 'normal' : 'exploded')}
                className="flex-1 min-w-0"
              >
                <ArrowsOut size={16} />
                <span className="ml-2 hidden sm:inline">Exploded</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onShowDeployment}
                className="flex-1 min-w-0 bg-linear-to-r from-blue-600 to-purple-600 border-blue-500 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <Play size={16} />
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
                  className={
                    fps >= 30 ? 'text-green-400' : fps >= 20 ? 'text-yellow-400' : 'text-red-400'
                  }
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
              <HandTap size={14} />
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
}: {
  component: TelescopeComponent | null
  onClose: () => void
}) {
  if (!component) return null

  const categoryIcons = {
    optics: Eye,
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
export function Telescope3D({ onComponentClick, selectedComponent, components }: Telescope3DProps) {
  const [exploded, setExploded] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [viewMode, setViewMode] = useState('normal')
  const [showDeployment, setShowDeployment] = useState(false)

  // Performance optimization
  const [perfConfig, setPerfConfig] = useState<PerformanceConfig>(() => detectDeviceCapabilities())
  const performanceMonitor = useRef<PerformanceMonitor>()
  const [fps, setFps] = useState(60)
  const controlsRef = useRef<unknown>()

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
            pixelRatio: perfConfig.devicePixelRatio,
          }}
          onCreated={({ gl }) => {
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
