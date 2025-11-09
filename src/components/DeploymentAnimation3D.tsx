import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { JWSTGeometries } from '@/lib/jwst-geometries'
import { JWSTMaterials, SpaceEnvironment } from '@/lib/jwst-materials'
import {
  CalendarBlank,
  Compass,
  House,
  Pause,
  Play,
  Rewind,
  SkipForward,
} from '@phosphor-icons/react'
import { Environment, Html, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface DeploymentAnimationProps {
  onClose: () => void
}

// Deployment timeline - 14 days of JWST unfolding
const DEPLOYMENT_TIMELINE = [
  {
    day: 0,
    time: '00:00:00',
    event: 'Launch',
    description: 'JWST launches from French Guiana aboard Ariane 5 rocket',
    deploymentStage: 'launch',
  },
  {
    day: 0,
    time: '00:27:00',
    event: 'Spacecraft Separation',
    description: 'JWST separates from Ariane 5 upper stage',
    deploymentStage: 'separation',
  },
  {
    day: 0,
    time: '12:30:00',
    event: 'Solar Array Deployment',
    description: 'Single solar array unfolds to power the observatory',
    deploymentStage: 'solar_array',
  },
  {
    day: 1,
    time: '00:00:00',
    event: 'Mid-Course Correction 1A',
    description: 'First trajectory adjustment towards L2 Lagrange point',
    deploymentStage: 'solar_array',
  },
  {
    day: 3,
    time: '00:00:00',
    event: 'Sunshield Pallet Drop',
    description: 'Forward and aft sunshield pallets lowered',
    deploymentStage: 'sunshield_pallet',
  },
  {
    day: 5,
    time: '00:00:00',
    event: 'Sunshield Layer Separation',
    description: 'Five sunshield layers begin separating',
    deploymentStage: 'sunshield_separation',
  },
  {
    day: 8,
    time: '00:00:00',
    event: 'Sunshield Tensioning',
    description: 'All five layers stretched tight into diamond shape',
    deploymentStage: 'sunshield_tensioning',
  },
  {
    day: 10,
    time: '00:00:00',
    event: 'Secondary Mirror Deployment',
    description: 'Secondary mirror extends on tripod support structure',
    deploymentStage: 'secondary_mirror',
  },
  {
    day: 12,
    time: '00:00:00',
    event: 'Primary Mirror Wing Deployment',
    description: 'Left and right mirror wings unfold into hexagonal shape',
    deploymentStage: 'primary_mirror_wings',
  },
  {
    day: 14,
    time: '00:00:00',
    event: 'Deployment Complete',
    description: 'JWST fully deployed and ready for commissioning',
    deploymentStage: 'complete',
  },
] as const

type DeploymentStage = (typeof DEPLOYMENT_TIMELINE)[number]['deploymentStage']

interface DeploymentState {
  stage: DeploymentStage
  progress: number // 0-1 within the current stage
  solarArrayAngle: number
  sunshieldLayers: number[] // Y positions for each layer
  sunshieldTension: number // 0-1, how stretched the layers are
  secondaryMirrorExtension: number // 0-1, how far extended
  mirrorWingsRotation: number[] // Left and right wing rotations
  overallProgress: number // 0-1 for entire deployment
}

const INITIAL_DEPLOYMENT_STATE: DeploymentState = {
  stage: 'launch',
  progress: 0,
  solarArrayAngle: 90, // Folded flat against body
  sunshieldLayers: [0, 0, 0, 0, 0], // All layers stacked together
  sunshieldTension: 0, // Fully compressed
  secondaryMirrorExtension: 0, // Retracted
  mirrorWingsRotation: [90, -90], // Folded inward against center
  overallProgress: 0,
}

// 3D JWST Model with deployment animations
function DeployingJWST({ deploymentState }: Readonly<{ deploymentState: DeploymentState }>) {
  const groupRef = useRef<THREE.Group>(null)
  const solarArrayRef = useRef<THREE.Group>(null)
  const secondaryMirrorRef = useRef<THREE.Group>(null)
  const leftWingRef = useRef<THREE.Group>(null)
  const rightWingRef = useRef<THREE.Group>(null)

  // Animate deployment based on current state with smooth interpolation
  useFrame(state => {
    const time = state.clock.elapsedTime

    // Gentle observatory rotation for visual interest
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.08) * 0.15
      groupRef.current.position.y = Math.sin(time * 0.1) * 0.1
    }

    // Solar array deployment with smooth rotation
    if (solarArrayRef.current) {
      const targetRotation = THREE.MathUtils.degToRad(deploymentState.solarArrayAngle)
      solarArrayRef.current.rotation.z = THREE.MathUtils.lerp(
        solarArrayRef.current.rotation.z,
        targetRotation,
        0.05
      )
    }

    // Secondary mirror extension with smooth interpolation
    if (secondaryMirrorRef.current) {
      const targetZ = 3 + deploymentState.secondaryMirrorExtension * 1.5
      secondaryMirrorRef.current.position.z = THREE.MathUtils.lerp(
        secondaryMirrorRef.current.position.z,
        targetZ,
        0.05
      )
    }

    // Mirror wing deployment with smooth rotation
    if (leftWingRef.current) {
      const targetRotation = THREE.MathUtils.degToRad(deploymentState.mirrorWingsRotation[0])
      leftWingRef.current.rotation.y = THREE.MathUtils.lerp(
        leftWingRef.current.rotation.y,
        targetRotation,
        0.05
      )
    }
    if (rightWingRef.current) {
      const targetRotation = THREE.MathUtils.degToRad(deploymentState.mirrorWingsRotation[1])
      rightWingRef.current.rotation.y = THREE.MathUtils.lerp(
        rightWingRef.current.rotation.y,
        targetRotation,
        0.05
      )
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Observatory Structure - Built from back to front */}
      <group position={[0, 0, 0]}>
        {/* LAYER 1: Spacecraft Bus (back of telescope) */}
        <group position={[0, -1.5, -2]}>
          <mesh castShadow>
            <boxGeometry args={[2, 1.5, 1.2]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Add detail to spacecraft bus */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 6]} />
            <meshStandardMaterial color="#34495e" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>

        {/* LAYER 2: Instrument Section (ISIM - behind mirror) */}
        <group position={[0, -0.8, -0.8]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 1, 0.6]} />
            <meshStandardMaterial
              color="#1a1a2e"
              metalness={0.6}
              roughness={0.5}
              emissive="#0f3460"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Instrument details */}
          {[
            [-0.4, 0, 0.4],
            [0.4, 0, 0.4],
            [0, -0.3, 0.4],
          ].map((pos, i) => (
            <mesh key={`instrument-${i}`} position={pos as [number, number, number]}>
              <boxGeometry args={[0.3, 0.3, 0.2]} />
              <meshStandardMaterial
                color="#16213e"
                metalness={0.5}
                roughness={0.6}
                emissive="#1e88e5"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>

        {/* LAYER 3: Backplane Structure (connects bus to mirror) */}
        <group position={[0, -0.5, -0.3]}>
          <mesh castShadow>
            <boxGeometry args={[4, 3.5, 0.15]} />
            <meshStandardMaterial color="#34495e" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Backplane support struts */}
          {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
            <mesh key={`backplane-strut-${i}`} position={[x, 0, -0.1]}>
              <boxGeometry args={[0.08, 3.5, 0.08]} />
              <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* LAYER 4: Primary Mirror Assembly */}
        <group position={[0, 0, 0]}>
          {/* Center mirror segment */}
          <mesh position={[0, 0, 0]} castShadow>
            <primitive object={JWSTGeometries.primaryMirrorSegment} />
            <primitive object={JWSTMaterials.primaryMirror} />
          </mesh>

          {/* Inner ring - 6 segments surrounding center */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i * Math.PI) / 3
            const hexRadius = 1.32
            return (
              <mesh
                key={`center-ring-${i}`}
                position={[Math.cos(angle) * hexRadius, Math.sin(angle) * hexRadius, 0]}
                castShadow
              >
                <primitive object={JWSTGeometries.primaryMirrorSegment} />
                <primitive object={JWSTMaterials.primaryMirror} />
              </mesh>
            )
          })}

          {/* Left Mirror Wing - 6 segments (folds out) */}
          <group ref={leftWingRef} position={[-2.64, 0, 0]}>
            {/* Hinge mechanism visualization */}
            <mesh position={[1.32, 0, -0.2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.2} />
            </mesh>
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i * Math.PI) / 3
              const hexRadius = 1.32
              return (
                <mesh
                  key={`left-wing-${i}`}
                  position={[Math.cos(angle) * hexRadius, Math.sin(angle) * hexRadius, 0]}
                  castShadow
                >
                  <primitive object={JWSTGeometries.primaryMirrorSegment} />
                  <primitive object={JWSTMaterials.primaryMirror} />
                </mesh>
              )
            })}
          </group>

          {/* Right Mirror Wing - 6 segments (folds out) */}
          <group ref={rightWingRef} position={[2.64, 0, 0]}>
            {/* Hinge mechanism visualization */}
            <mesh position={[-1.32, 0, -0.2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.2} />
            </mesh>
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i * Math.PI) / 3
              const hexRadius = 1.32
              return (
                <mesh
                  key={`right-wing-${i}`}
                  position={[Math.cos(angle) * hexRadius, Math.sin(angle) * hexRadius, 0]}
                  castShadow
                >
                  <primitive object={JWSTGeometries.primaryMirrorSegment} />
                  <primitive object={JWSTMaterials.primaryMirror} />
                </mesh>
              )
            })}
          </group>
        </group>

        {/* LAYER 5: Secondary Mirror & Tripod (extends forward) */}
        <group ref={secondaryMirrorRef} position={[0, 0, 3]}>
          {/* Secondary mirror */}
          <mesh castShadow>
            <primitive object={JWSTGeometries.secondaryMirror} />
            <primitive object={JWSTMaterials.secondaryMirror} />
          </mesh>
          {/* Support tripod struts */}
          {Array.from({ length: 3 }, (_, i) => {
            const angle = (i * Math.PI * 2) / 3
            const strutRadius = 2.5
            const strutX = Math.cos(angle) * strutRadius
            const strutY = Math.sin(angle) * strutRadius
            const strutAngle = Math.atan2(-strutY, -strutX)

            return (
              <group key={`strut-group-${i}`}>
                {/* Main strut */}
                <mesh
                  position={[strutX, strutY, -1.5]}
                  rotation={[Math.PI / 2, 0, strutAngle + Math.PI / 2]}
                  castShadow
                >
                  <cylinderGeometry args={[0.03, 0.03, 3.5, 8]} />
                  <meshStandardMaterial color="#95a5a6" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Strut connection point */}
                <mesh position={[strutX, strutY, 0.1]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            )
          })}
        </group>

        {/* LAYER 6: Solar Array (side mounted) */}
        <group ref={solarArrayRef} position={[3.5, -1.2, -1]} rotation={[0, 0, Math.PI * 0.5]}>
          <mesh castShadow>
            <primitive object={JWSTGeometries.solarPanel} />
            <primitive object={JWSTMaterials.solarPanel} />
          </mesh>
          {/* Solar array mounting arm */}
          <mesh position={[-1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
            <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* LAYER 7: Sunshield Assembly (largest component, deploys downward) */}
        <group position={[0, -3, -1.5]}>
          {/* Sunshield support frame */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2, 0.1, 0.1]} />
            <meshStandardMaterial color="#34495e" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[2, 0.1, 0.1]} />
            <meshStandardMaterial color="#34495e" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Sunshield layers with proper stacking */}
          {deploymentState.sunshieldLayers.map((yOffset, i) => {
            const tension = deploymentState.sunshieldTension
            const scaleX = 1 + tension * 0.8
            const scaleY = 1 + tension * 0.6
            const layerRotation = (i * Math.PI) / 20 + Math.sin(i) * 0.05

            return (
              <mesh
                key={`sunshield-layer-${i}`}
                position={[0, yOffset, -i * 0.15]}
                scale={[scaleX, scaleY, 1]}
                rotation={[0, 0, layerRotation]}
                castShadow
                receiveShadow
              >
                <primitive object={JWSTGeometries.sunshieldLayer} />
                <primitive
                  object={
                    i % 2 === 0 ? JWSTMaterials.sunshieldLayer1 : JWSTMaterials.sunshieldLayer2
                  }
                />
              </mesh>
            )
          })}
        </group>
      </group>

      {/* Deployment Status Display */}
      <Html position={[0, 5, 0]} center>
        <div className="bg-black/80 text-white p-3 rounded-lg text-center backdrop-blur-sm">
          <div className="text-sm font-medium">
            Day {Math.floor(deploymentState.overallProgress * 14)}
          </div>
          <div className="text-xs text-green-400 mt-1">
            {deploymentState.stage.replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </Html>
    </group>
  )
}

