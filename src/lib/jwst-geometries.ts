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
  // Enhanced with more accurate flat-to-flat distance and beveling
  primaryMirrorSegment: (() => {
    const geometry = createHexagonGeometry(0.65, 0.08)

    // Add subtle curvature to mirror surface for realism
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)
      const radius = Math.hypot(x, y)

      // Add very slight concave curvature (parabolic mirror surface)
      if (z > 0.03 && radius > 0.1) {
        const curvature = -0.002 * radius * radius
        positions.setZ(i, z + curvature)
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  })(), // Secondary mirror - Circular convex mirror with support structure
  // Enhanced with more accurate convex curvature
  secondaryMirror: (() => {
    const geometry = createDetailedCylinder(0.35, 0.35, 0.05, 48)

    // Create convex surface
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)
      const y = positions.getY(i)
      const radius = Math.hypot(x, z)

      // Add convex curvature to top surface
      if (y > 0 && radius < 0.35) {
        const curvature = 0.03 * (1 - (radius / 0.35) ** 2)
        positions.setY(i, y + curvature)
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  })(), // Sunshield layer - Kite-shaped with accurate JWST proportions
  // Enhanced to match the actual diamond/kite shape
  sunshieldLayer: (() => {
    const shape = new THREE.Shape()
    const width = 14 // ~21.2m scaled
    const height = 11 // ~14.2m scaled

    // Create kite/diamond shape matching JWST sunshield
    // Top point
    shape.moveTo(0, height / 2)
    // Right side
    shape.quadraticCurveTo(width / 4, height / 4, width / 2, 0)
    // Bottom right
    shape.quadraticCurveTo(width / 3, -height / 4, 0, -height / 2)
    // Bottom left
    shape.quadraticCurveTo(-width / 3, -height / 4, -width / 2, 0)
    // Left side back to top
    shape.quadraticCurveTo(-width / 4, height / 4, 0, height / 2)

    const extrudeSettings = {
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  })(),

  // Instrument housing - Enhanced detailed rectangular housing
  instrumentHousing: (() => {
    const geometry = new THREE.BoxGeometry(0.5, 0.4, 0.3, 6, 5, 4)

    // Add detail panels and mounting points
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)

      // Add chamfered edges for realism
      if (Math.abs(x) > 0.2 && Math.abs(y) > 0.15) {
        positions.setX(i, x * 0.96)
        positions.setY(i, y * 0.96)
      }

      // Add panel detail variations
      const panelFactor = Math.abs(z) > 0.12 ? 0.98 : 1
      positions.setZ(i, z * panelFactor)
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  })(),

  // Support strut - Enhanced tripod legs with realistic taper
  supportStrut: (() => {
    const topRadius = 0.03
    const bottomRadius = 0.02
    const length = 4

    // Tapered cylinder for more realistic struts
    return new THREE.CylinderGeometry(topRadius, bottomRadius, length, 24, 4)
  })(),

  // Spacecraft bus - Enhanced hexagonal structure with more detail
  spacecraftBus: (() => {
    const geometry = new THREE.BoxGeometry(2.2, 1.8, 1.2, 12, 8, 6)

    // Add structural details and hexagonal shaping
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)

      // Create more accurate hexagonal cross-section
      const angle = Math.atan2(z, x)
      const radius = Math.hypot(x, z)

      if (radius > 0.6) {
        // Hexagonal shaping
        const hexAngle = Math.floor(angle / (Math.PI / 3)) * (Math.PI / 3)
        const hexFactor = Math.cos(angle - hexAngle)
        const newRadius = radius * (0.85 + 0.15 * hexFactor)

        positions.setX(i, (x / radius) * newRadius)
        positions.setZ(i, (z / radius) * newRadius)
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  })(), // Solar panel - Enhanced photovoltaic array with cell detail
  solarPanel: (() => {
    const geometry = new THREE.BoxGeometry(3.2, 0.06, 2.2, 20, 1, 15)

    // Add realistic cell divisions and mounting structure
    const positions = geometry.attributes.position

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)

      // Create cell grid pattern with proper spacing
      const cellX = Math.floor((x + 1.6) / 0.16)
      const cellZ = Math.floor((z + 1.1) / 0.146)

      // Alternate cell heights for depth
      if ((cellX + cellZ) % 2 === 0) {
        const y = positions.getY(i)
        positions.setY(i, y + 0.003)
      }

      // Add frame structure around edges
      if (Math.abs(x) > 1.5 || Math.abs(z) > 1.05) {
        const y = positions.getY(i)
        positions.setY(i, y + 0.006)
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
      const radius = Math.hypot(x, z)

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
    for (const geometry of Object.values(JWSTGeometries)) {
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.dispose()
      }
    }

    for (const geometry of Object.values(DeploymentGeometries)) {
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.dispose()
      }
    }

    for (const geometry of Object.values(LODGeometries.medium)) {
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.dispose()
      }
    }

    for (const geometry of Object.values(LODGeometries.low)) {
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.dispose()
      }
    }
  },
}

export default JWSTGeometries
