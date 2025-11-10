import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { JWSTGeometries } from '@/lib/jwst-geometries'
import { JWSTMaterials, SpaceEnvironment } from '@/lib/jwst-materials'
import {
  CalendarBlank,
  Camera,
  Compass,
  DownloadSimple,
  House,
  Info,
  Pause,
  Play,
  Rewind,
  ShareNetwork,
  SkipForward,
} from '@phosphor-icons/react'
import { Environment, Html, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'

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

// Technical specifications for each deployment stage
const STAGE_TECHNICAL_DATA: Record<
  DeploymentStage,
  {
    components: string[]
    specifications: { label: string; value: string }[]
    parameters: { label: string; value: string }[]
    successCriteria: string[]
  }
> = {
  launch: {
    components: ['Ariane 5 Rocket', 'Payload Fairing', 'JWST Observatory'],
    specifications: [
      { label: 'Launch Mass', value: '6,500 kg' },
      { label: 'Folded Dimensions', value: '4.5m × 4.5m × 20m' },
      { label: 'Launch Vehicle', value: 'Ariane 5 ECA' },
    ],
    parameters: [
      { label: 'Launch Site', value: 'Kourou, French Guiana' },
      { label: 'Orbit Target', value: 'Sun-Earth L2 (1.5M km)' },
      { label: 'Transit Time', value: '29 days' },
    ],
    successCriteria: [
      'Clean separation from launch vehicle',
      'All systems nominal after launch vibration',
      'Communication established with ground',
    ],
  },
  separation: {
    components: ['Upper Stage', 'Spacecraft Bus', 'Solar Array (folded)'],
    specifications: [
      { label: 'Separation Velocity', value: '10.9 km/s' },
      { label: 'Bus Power', value: 'Battery mode' },
      { label: 'Temperature Control', value: 'Passive thermal' },
    ],
    parameters: [
      { label: 'Altitude at Separation', value: '~1,400 km' },
      { label: 'Time After Liftoff', value: '27 minutes' },
      { label: 'Attitude Control', value: 'Reaction wheels' },
    ],
    successCriteria: [
      'Clean mechanical separation',
      'No collision with upper stage',
      'Stable attitude achieved',
      'Telemetry downlink active',
    ],
  },
  solar_array: {
    components: ['Solar Panel', 'Deployment Boom', 'Power System', 'Hinge Mechanism'],
    specifications: [
      { label: 'Panel Area', value: '~2.5 m²' },
      { label: 'Power Output', value: '2 kW at beginning of life' },
      { label: 'Cells', value: 'Triple-junction GaAs' },
      { label: 'Deployment Angle', value: '90° rotation' },
    ],
    parameters: [
      { label: 'Deployment Time', value: '~10 minutes' },
      { label: 'Motor Type', value: 'Stepper motor' },
      { label: 'Deployment Speed', value: '~0.15°/second' },
      { label: 'Sun Pointing', value: 'Fixed orientation' },
    ],
    successCriteria: [
      'Full 90° rotation completed',
      'Panel locked in position',
      'Power generation at expected level',
      'No voltage anomalies detected',
      'Thermal balance achieved',
    ],
  },
  sunshield_pallet: {
    components: ['Forward Pallet', 'Aft Pallet', 'Membrane Layers (5)', 'Support Structure'],
    specifications: [
      { label: 'Sunshield Size', value: '21.2m × 14.2m (tennis court)' },
      { label: 'Membrane Material', value: 'Kapton E with Al/Si coating' },
      { label: 'Layer Thickness', value: '25-50 μm' },
      { label: 'Drop Distance', value: '0.6m' },
    ],
    parameters: [
      { label: 'Pallet Lowering Time', value: '~2 hours' },
      { label: 'Temperature Gradient', value: '300K hot side, 50K cold side' },
      { label: 'Tension Cables', value: '90 cables, 400 pulleys' },
    ],
    successCriteria: [
      'Pallets lowered to full extent',
      'No membrane snagging',
      'Cable tension within limits',
      'Structure alignment maintained',
    ],
  },
  sunshield_separation: {
    components: ['Layer 1-5 Membranes', 'Mid-Boom Assemblies', 'Separation Motors'],
    specifications: [
      { label: 'Layer Spacing', value: '~40cm between layers' },
      { label: 'Separation Distance', value: '0.35m vertical' },
      { label: 'Total Stack Height', value: '~1.5m when separated' },
    ],
    parameters: [
      { label: 'Separation Method', value: 'Motor-driven pins' },
      { label: 'Deployment Time', value: '1-2 days' },
      { label: 'Monitoring', value: 'Thermal sensors on each layer' },
    ],
    successCriteria: [
      'All 5 layers separated cleanly',
      'No contact between adjacent layers',
      'Proper vertical spacing achieved',
      'Temperature gradient beginning to form',
    ],
  },
  sunshield_tensioning: {
    components: ['Tensioning Cables (90)', 'Mid-Boom Arms (2)', 'Pulleys (400+)'],
    specifications: [
      { label: 'Final Shape', value: 'Diamond: 21.2m × 14.2m' },
      { label: 'Tension Force', value: '~4-8 lbs per cable' },
      { label: 'Material Stretch', value: '<1% elongation' },
      { label: 'Flatness', value: '±10mm across surface' },
    ],
    parameters: [
      { label: 'Tensioning Time', value: '2-3 days' },
      { label: 'Cable Motors', value: 'Independent control per cable' },
      { label: 'Temperature Limit', value: 'Hot side <383K' },
    ],
    successCriteria: [
      'All layers tensioned to specification',
      'Diamond shape achieved within tolerance',
      'No wrinkles or slack areas',
      'Temperature differential >200K',
      'Stable thermal equilibrium',
    ],
  },
  secondary_mirror: {
    components: ['Secondary Mirror (0.74m)', 'Tripod Support', 'Deployment Mechanism'],
    specifications: [
      { label: 'Mirror Diameter', value: '0.74 meters' },
      { label: 'Mirror Mass', value: '~40 kg' },
      { label: 'Extension Distance', value: '1.5 meters forward' },
      { label: 'Material', value: 'Beryllium with gold coating' },
    ],
    parameters: [
      { label: 'Deployment Time', value: '1 day' },
      { label: 'Extension Speed', value: 'Slow, controlled motion' },
      { label: 'Alignment Tolerance', value: '±1 arcminute' },
      { label: 'Lock Mechanism', value: 'Latch and pin system' },
    ],
    successCriteria: [
      'Full extension to 1.5m',
      'Tripod locked securely',
      'Alignment within tolerance',
      'No vibration or oscillation',
      'Optical path clear',
    ],
  },
  primary_mirror_wings: {
    components: [
      'Primary Mirror (18 segments)',
      'Left Wing (6 segments)',
      'Right Wing (6 segments)',
      'Hinge Mechanisms',
    ],
    specifications: [
      { label: 'Total Mirror Diameter', value: '6.5 meters' },
      { label: 'Segment Size', value: '1.32m flat-to-flat hexagon' },
      { label: 'Segment Mass', value: '~40 kg each' },
      { label: 'Wing Rotation', value: '90° from folded to flat' },
      { label: 'Material', value: 'Beryllium + 100nm gold' },
    ],
    parameters: [
      { label: 'Deployment Time', value: '2 days (staggered)' },
      { label: 'Rotation Speed', value: '~0.1°/minute' },
      { label: 'Alignment Precision', value: 'Sub-wavelength (nm)' },
      { label: 'Hinge Motors', value: '2 per wing, redundant' },
    ],
    successCriteria: [
      'Both wings rotated to 0° (flat)',
      'All 18 segments locked in place',
      'Hinges secured with no play',
      'Segment alignment within 1mm',
      'Ready for fine phasing',
    ],
  },
  complete: {
    components: ['Full Observatory', 'All Systems Active', 'Science Instruments Ready'],
    specifications: [
      { label: 'Deployed Size', value: '20.2m × 14.2m' },
      { label: 'Total Mass', value: '6,500 kg' },
      { label: 'Collecting Area', value: '25.4 m²' },
      { label: 'Wavelength Range', value: '0.6-28.5 μm' },
    ],
    parameters: [
      { label: 'Orbit', value: 'Sun-Earth L2 halo orbit' },
      { label: 'Mission Duration', value: '10+ years (goal)' },
      { label: 'Operating Temperature', value: '~40K (-233°C)' },
      { label: 'Data Rate', value: 'Up to 28.6 Mbps' },
    ],
    successCriteria: [
      'All deployments verified complete',
      'Observatory at thermal equilibrium',
      'All science instruments operational',
      'Fine guidance system locked',
      'Ready for mirror phasing and commissioning',
    ],
  },
}

// Camera positions for auto-follow feature
const CAMERA_FOCUS_POSITIONS: Record<
  DeploymentStage,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  launch: { position: [10, 5, 14], target: [0, 0, 0] },
  separation: { position: [8, 4, 12], target: [0, 0, 0] },
  solar_array: { position: [8, 2, 8], target: [1.3, 0, 0] }, // Focus on solar panel
  sunshield_pallet: { position: [10, -2, 10], target: [0, -3, -1.5] }, // Focus on sunshield
  sunshield_separation: { position: [8, -4, 12], target: [0, -3, -1.5] },
  sunshield_tensioning: { position: [12, -3, 10], target: [0, -3, -1.5] },
  secondary_mirror: { position: [6, 3, 10], target: [0, 1, 1.5] }, // Focus on secondary mirror
  primary_mirror_wings: { position: [10, 2, 12], target: [0, 0, 0] }, // Focus on primary mirror
  complete: { position: [12, 6, 15], target: [0, 0, 0] }, // Full view
}

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

