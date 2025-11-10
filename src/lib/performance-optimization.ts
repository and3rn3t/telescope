import * as THREE from 'three'

/**
 * Performance Optimization System for JWST 3D Model
 * Implements Level of Detail (LOD), efficient rendering, and mobile GPU optimization
 */

export interface PerformanceConfig {
  enableLOD: boolean
  maxDistance: number
  frustumCulling: boolean
  instancedRendering: boolean
  textureResolution: 'low' | 'medium' | 'high'
  shadowQuality: 'off' | 'low' | 'medium' | 'high'
  antialiasing: boolean
  devicePixelRatio: number
}

export interface LODLevel {
  distance: number
  geometry: THREE.BufferGeometry
  material: THREE.Material
  visible: boolean
}

// Detect device capabilities for optimal performance settings
export function detectDeviceCapabilities(): PerformanceConfig {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  const isLowEndDevice =
    isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)

  // Get device pixel ratio but clamp it for performance
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)

  // Detect GPU capabilities (basic heuristic)
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  const hasWebGL2 = !!document.createElement('canvas').getContext('webgl2')

  let gpuTier: 'low' | 'medium' | 'high' = 'medium'

  if (gl && gl instanceof WebGLRenderingContext) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      // Basic GPU detection - this is simplified, real-world detection is more complex
      if (renderer.toLowerCase().includes('intel')) {
        gpuTier = 'low'
      } else if (
        renderer.toLowerCase().includes('nvidia') ||
        renderer.toLowerCase().includes('amd')
      ) {
        gpuTier = 'high'
      }
    }
  }

  // Mobile devices get conservative settings
  if (isMobile || isLowEndDevice) {
    return {
      enableLOD: true,
      maxDistance: 15,
      frustumCulling: true,
      instancedRendering: true,
      textureResolution: 'low',
      shadowQuality: 'off',
      antialiasing: false,
      devicePixelRatio: Math.min(devicePixelRatio, 1),
    }
  }

  // Desktop settings based on GPU tier
  const baseConfig: PerformanceConfig = {
    enableLOD: true,
    maxDistance: 25,
    frustumCulling: true,
    instancedRendering: true,
    textureResolution: gpuTier === 'high' ? 'high' : 'medium',
    shadowQuality: gpuTier === 'high' ? 'medium' : 'low',
    antialiasing: hasWebGL2 && gpuTier !== 'low',
    devicePixelRatio,
  }

  return baseConfig
}

// Create LOD geometries with different detail levels
export function createLODGeometries() {
  return {
    // Mirror segments with different detail levels
    hexagonMirror: {
      high: new THREE.CylinderGeometry(0.4, 0.4, 0.05, 6, 1), // Full detail
      medium: new THREE.CylinderGeometry(0.4, 0.4, 0.05, 6, 1), // Same for now
      low: new THREE.BoxGeometry(0.7, 0.7, 0.05), // Simple box at distance
    },

    // Sunshield with LOD
    sunshieldLayer: {
      high: new THREE.PlaneGeometry(8, 12, 16, 24), // Detailed mesh
      medium: new THREE.PlaneGeometry(8, 12, 8, 12), // Reduced segments
      low: new THREE.PlaneGeometry(8, 12, 2, 2), // Very simple
    },

    // Support structures
    supportStrut: {
      high: new THREE.CylinderGeometry(0.02, 0.02, 3, 8),
      medium: new THREE.CylinderGeometry(0.02, 0.02, 3, 6),
      low: new THREE.BoxGeometry(0.04, 0.04, 3), // Simple box
    },

    // Spacecraft bus
    spacecraftBus: {
      high: new THREE.CylinderGeometry(2, 2, 1, 16),
      medium: new THREE.CylinderGeometry(2, 2, 1, 8),
      low: new THREE.CylinderGeometry(2, 2, 1, 6),
    },
  }
}

// Create optimized materials based on performance settings
export function createOptimizedMaterials(config: PerformanceConfig) {
  const materialConfig = {
    transparent: false,
    alphaTest: 0.1, // Helps with transparency performance
    side: THREE.FrontSide, // Only render front faces
  }

  // Adjust material quality based on settings
  if (config.textureResolution === 'low') {
    materialConfig.transparent = false
  }

  return {
    primaryMirror: new THREE.MeshStandardMaterial({
      ...materialConfig,
      color: 0xffd700,
      metalness: 1,
      roughness: 0.1,
      envMapIntensity: config.textureResolution === 'high' ? 2 : 1,
    }),

    structure: new THREE.MeshStandardMaterial({
      ...materialConfig,
      color: 0x2c3e50,
      metalness: 0.8,
      roughness: 0.4,
    }),

    sunshield: new THREE.MeshStandardMaterial({
      ...materialConfig,
      color: 0x8b4513,
      metalness: 0,
      roughness: 0.8,
      transparent: config.textureResolution !== 'low',
      opacity: 0.9,
    }),
  }
}