export function DeploymentAnimation({ onClose }: DeploymentAnimationProps) {
  const [deploymentState, setDeploymentState] = useState<DeploymentState>(INITIAL_DEPLOYMENT_STATE)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Calculate deployment state based on overall progress
  const updateDeploymentState = useCallback((progress: number) => {
    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress))

    const currentEvent =
      DEPLOYMENT_TIMELINE[Math.floor(progress * (DEPLOYMENT_TIMELINE.length - 1))]
    const stage = currentEvent.deploymentStage

    let solarArrayAngle = -90
    let sunshieldLayers = [0, 0, 0, 0, 0]
    let sunshieldTension = 0
    let secondaryMirrorExtension = 0
    let mirrorWingsRotation = [90, -90]

    // PHASE 1: Solar array deployment (Day 0.5) - Unfold from side
    if (progress > 0.03) {
      const solarProgress = Math.min(1, (progress - 0.03) / 0.08)
      const easedProgress = solarProgress * solarProgress * (3 - 2 * solarProgress)
      solarArrayAngle = 90 - easedProgress * 90 // Rotate from 90° (folded) to 0° (deployed)
    }

    // PHASE 2: Sunshield pallet release (Day 3) - Begin lowering
    if (progress > 0.21) {
      const palletProgress = Math.min(1, (progress - 0.21) / 0.1)
      const easedProgress = palletProgress * palletProgress * (3 - 2 * palletProgress)
      // All layers drop together initially
      sunshieldLayers = sunshieldLayers.map(() => -easedProgress * 0.6)
    }

    // PHASE 3: Sunshield layer separation (Day 5-7) - Layers separate vertically
    if (progress > 0.36) {
      const separationProgress = Math.min(1, (progress - 0.36) / 0.18)
      const easedProgress = separationProgress * separationProgress * (3 - 2 * separationProgress)
      // Spread layers vertically with increasing spacing
      sunshieldLayers = sunshieldLayers.map((_, i) => {
        return -0.6 - i * easedProgress * 0.35
      })
    }

    // PHASE 4: Sunshield tensioning (Day 8-9) - Stretch into diamond/kite shape
    if (progress > 0.57) {
      const tensionProgress = Math.min(1, (progress - 0.57) / 0.15)
      const easedProgress = tensionProgress * tensionProgress * (3 - 2 * tensionProgress)
      sunshieldTension = easedProgress // Gradually stretch to full size
    }

    // PHASE 5: Secondary mirror deployment (Day 10-11) - Extend tripod forward
    if (progress > 0.71) {
      const mirrorProgress = Math.min(1, (progress - 0.71) / 0.14)
      const easedProgress = mirrorProgress * mirrorProgress * (3 - 2 * mirrorProgress)
      secondaryMirrorExtension = easedProgress // Extend from 0 to 1
    }

    // PHASE 6: Primary mirror wings (Day 12-14) - Unfold side panels
    if (progress > 0.86) {
      const wingsProgress = Math.min(1, (progress - 0.86) / 0.14)
      const easedProgress = wingsProgress * wingsProgress * (3 - 2 * wingsProgress)
      // Rotate wings from folded (90°, -90°) to flat (0°, 0°)
      mirrorWingsRotation = [
        90 - easedProgress * 90, // Left wing: 90° → 0°
        -90 + easedProgress * 90, // Right wing: -90° → 0°
      ]
    }

    setDeploymentState({
      stage,
      progress: progress % (1 / (DEPLOYMENT_TIMELINE.length - 1)),
      solarArrayAngle,
      sunshieldLayers,
      sunshieldTension,
      secondaryMirrorExtension,
      mirrorWingsRotation,
      overallProgress: progress,
    })

    // Update current event
    setCurrentEventIndex(Math.floor(progress * (DEPLOYMENT_TIMELINE.length - 1)))
  }, [])

  // Animation playback
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setDeploymentState(prev => {
          const newProgress = prev.overallProgress + (playbackSpeed * 0.01) / 14 // 1% per step
          if (newProgress >= 1) {
            setIsPlaying(false)
            return { ...prev, overallProgress: 1 }
          }
          updateDeploymentState(newProgress)
          return prev
        })
      }, 100) // 10fps animation
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, updateDeploymentState])

  const currentEvent = DEPLOYMENT_TIMELINE[currentEventIndex]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex"
    >
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [8, 4, 12], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: false }}
        >
          {/* Enhanced multi-angle lighting for better structure visibility */}
          <ambientLight
            color={SpaceEnvironment.ambientLight.color}
            intensity={SpaceEnvironment.ambientLight.intensity * 2.5}
          />

          {/* Primary sun light - stronger and from better angle */}
          <directionalLight
            color={SpaceEnvironment.sunLight.color}
            intensity={SpaceEnvironment.sunLight.intensity * 2}
            position={[12, 10, 8]}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          {/* Fill light from left side */}
          <pointLight color="#4a90e2" intensity={1} position={[-10, 2, 8]} />

          {/* Back light for depth and rim */}
          <pointLight color="#1e3a8a" intensity={0.8} position={[0, -6, -10]} />

          {/* Front light for better component visibility */}
          <pointLight color="#ffffff" intensity={0.6} position={[0, 2, 15]} />

          {/* Accent light from below to show sunshield layers */}
          <spotLight
            color="#60a5fa"
            intensity={0.7}
            position={[0, -10, 0]}
            angle={0.9}
            penumbra={1}
          />

          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <DeployingJWST deploymentState={deploymentState} />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
            autoRotate={false}
          />

          <Environment preset="night" />
        </Canvas>

        {/* Close Button */}
        <Button
          onClick={onClose}
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 bg-black/50 border-white/20 text-white hover:bg-white/10"
        >
          <House size={16} className="mr-2" />
          Back to Explorer
        </Button>
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-gray-900 p-6 overflow-y-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CalendarBlank size={20} />
              JWST Deployment Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Day 0</span>
                <span>Day 14</span>
              </div>
              <Progress value={deploymentState.overallProgress * 100} className="h-2" />
              <div className="text-center text-sm text-white">
                Day {(deploymentState.overallProgress * 14).toFixed(1)}
              </div>
            </div>

            {/* Manual Progress Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Manual Control</label>
              <Slider
                value={[deploymentState.overallProgress * 100]}
                onValueChange={([value]) => {
                  setIsPlaying(false)
                  updateDeploymentState(value / 100)
                }}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Playback Controls */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsPlaying(false)
                  updateDeploymentState(0)
                }}
                size="sm"
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                title="Reset to beginning"
              >
                <Rewind size={16} />
              </Button>

              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                title={isPlaying ? 'Pause animation' : 'Play animation'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span className="ml-2">{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>

              <Button
                onClick={() => {
                  setIsPlaying(false)
                  updateDeploymentState(1)
                }}
                size="sm"
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                title="Skip to end"
              >
                <SkipForward size={16} />
              </Button>
            </div>

            {/* Quick Jump Buttons */}
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-400 w-full mb-1">Quick Jump:</span>
              {[
                { label: 'Solar', progress: 0.08 },
                { label: 'Sunshield', progress: 0.36 },
                { label: 'Tension', progress: 0.65 },
                { label: 'Mirror', progress: 0.86 },
              ].map(({ label, progress: jumpProgress }) => (
                <Button
                  key={label}
                  onClick={() => {
                    setIsPlaying(false)
                    updateDeploymentState(jumpProgress)
                  }}
                  size="sm"
                  variant="ghost"
                  className="flex-1 min-w-[60px] bg-gray-700/50 hover:bg-gray-600 text-white text-xs h-7"
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Playback Speed: {playbackSpeed}x
              </label>
              <Slider
                value={[playbackSpeed]}
                onValueChange={([value]) => setPlaybackSpeed(value)}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Current Event */}
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-blue-400 mb-1">Current Event</div>
              <div className="text-white font-semibold">{currentEvent.event}</div>
              <div className="text-xs text-gray-400 mt-1">
                Day {currentEvent.day} - {currentEvent.time}
              </div>
              <div className="text-sm text-gray-300 mt-2">{currentEvent.description}</div>
            </div>

            {/* Event Timeline */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <div className="text-sm font-medium text-gray-300 mb-2">Timeline Events</div>
              {DEPLOYMENT_TIMELINE.map((event, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsPlaying(false)
                    updateDeploymentState(index / (DEPLOYMENT_TIMELINE.length - 1))
                  }}
                  className={`w-full text-left p-2 rounded text-xs transition-colors ${
                    index === currentEventIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{event.event}</div>
                  <div className="text-xs opacity-75">
                    Day {event.day} - {event.time}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mini-Map Orientation Helper */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 w-32 h-32 bg-gray-900/90 rounded-lg border border-gray-700 backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute top-1 left-1 right-1 flex items-center justify-center gap-1 z-10">
              <Compass size={12} weight="fill" className="text-blue-400" />
              <span className="text-[10px] text-gray-300 font-medium">View</span>
            </div>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 50 }}
              gl={{ alpha: true }}
              style={{ background: 'transparent' }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 5, 5]} intensity={0.8} />

              {/* Simplified telescope representation */}
              <group rotation={[0, deploymentState.overallProgress * Math.PI * 2, 0]}>
                {/* Main mirror (golden hexagon) */}
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.8, 0.8, 0.1, 6]} />
                  <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Sunshield (silver diamond) */}
                <mesh position={[0, -1.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
                  <boxGeometry args={[1.2, 1.2, 0.05]} />
                  <meshStandardMaterial
                    color={deploymentState.overallProgress > 0.5 ? '#C0C0C0' : '#888888'}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>

                {/* Deployment indicator (glowing point) */}
                {deploymentState.overallProgress < 1 && (
                  <mesh
                    position={[
                      Math.sin(deploymentState.overallProgress * Math.PI * 8) * 1.5,
                      0,
                      Math.cos(deploymentState.overallProgress * Math.PI * 8) * 1.5,
                    ]}
                  >
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="#60A5FA" />
                  </mesh>
                )}
              </group>

              {/* Direction indicators */}
              <Html position={[0, 2, 0]} center style={{ pointerEvents: 'none' }}>
                <div className="text-[8px] text-blue-400 font-bold">TOP</div>
              </Html>
            </Canvas>

            {/* Progress ring overlay */}
            <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="60" fill="none" stroke="#374151" strokeWidth="2" />
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - deploymentState.overallProgress)}`}
                strokeLinecap="round"
                transform="rotate(-90 64 64)"
              />
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