// Camera controller for auto-follow feature
function CameraController({
  deploymentState,
  autoFollow,
  controlsRef,
}: {
  deploymentState: DeploymentState
  autoFollow: boolean
  controlsRef: React.RefObject<OrbitControlsType | null>
}) {
  useFrame(state => {
    if (!autoFollow || !controlsRef.current) return

    const focusData = CAMERA_FOCUS_POSITIONS[deploymentState.stage]
    if (!focusData) return

    // Smoothly interpolate camera position
    const targetPos = new THREE.Vector3(...focusData.position)
    state.camera.position.lerp(targetPos, 0.02)

    // Smoothly interpolate controls target
    const targetLookAt = new THREE.Vector3(...focusData.target)
    const currentTarget = controlsRef.current.target as THREE.Vector3
    currentTarget.lerp(targetLookAt, 0.02)

    controlsRef.current.update()
  })

  return null
}

// Deployment trail visualization - shows ghosted previous positions
function DeploymentTrail({
  position,
  targetPosition,
  progress,
  color = '#4a9eff',
}: {
  position: [number, number, number]
  targetPosition: [number, number, number]
  progress: number
  color?: string
}) {
  const points = []
  const steps = 8
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = position[0] + (targetPosition[0] - position[0]) * t * progress
    const y = position[1] + (targetPosition[1] - position[1]) * t * progress
    const z = position[2] + (targetPosition[2] - position[2]) * t * progress
    points.push(new THREE.Vector3(x, y, z))
  }

  const curve = new THREE.CatmullRomCurve3(points)
  const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false)

  return (
    <mesh geometry={tubeGeometry}>
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  )
}

