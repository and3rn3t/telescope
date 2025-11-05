import * as THREE from 'three'

/**
 * Advanced JWST Geometry Library
 * Accurate 3D geometries for all major telescope components
 */

// Helper function to create hexagonal geometry
function createHexagonGeometry(radius: number, thickness: number): THREE.ExtrudeGeometry {
  const hexShape = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) {
      hexShape.moveTo(x, y)
    } else {
      hexShape.lineTo(x, y)
    }
  }
  hexShape.closePath()

  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.1,
    bevelSize: thickness * 0.05,
    bevelSegments: 3,
  }

  return new THREE.ExtrudeGeometry(hexShape, extrudeSettings)
}

// Helper function to create detailed cylinder with segments
function createDetailedCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments = 32,
  heightSegments = 1,
  chamfer = true
): THREE.CylinderGeometry {
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments
  )

  if (chamfer) {
    // Add subtle chamfer to edges
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)
      if (Math.abs(y - height / 2) < 0.01 || Math.abs(y + height / 2) < 0.01) {
        const x = positions.getX(i)
        const z = positions.getZ(i)
        const chamferFactor = 0.95
        positions.setX(i, x * chamferFactor)
        positions.setZ(i, z * chamferFactor)
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()
  }

  return geometry
}

// JWST Component Geometries
export const JWSTGeometries = {
  // Primary mirror segment - Hexagonal with precise JWST proportions
  primaryMirrorSegment: createHexagonGeometry(0.65, 0.05),

  // Secondary mirror - Circular with support structure
  secondaryMirror: createDetailedCylinder(0.35, 0.35, 0.03, 32),

  // Sunshield layer - Large rectangular with curved edges
  sunshieldLayer: (() => {
    const shape = new THREE.Shape()
    const width = 12
    const height = 8
    const cornerRadius = 0.5

    shape.moveTo(-width / 2 + cornerRadius, -height / 2)
    shape.lineTo(width / 2 - cornerRadius, -height / 2)
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + cornerRadius)
    shape.lineTo(width / 2, height / 2 - cornerRadius)
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - cornerRadius, height / 2)
    shape.lineTo(-width / 2 + cornerRadius, height / 2)
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - cornerRadius)
    shape.lineTo(-width / 2, -height / 2 + cornerRadius)
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + cornerRadius, -height / 2)

    return new THREE.ShapeGeometry(shape)
  })(),

  // Instrument housing - Detailed rectangular housing
  instrumentHousing: (() => {
    const geometry = new THREE.BoxGeometry(0.4, 0.3, 0.2, 4, 3, 2)

    // Add detail panels and mounting points
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)

      // Add slight bevel to corners
      if (Math.abs(x) > 0.18 && Math.abs(y) > 0.13) {
        positions.setX(i, x * 0.95)
        positions.setY(i, y * 0.95)
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  })(),

  // Support strut - Hollow cylinder for structural members
  supportStrut: (() => {
    const outerRadius = 0.025
    const length = 4

    // Create cylinder for structural members
    return new THREE.CylinderGeometry(outerRadius, outerRadius, length, 16)
  })(),

  // Spacecraft bus - Complex hexagonal structure
  spacecraftBus: (() => {
    const geometry = new THREE.BoxGeometry(2, 1.5, 1, 8, 6, 4)

    // Add structural details
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)

      // Create hexagonal cross-section approximation
      if (Math.abs(x) > 0.8 && Math.abs(z) > 0.4) {
        const factor = 0.9
        positions.setX(i, x * factor)
        positions.setZ(i, z * factor)
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  })(),

  // Solar panel - Detailed photovoltaic array
  solarPanel: (() => {
    const geometry = new THREE.BoxGeometry(3, 0.05, 2, 15, 1, 10)

    // Add cell divisions
    const positions = geometry.attributes.position

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)

      // Create subtle cell grid pattern
      const cellX = Math.floor((x + 1.5) / 0.2)
      const cellZ = Math.floor((z + 1) / 0.2)

      if ((cellX + cellZ) % 2 === 0) {
        const y = positions.getY(i)
        positions.setY(i, y + 0.002)
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  })(),

  // Optical bench - Precision mounting structure
  opticalBench: (() => {
    return new THREE.BoxGeometry(1.5, 0.2, 1.2, 6, 2, 5)
  })(),

  // Thermal radiator - Finned heat dissipator
  thermalRadiator: (() => {
    const geometry = new THREE.BoxGeometry(0.8, 1.2, 0.1, 4, 12, 1)

    // Add fin details
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)
      const finIndex = Math.floor((y + 0.6) / 0.1)

      if (finIndex % 2 === 0) {
        const z = positions.getZ(i)
        positions.setZ(i, z * 1.2) // Extend fins
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  })(),

  // Antenna - High-gain communications dish
  antenna: (() => {
    const segments = 32
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, segments)

    // Create parabolic dish shape
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)
      const y = positions.getY(i)
      const radius = Math.sqrt(x * x + z * z)

      if (radius > 0.1) {
        const parabolaFactor = radius * radius * 0.3
        positions.setY(i, y - parabolaFactor)
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  })(),
}

