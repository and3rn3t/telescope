import * as THREE from 'three'

/**
 * Advanced Materials Library for JWST 3D Model
 * Realistic space telescope materials with proper PBR properties
 */

// Texture loader for reusable textures (currently unused but available for future enhancements)
// const textureLoader = new THREE.TextureLoader()

// Base materials with physically accurate properties
export const JWSTMaterials = {
  // Primary mirror segments - Gold-plated beryllium (18kt gold, 100nm thick)
  primaryMirror: new THREE.MeshStandardMaterial({
    name: 'PrimaryMirror',
    color: '#FFD700',
    metalness: 0.98,
    roughness: 0.02,
    emissive: '#442200',
    emissiveIntensity: 0.03,
    envMapIntensity: 2,
    // Add subtle normal map for surface detail
    normalScale: new THREE.Vector2(0.05, 0.05),
  }),

  // Secondary mirror - Beryllium with gold coating
  secondaryMirror: new THREE.MeshStandardMaterial({
    name: 'SecondaryMirror',
    color: '#FFE4B5',
    metalness: 0.95,
    roughness: 0.04,
    envMapIntensity: 1.8,
    emissive: '#332200',
    emissiveIntensity: 0.02,
  }),

  // Sunshield layers - Kapton with aluminum and silicon coatings
  sunshieldLayer1: new THREE.MeshStandardMaterial({
    name: 'SunshieldLayer1',
    color: '#FFA726', // Kapton polyimide orange
    metalness: 0.4,
    roughness: 0.6,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    emissive: '#FF6B00',
    emissiveIntensity: 0.08,
    envMapIntensity: 0.5,
  }),

  sunshieldLayer2: new THREE.MeshStandardMaterial({
    name: 'SunshieldLayer2',
    color: '#E0E0E0', // Aluminum coating
    metalness: 0.85,
    roughness: 0.3,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    envMapIntensity: 1.2,
  }),

  // Instrument housing - Aluminum with anodized finish
  instrumentHousing: new THREE.MeshStandardMaterial({
    name: 'InstrumentHousing',
    color: '#4169E1',
    metalness: 0.6,
    roughness: 0.3,
    envMapIntensity: 0.8,
  }),

  // Spacecraft structure - Carbon fiber composite
  structure: new THREE.MeshStandardMaterial({
    name: 'Structure',
    color: '#2F4F4F',
    metalness: 0.2,
    roughness: 0.8,
    normalScale: new THREE.Vector2(0.5, 0.5), // Carbon fiber weave
  }),

  // Solar panels - Triple-junction gallium arsenide photovoltaic cells
  solarPanel: new THREE.MeshStandardMaterial({
    name: 'SolarPanel',
    color: '#0A1628',
    metalness: 0.3,
    roughness: 0.15,
    emissive: '#001144',
    emissiveIntensity: 0.15,
    envMapIntensity: 0.6,
  }),

  // Highlighted component material
  highlighted: new THREE.MeshStandardMaterial({
    name: 'Highlighted',
    color: '#00FFFF',
    metalness: 0.8,
    roughness: 0.2,
    emissive: '#0088FF',
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.9,
  }),

  // Support struts - Titanium alloy
  supportStrut: new THREE.MeshStandardMaterial({
    name: 'SupportStrut',
    color: '#C0C0C0',
    metalness: 0.7,
    roughness: 0.3,
  }),

  // Thermal blankets - Multi-layer insulation
  thermalBlanket: new THREE.MeshStandardMaterial({
    name: 'ThermalBlanket',
    color: '#FFD700',
    metalness: 0.9,
    roughness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  }),

  // Electronic components
  electronics: new THREE.MeshStandardMaterial({
    name: 'Electronics',
    color: '#006400',
    metalness: 0.4,
    roughness: 0.6,
  }),

  // Actuators and mechanisms
  actuator: new THREE.MeshStandardMaterial({
    name: 'Actuator',
    color: '#800080',
    metalness: 0.5,
    roughness: 0.4,
  }),

  // Optical bench
  opticalBench: new THREE.MeshStandardMaterial({
    name: 'OpticalBench',
    color: '#708090',
    metalness: 0.3,
    roughness: 0.5,
  }),
}

// Material variations for different states
export const MaterialStates = {
  normal: (baseMaterial: THREE.MeshStandardMaterial) => baseMaterial.clone(),

  highlighted: (baseMaterial: THREE.MeshStandardMaterial) => {
    const material = baseMaterial.clone()
    material.emissive.setHex(0x0088ff)
    material.emissiveIntensity = 0.3
    return material
  },

  selected: (baseMaterial: THREE.MeshStandardMaterial) => {
    const material = baseMaterial.clone()
    material.emissive.setHex(0x00ff88)
    material.emissiveIntensity = 0.4
    return material
  },

  transparent: (baseMaterial: THREE.MeshStandardMaterial, opacity = 0.3) => {
    const material = baseMaterial.clone()
    material.transparent = true
    material.opacity = opacity
    return material
  },
}

// Specialized materials for different instruments
export const InstrumentMaterials = {
  NIRCam: new THREE.MeshStandardMaterial({
    name: 'NIRCam',
    color: '#FF6B6B',
    metalness: 0.6,
    roughness: 0.3,
  }),

  NIRSpec: new THREE.MeshStandardMaterial({
    name: 'NIRSpec',
    color: '#4ECDC4',
    metalness: 0.6,
    roughness: 0.3,
  }),

  MIRI: new THREE.MeshStandardMaterial({
    name: 'MIRI',
    color: '#45B7D1',
    metalness: 0.6,
    roughness: 0.3,
  }),

  NIRISS: new THREE.MeshStandardMaterial({
    name: 'NIRISS',
    color: '#96CEB4',
    metalness: 0.6,
    roughness: 0.3,
  }),

  FGS: new THREE.MeshStandardMaterial({
    name: 'FGS',
    color: '#FFEAA7',
    metalness: 0.6,
    roughness: 0.3,
  }),
}

// Environment and lighting setup for realistic space rendering
export const SpaceEnvironment = {
  // Ambient lighting to simulate scattered starlight
  ambientLight: {
    color: '#ffffff',
    intensity: 0.2,
  },

  // Primary directional light (simulating Sun)
  sunLight: {
    color: '#ffffff',
    intensity: 1.5,
    position: [10, 10, 5] as [number, number, number],
    castShadow: true,
    shadowMapSize: [2048, 2048] as [number, number],
  },

  // Fill light (simulating Earth reflection)
  fillLight: {
    color: '#4169E1',
    intensity: 0.3,
    position: [-5, -5, -10] as [number, number, number],
  },

  // Rim light (space environment)
  rimLight: {
    color: '#6495ED',
    intensity: 0.8,
    position: [0, 0, -15] as [number, number, number],
  },
}

// Animation curves for smooth material transitions
export const MaterialAnimations = {
  highlight: {
    duration: 300, // milliseconds
    easing: 'easeInOutCubic',
  },

  selection: {
    duration: 500,
    easing: 'easeOutElastic',
  },

  deployment: {
    duration: 2000,
    easing: 'easeInOutQuart',
  },
}

// Dispose function for cleanup
export function disposeMaterials() {
  for (const material of Object.values(JWSTMaterials)) {
    if (material instanceof THREE.Material) {
      material.dispose()
    }
  }

  for (const material of Object.values(InstrumentMaterials)) {
    if (material instanceof THREE.Material) {
      material.dispose()
    }
  }
}

export default JWSTMaterials