// Deployment vector arrows showing force/movement direction
function DeploymentVector({
  start,
  direction,
  length,
  color = '#ff9500',
}: {
  start: [number, number, number]
  direction: [number, number, number]
  length: number
  color?: string
}) {
  const arrowHelper = useRef<THREE.ArrowHelper>(null)

  useFrame(() => {
    if (arrowHelper.current) {
      // Gentle pulsing animation
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1
      arrowHelper.current.setLength(length * scale, length * 0.2 * scale, length * 0.15 * scale)
    }
  })

  return (
    <arrowHelper
      ref={arrowHelper}
      args={[
        new THREE.Vector3(...direction).normalize(),
        new THREE.Vector3(...start),
        length,
        color,
        length * 0.2,
        length * 0.15,
      ]}
    />
  )
}

// Component highlighting outline effect
function ComponentHighlight({
  active,
  color = '#00ffff',
  scale = 1.05,
}: {
  active: boolean
  color?: string
  scale?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(state => {
    if (meshRef.current && active) {
      // Pulsing glow effect
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7
      ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.3
    }
  })

  if (!active) return null

  return (
    <mesh ref={meshRef} scale={scale}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.BackSide} />
    </mesh>
  )
}

// 3D JWST Model with deployment animations
function DeployingJWST({
  deploymentState,
  showTrails,
  showVectors,
}: Readonly<{ deploymentState: DeploymentState; showTrails: boolean; showVectors: boolean }>) {
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

    // Solar array deployment with smooth rotation (unfolds on Y-axis)
    if (solarArrayRef.current) {
      const targetRotation = THREE.MathUtils.degToRad(deploymentState.solarArrayAngle)
      // Ref now points directly to the rotating group
      solarArrayRef.current.rotation.y = THREE.MathUtils.lerp(
        solarArrayRef.current.rotation.y,
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
          {/* Main spacecraft bus body */}
          <mesh castShadow>
            <boxGeometry args={[2, 1.5, 1.2]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* High-Gain Antenna Assembly - mounted on top */}
          <group position={[0, 0.75, 0]}>
            {/* Antenna mounting post */}
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
              <meshStandardMaterial color="#34495e" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Antenna dish (sphere for parabolic reflector) */}
            <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 4, 0, 0]} scale={[1, 1, 0.4]}>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial color="#c9a961" metalness={0.95} roughness={0.05} side={2} />
            </mesh>

            {/* Feed horn at center of dish */}
            <mesh position={[0, 0.5, 0.1]}>
              <cylinderGeometry args={[0.04, 0.06, 0.15, 8]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

          {/* Solar Array - mounted on side of spacecraft bus */}
          {/* Connection strut from bus edge to solar array mount */}
          <mesh position={[1.1, 0, 0]}>
            <boxGeometry args={[0.2, 0.08, 0.08]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Solar array assembly - positioned outside bus */}
          <group position={[1.3, 0, 0]}>
            {/* Mounting bracket on bus */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.25, 0.25]} />
              <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Deployment hinge mechanism */}
            <mesh position={[0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.15, 8]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Solar panel assembly (rotates from Y-axis, starting folded) */}
            <group position={[0.15, 0, 0]} rotation={[0, 0, 0]} ref={solarArrayRef}>
              {/* Support boom arm */}
              <mesh position={[0.6, 0, 0]}>
                <boxGeometry args={[1.2, 0.05, 0.05]} />
                <meshStandardMaterial color="#34495e" metalness={0.8} roughness={0.3} />
              </mesh>

              {/* Boom end connection */}
              <mesh position={[1.2, 0, 0]}>
                <boxGeometry args={[0.08, 0.12, 0.12]} />
                <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.3} />
              </mesh>

              {/* Solar panel array */}
              <mesh position={[1.3, 0, 0]}>
                <primitive object={JWSTGeometries.solarPanel} />
                <primitive object={JWSTMaterials.solarPanel} />
              </mesh>
            </group>
          </group>
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

      {/* Visual Enhancements: Trails, Vectors, and Highlights */}
      {showTrails &&
        deploymentState.stage === 'solar_array' &&
        deploymentState.solarArrayAngle < 90 && (
          <DeploymentTrail
            position={[1.3, -1.5, -2]}
            targetPosition={[1.3, 0, 0]}
            progress={1 - deploymentState.solarArrayAngle / 90}
            color="#4a9eff"
          />
        )}

      {showTrails && deploymentState.stage === 'sunshield_tensioning' && (
        <>
          {[-1, -0.5, 0, 0.5, 1].map((x, i) => (
            <DeploymentTrail
              key={`sunshield-trail-${i}`}
              position={[x * 1.5, -3, -1.5]}
              targetPosition={[x * 2.5, -3, -1.5]}
              progress={deploymentState.sunshieldTension}
              color="#ffa500"
            />
          ))}
        </>
      )}

      {showVectors &&
        deploymentState.stage === 'solar_array' &&
        deploymentState.solarArrayAngle > 0 &&
        deploymentState.solarArrayAngle < 90 && (
          <DeploymentVector
            start={[1.3, -1.5, -2]}
            direction={[0, 1, 0]}
            length={1.5}
            color="#00ff00"
          />
        )}

      {showVectors &&
        deploymentState.stage === 'secondary_mirror' &&
        deploymentState.secondaryMirrorExtension > 0 && (
          <DeploymentVector
            start={[0, 0, 1.5]}
            direction={[0, 0, 1]}
            length={1.5}
            color="#ffff00"
          />
        )}

      {showVectors && deploymentState.stage === 'primary_mirror_wings' && (
        <>
          <DeploymentVector
            start={[-2.64, 0, 0]}
            direction={[1, 0, 0]}
            length={1.2}
            color="#ff00ff"
          />
          <DeploymentVector
            start={[2.64, 0, 0]}
            direction={[-1, 0, 0]}
            length={1.2}
            color="#ff00ff"
          />
        </>
      )}

      {/* Component highlighting for active deployment */}
      <group position={[0, 0, 0]}>
        {deploymentState.stage === 'solar_array' && (
          <group position={[1.3, 0, 0]}>
            <ComponentHighlight active color="#4a9eff" scale={0.8} />
          </group>
        )}
        {deploymentState.stage === 'sunshield_tensioning' && (
          <group position={[0, -3, -1.5]}>
            <ComponentHighlight active color="#ffa500" scale={3} />
          </group>
        )}
        {deploymentState.stage === 'secondary_mirror' && (
          <group position={[0, 0, 3]}>
            <ComponentHighlight active color="#ffff00" scale={1} />
          </group>
        )}
        {deploymentState.stage === 'primary_mirror_wings' && (
          <group position={[0, 0, 0]}>
            <ComponentHighlight active color="#ff00ff" scale={3.5} />
          </group>
        )}
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
  const [cameraAutoFollow, setCameraAutoFollow] = useState(true)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const [showTrails, setShowTrails] = useState(true)
  const [showVectors, setShowVectors] = useState(true)
  const [showTechnicalPanel, setShowTechnicalPanel] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const orbitControlsRef = useRef<OrbitControlsType>(null)

  // Screenshot capture function
  const captureScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `jwst-deployment-day${Math.floor(deploymentState.overallProgress * 14)}.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    })
  }, [deploymentState.overallProgress])

  // Share link generation
  const generateShareLink = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname
    const timestamp = deploymentState.overallProgress
    const shareUrl = `${baseUrl}?deployment=${timestamp.toFixed(3)}`

    navigator.clipboard.writeText(shareUrl).then(() => {
      // Could add toast notification here
      alert(`Share link copied to clipboard!\n\n${shareUrl}`)
    })
  }, [deploymentState.overallProgress])

  // Load from URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const deploymentParam = params.get('deployment')
    if (deploymentParam) {
      const progress = parseFloat(deploymentParam)
      if (!isNaN(progress) && progress >= 0 && progress <= 1) {
        updateDeploymentState(progress)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate deployment state based on overall progress
  const updateDeploymentState = useCallback((progress: number) => {
    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress))

    const currentEvent =
      DEPLOYMENT_TIMELINE[Math.floor(progress * (DEPLOYMENT_TIMELINE.length - 1))]
    const stage = currentEvent.deploymentStage

    let solarArrayAngle = 90 // Start folded flat against the bus (90°)
    let sunshieldLayers = [0, 0, 0, 0, 0]
    let sunshieldTension = 0
    let secondaryMirrorExtension = 0
    let mirrorWingsRotation = [90, -90]

    // PHASE 1: Solar array deployment (Day 0.5) - Unfold perpendicular to bus
    if (progress > 0.03) {
      const solarProgress = Math.min(1, (progress - 0.03) / 0.08)
      const easedProgress = solarProgress * solarProgress * (3 - 2 * solarProgress)
      solarArrayAngle = 90 - easedProgress * 90 // Rotate from 90° (folded against bus) to 0° (perpendicular)
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case ' ': // Space: Play/Pause
          e.preventDefault()
          setIsPlaying(prev => !prev)
          break
        case 'arrowleft': // Previous event
          e.preventDefault()
          setIsPlaying(false)
          setCurrentEventIndex(prev => {
            const newIndex = Math.max(0, prev - 1)
            updateDeploymentState(newIndex / (DEPLOYMENT_TIMELINE.length - 1))
            return newIndex
          })
          break
        case 'arrowright': // Next event
          e.preventDefault()
          setIsPlaying(false)
          setCurrentEventIndex(prev => {
            const newIndex = Math.min(DEPLOYMENT_TIMELINE.length - 1, prev + 1)
            updateDeploymentState(newIndex / (DEPLOYMENT_TIMELINE.length - 1))
            return newIndex
          })
          break
        case 'r': // Reset
          e.preventDefault()
          setIsPlaying(false)
          updateDeploymentState(0)
          break
        case 'f': // Toggle auto-follow
          e.preventDefault()
          setCameraAutoFollow(prev => !prev)
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          // Jump to specific event (1-9)
          e.preventDefault()
          const eventIndex = parseInt(e.key) - 1
          if (eventIndex < DEPLOYMENT_TIMELINE.length) {
            setIsPlaying(false)
            updateDeploymentState(eventIndex / (DEPLOYMENT_TIMELINE.length - 1))
          }
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [updateDeploymentState])

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
          camera={{ position: [10, 5, 14], fov: 45 }}
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

          <DeployingJWST
            deploymentState={deploymentState}
            showTrails={showTrails}
            showVectors={showVectors}
          />

          <OrbitControls
            ref={orbitControlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={6}
            maxDistance={30}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 8}
            autoRotate={false}
            target={[0, 0, 0]}
            enableDamping={true}
            dampingFactor={0.05}
          />

          <CameraController
            deploymentState={deploymentState}
            autoFollow={cameraAutoFollow}
            controlsRef={orbitControlsRef}
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

            {/* Visual Enhancement Toggles */}
            <div className="space-y-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
              <div className="text-xs font-medium text-gray-400 mb-2">🎨 Visual Enhancements</div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Camera Auto-Follow</span>
                <Button
                  onClick={() => setCameraAutoFollow(!cameraAutoFollow)}
                  size="sm"
                  variant={cameraAutoFollow ? 'default' : 'outline'}
                  className={`text-xs h-6 ${cameraAutoFollow ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {cameraAutoFollow ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Deployment Trails</span>
                <Button
                  onClick={() => setShowTrails(!showTrails)}
                  size="sm"
                  variant={showTrails ? 'default' : 'outline'}
                  className={`text-xs h-6 ${showTrails ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {showTrails ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Force Vectors</span>
                <Button
                  onClick={() => setShowVectors(!showVectors)}
                  size="sm"
                  variant={showVectors ? 'default' : 'outline'}
                  className={`text-xs h-6 ${showVectors ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {showVectors ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>

            {/* Export & Share Tools */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-400 mb-2">📤 Share & Export</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={captureScreenshot}
                  size="sm"
                  variant="outline"
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs"
                  title="Download screenshot"
                >
                  <Camera size={14} weight="regular" className="mr-1" />
                  Screenshot
                </Button>
                <Button
                  onClick={generateShareLink}
                  size="sm"
                  variant="outline"
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs"
                  title="Copy share link"
                >
                  <ShareNetwork size={14} weight="regular" className="mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {/* Technical Details Toggle */}
            <Button
              onClick={() => setShowTechnicalPanel(!showTechnicalPanel)}
              size="sm"
              variant="outline"
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <Info size={16} weight="regular" className="mr-2" />
              {showTechnicalPanel ? 'Hide' : 'Show'} Technical Details
            </Button>

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

            {/* Keyboard Shortcuts Help */}
            <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
              <div className="text-xs font-medium text-gray-400 mb-2">⌨️ Keyboard Shortcuts</div>
              <div className="space-y-1 text-[10px] text-gray-500">
                <div className="flex justify-between">
                  <span>Space</span>
                  <span className="text-gray-400">Play/Pause</span>
                </div>
                <div className="flex justify-between">
                  <span>← →</span>
                  <span className="text-gray-400">Previous/Next Event</span>
                </div>
                <div className="flex justify-between">
                  <span>1-9</span>
                  <span className="text-gray-400">Jump to Event</span>
                </div>
                <div className="flex justify-between">
                  <span>R</span>
                  <span className="text-gray-400">Reset</span>
                </div>
                <div className="flex justify-between">
                  <span>F</span>
                  <span className="text-gray-400">Toggle Auto-Follow</span>
                </div>
              </div>
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

            {/* Event Timeline - Enhanced with color coding */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <div className="text-sm font-medium text-gray-300 mb-2">Timeline Events</div>
              {DEPLOYMENT_TIMELINE.map((event, index) => {
                const isComplete = index < currentEventIndex
                const isActive = index === currentEventIndex
                const isExpanded = expandedEvent === index
                const eventProgress = isComplete
                  ? 100
                  : isActive
                    ? Math.round(
                        ((deploymentState.overallProgress * (DEPLOYMENT_TIMELINE.length - 1) -
                          index) /
                          1) *
                          100
                      )
                    : 0

                return (
                  <div key={index} className="space-y-1">
                    <button
                      onClick={() => {
                        setIsPlaying(false)
                        updateDeploymentState(index / (DEPLOYMENT_TIMELINE.length - 1))
                      }}
                      onDoubleClick={() => setExpandedEvent(isExpanded ? null : index)}
                      className={`w-full text-left p-2 rounded text-xs transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                          : isComplete
                            ? 'bg-green-700/80 text-white'
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {/* Status indicator */}
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isComplete
                                  ? 'bg-green-400'
                                  : isActive
                                    ? 'bg-blue-400 animate-pulse'
                                    : 'bg-gray-500'
                              }`}
                            />
                            {event.event}
                          </div>
                          <div className="text-xs opacity-75 ml-4">
                            Day {event.day} - {event.time}
                          </div>
                        </div>
                        {/* Progress percentage */}
                        {(isComplete || isActive) && (
                          <span className="text-xs font-semibold">{eventProgress}%</span>
                        )}
                      </div>

                      {/* Progress bar for active event */}
                      {isActive && eventProgress > 0 && (
                        <div className="mt-2 h-1 bg-blue-900/50 rounded-full overflow-hidden">
                          <Progress value={eventProgress} className="h-1" />
                        </div>
                      )}
                    </button>

                    {/* Expandable details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-2 bg-gray-800/80 rounded text-xs text-gray-300 ml-4 border-l-2 border-blue-500">
                            <p className="mb-1">{event.description}</p>
                            <p className="text-[10px] text-gray-500 mt-2">
                              Double-click to collapse
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Technical Details Panel */}
        <AnimatePresence>
          {showTechnicalPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Info size={16} weight="regular" />
                    Stage Technical Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {STAGE_TECHNICAL_DATA[deploymentState.stage] && (
                    <>
                      {/* Components */}
                      <div>
                        <div className="text-gray-400 font-medium mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          Components
                        </div>
                        <div className="space-y-1 ml-3">
                          {STAGE_TECHNICAL_DATA[deploymentState.stage].components.map((comp, i) => (
                            <div key={i} className="text-gray-300 text-[11px]">
                              • {comp}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Specifications */}
                      <div>
                        <div className="text-gray-400 font-medium mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          Specifications
                        </div>
                        <div className="space-y-1 ml-3">
                          {STAGE_TECHNICAL_DATA[deploymentState.stage].specifications.map(
                            (spec, i) => (
                              <div key={i} className="flex justify-between text-[11px]">
                                <span className="text-gray-400">{spec.label}:</span>
                                <span className="text-gray-300 font-medium">{spec.value}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Parameters */}
                      <div>
                        <div className="text-gray-400 font-medium mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                          Parameters
                        </div>
                        <div className="space-y-1 ml-3">
                          {STAGE_TECHNICAL_DATA[deploymentState.stage].parameters.map(
                            (param, i) => (
                              <div key={i} className="flex justify-between text-[11px]">
                                <span className="text-gray-400">{param.label}:</span>
                                <span className="text-gray-300 font-medium">{param.value}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Success Criteria */}
                      <div>
                        <div className="text-gray-400 font-medium mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full" />
                          Success Criteria
                        </div>
                        <div className="space-y-1 ml-3">
                          {STAGE_TECHNICAL_DATA[deploymentState.stage].successCriteria.map(
                            (criteria, i) => (
                              <div key={i} className="text-gray-300 text-[11px] flex gap-2">
                                <span className="text-green-400 shrink-0">✓</span>
                                <span>{criteria}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Download Technical Data */}
                      <Button
                        onClick={() => {
                          const data = STAGE_TECHNICAL_DATA[deploymentState.stage]
                          const text = `JWST Deployment - ${deploymentState.stage.replace('_', ' ').toUpperCase()}\n\nComponents:\n${data.components.map(c => `• ${c}`).join('\n')}\n\nSpecifications:\n${data.specifications.map(s => `${s.label}: ${s.value}`).join('\n')}\n\nParameters:\n${data.parameters.map(p => `${p.label}: ${p.value}`).join('\n')}\n\nSuccess Criteria:\n${data.successCriteria.map(c => `✓ ${c}`).join('\n')}`
                          const blob = new Blob([text], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.download = `jwst-${deploymentState.stage}-specs.txt`
                          link.href = url
                          link.click()
                          URL.revokeObjectURL(url)
                        }}
                        size="sm"
                        variant="outline"
                        className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs mt-2"
                      >
                        <DownloadSimple size={14} weight="regular" className="mr-2" />
                        Download Specs
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
    </motion.div>
  )
}