// Deployment geometries for animation sequences
export const DeploymentGeometries = {
  // Folded sunshield configuration
  foldedSunshield: (() => {
    const geometry = new THREE.BoxGeometry(2, 0.5, 1.5, 8, 2, 6)
    return geometry
  })(),

  // Folded mirror wing
  foldedMirrorWing: (() => {
    const geometry = new THREE.BoxGeometry(1, 2, 0.1, 4, 8, 1)
    return geometry
  })(),

  // Stowed solar array
  stowedSolarArray: (() => {
    const geometry = new THREE.BoxGeometry(0.3, 2, 0.8, 1, 8, 3)
    return geometry
  })(),
}

// LOD (Level of Detail) geometries for performance optimization
export const LODGeometries = {
  // High detail (close view)
  high: JWSTGeometries,

  // Medium detail (medium distance)
  medium: {
    primaryMirrorSegment: createHexagonGeometry(0.65, 0.05),
    secondaryMirror: createDetailedCylinder(0.35, 0.35, 0.03, 16),
    instrumentHousing: new THREE.BoxGeometry(0.4, 0.3, 0.2, 2, 2, 2),
    supportStrut: new THREE.CylinderGeometry(0.025, 0.025, 4, 8),
    spacecraftBus: new THREE.BoxGeometry(2, 1.5, 1, 4, 3, 2),
    solarPanel: new THREE.BoxGeometry(3, 0.05, 2, 6, 1, 4),
  },

  // Low detail (far view)
  low: {
    primaryMirrorSegment: new THREE.CylinderGeometry(0.65, 0.65, 0.05, 6),
    secondaryMirror: new THREE.CylinderGeometry(0.35, 0.35, 0.03, 8),
    instrumentHousing: new THREE.BoxGeometry(0.4, 0.3, 0.2),
    supportStrut: new THREE.CylinderGeometry(0.025, 0.025, 4, 6),
    spacecraftBus: new THREE.BoxGeometry(2, 1.5, 1),
    solarPanel: new THREE.BoxGeometry(3, 0.05, 2),
  },
}

// Utility functions for geometry management
export const GeometryUtils = {
  // Dispose all geometries for cleanup
  disposeAll: () => {
    Object.values(JWSTGeometries).forEach(geometry => {
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.dispose()
      }
    })

    Object.values(DeploymentGeometries).forEach(geometry => {
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.dispose()
      }
    })

    Object.values(LODGeometries.medium).forEach(geometry => {
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.dispose()
      }
    })

    Object.values(LODGeometries.low).forEach(geometry => {
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.dispose()
      }
    })
  },
}

export default JWSTGeometries
