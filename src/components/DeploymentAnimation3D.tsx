import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { JWSTGeometries } from '@/lib/jwst-geometries'
import { JWSTMaterials, SpaceEnvironment } from '@/lib/jwst-materials'
import { Calendar, House, Pause, Play, Rewind, SkipForward } from '@phosphor-icons/react'
import { Environment, Html, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion } from 'framer-motion'
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
  solarArrayAngle: -90, // Folded position
  sunshieldLayers: [0, 0, 0, 0, 0], // All layers stacked
  sunshieldTension: 0,
  secondaryMirrorExtension: 0,
  mirrorWingsRotation: [90, -90], // Folded inward
  overallProgress: 0,
}

// 3D JWST Model with deployment animations
function DeployingJWST({ deploymentState }: { deploymentState: DeploymentState }) {
  const groupRef = useRef<THREE.Group>(null)
  const solarArrayRef = useRef<THREE.Group>(null)
  const secondaryMirrorRef = useRef<THREE.Group>(null)
  const leftWingRef = useRef<THREE.Group>(null)
  const rightWingRef = useRef<THREE.Group>(null)

  // Animate deployment based on current state
  useFrame(state => {
    const time = state.clock.elapsedTime

    // Gentle observatory rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.2
    }

    // Solar array deployment
    if (solarArrayRef.current) {
      solarArrayRef.current.rotation.z = THREE.MathUtils.degToRad(deploymentState.solarArrayAngle)
    }

    // Secondary mirror extension
    if (secondaryMirrorRef.current) {
      const targetZ = 3 + deploymentState.secondaryMirrorExtension * 2
      secondaryMirrorRef.current.position.z = THREE.MathUtils.lerp(
        secondaryMirrorRef.current.position.z,
        targetZ,
        0.02
      )
    }

    // Mirror wing deployment
    if (leftWingRef.current) {
      leftWingRef.current.rotation.y = THREE.MathUtils.degToRad(
        deploymentState.mirrorWingsRotation[0]
      )
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.y = THREE.MathUtils.degToRad(
        deploymentState.mirrorWingsRotation[1]
      )
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Observatory Structure */}
      <group position={[0, 0, 0]}>
        {/* Primary Mirror - Center Section (always visible) */}
        <group position={[0, 0, 0]}>
          {/* Central mirror segments (fixed) */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 1.2
            return (
              <mesh
                key={`center-${i}`}
                position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                rotation={[0, 0, angle]}
                geometry={JWSTGeometries.hexagonMirror}
                material={JWSTMaterials.primaryMirror}
              />
            )
          })}

          {/* Center mirror segment */}
          <mesh
            position={[0, 0, 0]}
            geometry={JWSTGeometries.hexagonMirror}
            material={JWSTMaterials.primaryMirror}
          />
        </group>

        {/* Left Mirror Wing */}
        <group ref={leftWingRef} position={[-2.4, 0, 0]}>
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 1.2
            return (
              <mesh
                key={`left-${i}`}
                position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                rotation={[0, 0, angle]}
                geometry={JWSTGeometries.hexagonMirror}
                material={JWSTMaterials.primaryMirror}
              />
            )
          })}
        </group>

        {/* Right Mirror Wing */}
        <group ref={rightWingRef} position={[2.4, 0, 0]}>
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 1.2
            return (
              <mesh
                key={`right-${i}`}
                position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                rotation={[0, 0, angle]}
                geometry={JWSTGeometries.hexagonMirror}
                material={JWSTMaterials.primaryMirror}
              />
            )
          })}
        </group>

        {/* Secondary Mirror */}
        <group ref={secondaryMirrorRef} position={[0, 0, 3]}>
          <mesh
            geometry={JWSTGeometries.secondaryMirror}
            material={JWSTMaterials.secondaryMirror}
          />
          {/* Support struts */}
          {Array.from({ length: 3 }, (_, i) => {
            const angle = (i / 3) * Math.PI * 2 + Math.PI / 6
            return (
              <mesh
                key={`strut-${i}`}
                position={[Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, -1.5]}
                rotation={[0, 0, angle]}
                geometry={JWSTGeometries.supportStrut}
                material={JWSTMaterials.structure}
              />
            )
          })}
        </group>

        {/* Solar Array */}
        <group ref={solarArrayRef} position={[0, -4, -2]}>
          <mesh geometry={JWSTGeometries.solarArray} material={JWSTMaterials.solarArray} />
        </group>

        {/* Sunshield Layers */}
        <group position={[0, 0, -4]}>
          {deploymentState.sunshieldLayers.map((yOffset, i) => {
            const tension = deploymentState.sunshieldTension
            const scaleX = 1 + tension * 0.5
            const scaleY = 1 + tension * 0.3

            return (
              <mesh
                key={`sunshield-${i}`}
                position={[0, yOffset, -i * 0.1]}
                scale={[scaleX, scaleY, 1]}
                geometry={JWSTGeometries.sunshieldLayer}
                material={
                  i === 0
                    ? JWSTMaterials.sunshieldLayer1
                    : i === 1
                      ? JWSTMaterials.sunshieldLayer2
                      : i === 2
                        ? JWSTMaterials.sunshieldLayer3
                        : i === 3
                          ? JWSTMaterials.sunshieldLayer4
                          : JWSTMaterials.sunshieldLayer5
                }
              />
            )
          })}
        </group>

        {/* Spacecraft Bus */}
        <mesh
          position={[0, 0, -6]}
          geometry={JWSTGeometries.spacecraftBus}
          material={JWSTMaterials.structure}
        />
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
  const intervalRef = useRef<NodeJS.Timeout>()

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

    // Solar array deployment (Day 0.5)
    if (progress > 0.05) {
      const solarProgress = Math.min(1, (progress - 0.05) / 0.1)
      solarArrayAngle = -90 + solarProgress * 90 // Unfold to 0 degrees
    }

    // Sunshield pallet drop (Day 3)
    if (progress > 0.2) {
      const palletProgress = Math.min(1, (progress - 0.2) / 0.1)
      sunshieldLayers = sunshieldLayers.map(() => -palletProgress * 0.5)
    }

    // Sunshield layer separation (Day 5)
    if (progress > 0.35) {
      const separationProgress = Math.min(1, (progress - 0.35) / 0.15)
      sunshieldLayers = sunshieldLayers.map((_, i) => -0.5 - i * separationProgress * 0.3)
    }

    // Sunshield tensioning (Day 8)
    if (progress > 0.55) {
      const tensionProgress = Math.min(1, (progress - 0.55) / 0.15)
      sunshieldTension = tensionProgress
    }

    // Secondary mirror deployment (Day 10)
    if (progress > 0.7) {
      const mirrorProgress = Math.min(1, (progress - 0.7) / 0.15)
      secondaryMirrorExtension = mirrorProgress
    }

    // Primary mirror wings (Day 12)
    if (progress > 0.85) {
      const wingsProgress = Math.min(1, (progress - 0.85) / 0.15)
      mirrorWingsRotation = [90 - wingsProgress * 90, -90 + wingsProgress * 90]
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
        <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
          {/* Space environment lighting */}
          <ambientLight
            color={SpaceEnvironment.ambientLight.color}
            intensity={SpaceEnvironment.ambientLight.intensity}
          />
          <directionalLight
            color={SpaceEnvironment.sunLight.color}
            intensity={SpaceEnvironment.sunLight.intensity}
            position={SpaceEnvironment.sunLight.position}
            castShadow={SpaceEnvironment.sunLight.castShadow}
          />
          <directionalLight
            color={SpaceEnvironment.fillLight.color}
            intensity={SpaceEnvironment.fillLight.intensity}
            position={SpaceEnvironment.fillLight.position}
          />
          <directionalLight
            color={SpaceEnvironment.rimLight.color}
            intensity={SpaceEnvironment.rimLight.intensity}
            position={SpaceEnvironment.rimLight.position}
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
              <Calendar size={20} />
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
                className="bg-gray-700 border-gray-600 text-white"
              >
                <Rewind size={16} />
              </Button>

              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <Button
                onClick={() => {
                  setIsPlaying(false)
                  updateDeploymentState(1)
                }}
                size="sm"
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white"
              >
                <SkipForward size={16} />
              </Button>
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
      </div>
    </motion.div>
  )
}