// Performance monitoring and adaptive quality
export class PerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 60
  private frameHistory: number[] = []
  private readonly historySize = 60 // Track last 60 frames

  public currentConfig: PerformanceConfig
  private adaptiveQuality: boolean

  constructor(initialConfig: PerformanceConfig, adaptiveQuality = true) {
    this.currentConfig = { ...initialConfig }
    this.adaptiveQuality = adaptiveQuality
  }

  // Call this every frame to monitor performance
  update(): { fps: number; shouldAdaptQuality: boolean } {
    const now = performance.now()
    const deltaTime = now - this.lastTime

    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime
      this.frameHistory.push(currentFPS)

      // Keep only recent history
      if (this.frameHistory.length > this.historySize) {
        this.frameHistory.shift()
      }

      // Calculate average FPS
      this.fps = this.frameHistory.reduce((sum, fps) => sum + fps, 0) / this.frameHistory.length
    }

    this.frameCount++
    this.lastTime = now

    // Adaptive quality adjustment
    const shouldAdaptQuality = this.adaptiveQuality && this.shouldAdjustQuality()

    return {
      fps: this.fps,
      shouldAdaptQuality,
    }
  }

  private shouldAdjustQuality(): boolean {
    // Only adjust if we have enough frame history
    if (this.frameHistory.length < 30) return false

    const targetFPS = 30 // Minimum acceptable FPS
    const lowFPSThreshold = targetFPS * 0.8 // 24 FPS
    const highFPSThreshold = targetFPS * 1.5 // 45 FPS

    // Consistently low FPS - reduce quality
    if (this.fps < lowFPSThreshold) {
      return true
    }

    // Consistently high FPS and we previously reduced quality - increase quality
    if (this.fps > highFPSThreshold && this.canIncreaseQuality()) {
      return true
    }

    return false
  }

  private canIncreaseQuality(): boolean {
    // Check if we can increase any quality settings
    return (
      !this.currentConfig.antialiasing ||
      this.currentConfig.textureResolution !== 'high' ||
      this.currentConfig.shadowQuality !== 'high'
    )
  }

  // Adjust quality settings based on performance
  adaptQuality(): PerformanceConfig {
    const newConfig = { ...this.currentConfig }

    if (this.fps < 24) {
      // Reduce quality aggressively
      if (newConfig.antialiasing) {
        newConfig.antialiasing = false
      } else if (newConfig.shadowQuality !== 'off') {
        newConfig.shadowQuality =
          newConfig.shadowQuality === 'high'
            ? 'medium'
            : newConfig.shadowQuality === 'medium'
              ? 'low'
              : 'off'
      } else if (newConfig.textureResolution !== 'low') {
        newConfig.textureResolution = newConfig.textureResolution === 'high' ? 'medium' : 'low'
      } else if (newConfig.devicePixelRatio > 1) {
        newConfig.devicePixelRatio = Math.max(1, newConfig.devicePixelRatio * 0.75)
      }
    } else if (this.fps > 45 && this.canIncreaseQuality()) {
      // Increase quality gradually
      if (!newConfig.antialiasing && newConfig.textureResolution === 'high') {
        newConfig.antialiasing = true
      } else if (newConfig.shadowQuality === 'off') {
        newConfig.shadowQuality = 'low'
      } else if (newConfig.shadowQuality === 'low') {
        newConfig.shadowQuality = 'medium'
      } else if (newConfig.textureResolution === 'low') {
        newConfig.textureResolution = 'medium'
      } else if (newConfig.textureResolution === 'medium') {
        newConfig.textureResolution = 'high'
      }
    }

    this.currentConfig = newConfig
    return newConfig
  }

  // Get performance statistics
  getStats() {
    return {
      fps: Math.round(this.fps),
      frameCount: this.frameCount,
      quality: this.currentConfig,
    }
  }
}

// Instanced rendering for mirror segments
export function createInstancedMirrors(count: number, positions: THREE.Vector3[]) {
  const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 6, 1)
  const material = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 1,
    roughness: 0.1,
  })

  const instancedMesh = new THREE.InstancedMesh(geometry, material, count)

  // Set positions for each instance
  const matrix = new THREE.Matrix4()
  positions.forEach((position, i) => {
    matrix.setPosition(position)
    instancedMesh.setMatrixAt(i, matrix)
  })

  instancedMesh.instanceMatrix.needsUpdate = true
  instancedMesh.frustumCulled = true // Enable frustum culling

  return instancedMesh
}

// Memory management utilities
export class MemoryManager {
  private disposedObjects = new Set<THREE.Object3D>()

  // Dispose of geometry and materials properly
  disposeObject(object: THREE.Object3D) {
    if (this.disposedObjects.has(object)) return

    object.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose()
        }

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      }
    })

    this.disposedObjects.add(object)
  }

  // Get memory usage information (when available)
  getMemoryInfo() {
    // @ts-ignore - This is a Chrome-specific API
    if (performance.memory) {
      // @ts-ignore
      const info = performance.memory
      return {
        used: Math.round(info.usedJSHeapSize / 1024 / 1024),
        total: Math.round(info.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(info.jsHeapSizeLimit / 1024 / 1024),
      }
    }

    return null
  }
}

// Utility to check if device supports advanced features
export function checkWebGLCapabilities() {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

  if (!gl) {
    return {
      webgl: false,
      webgl2: false,
      maxTextureSize: 0,
      maxRenderbufferSize: 0,
      floatTextures: false,
    }
  }

  const isWebGL2 = gl instanceof WebGL2RenderingContext

  return {
    webgl: true,
    webgl2: isWebGL2,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    floatTextures: !!gl.getExtension('OES_texture_float'),
    instancedArrays: isWebGL2 || !!gl.getExtension('ANGLE_instanced_arrays'),
  }
}
