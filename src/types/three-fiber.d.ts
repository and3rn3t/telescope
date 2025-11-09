// Simple direct type augmentation for React Three Fiber JSX elements
// This overrides the default JSX namespace to include Three.js components

import { ReactNode, Ref } from 'react'
import * as THREE from 'three'

// Helper types
type Vector3 = THREE.Vector3 | [x: number, y: number, z: number]
type Euler = THREE.Euler | [x: number, y: number, z: number]
type Color = THREE.Color | string | number

// Base props for all Three.js objects
interface BaseThreeProps {
  children?: ReactNode
  ref?: Ref<THREE.Object3D | THREE.Material | THREE.BufferGeometry>
}

// Object3D props with transform properties
interface Object3DProps extends BaseThreeProps {
  position?: Vector3
  rotation?: Euler
  scale?: Vector3 | number
  visible?: boolean
  castShadow?: boolean
  receiveShadow?: boolean
  frustumCulled?: boolean
  renderOrder?: number
  userData?: Record<string, unknown>
}

// Geometry props
interface GeometryProps extends BaseThreeProps {
  args?: (number | boolean | string | object)[]
}

// Material props
interface MaterialProps extends BaseThreeProps {
  transparent?: boolean
  opacity?: number
  color?: Color
  wireframe?: boolean
}

// Light props
interface LightProps extends Object3DProps {
  color?: Color
  intensity?: number
  castShadow?: boolean
}

// Primitive props
interface PrimitiveProps extends BaseThreeProps {
  object?: THREE.Object3D | THREE.Material | THREE.BufferGeometry | THREE.Texture | THREE.Light
}

// Augment global JSX namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Core 3D objects
      group: Object3DProps
      mesh: Object3DProps
      scene: Object3DProps
      points: Object3DProps
      line: Object3DProps
      lineLoop: Object3DProps
      lineSegments: Object3DProps
      instancedMesh: Object3DProps

      // Geometries
      sphereGeometry: GeometryProps
      boxGeometry: GeometryProps
      planeGeometry: GeometryProps
      cylinderGeometry: GeometryProps
      coneGeometry: GeometryProps
      torusGeometry: GeometryProps
      circleGeometry: GeometryProps
      ringGeometry: GeometryProps
      dodecahedronGeometry: GeometryProps
      icosahedronGeometry: GeometryProps
      octahedronGeometry: GeometryProps
      tetrahedronGeometry: GeometryProps
      extrudeGeometry: GeometryProps
      latheGeometry: GeometryProps
      shapeGeometry: GeometryProps
      tubeGeometry: GeometryProps
      bufferGeometry: GeometryProps

      // Materials
      meshBasicMaterial: MaterialProps
      meshStandardMaterial: MaterialProps
      meshPhongMaterial: MaterialProps
      meshLambertMaterial: MaterialProps
      meshToonMaterial: MaterialProps
      meshPhysicalMaterial: MaterialProps
      meshMatcapMaterial: MaterialProps
      meshNormalMaterial: MaterialProps
      meshDepthMaterial: MaterialProps
      meshDistanceMaterial: MaterialProps
      pointsMaterial: MaterialProps
      lineBasicMaterial: MaterialProps
      lineDashedMaterial: MaterialProps
      shaderMaterial: MaterialProps
      rawShaderMaterial: MaterialProps
      shadowMaterial: MaterialProps
      spriteMaterial: MaterialProps

      // Lights
      ambientLight: LightProps
      directionalLight: LightProps
      pointLight: LightProps
      spotLight: LightProps
      hemisphereLight: LightProps
      rectAreaLight: LightProps

      // Special elements
      primitive: PrimitiveProps

      // Cameras
      perspectiveCamera: Object3DProps
      orthographicCamera: Object3DProps

      // Helpers
      axesHelper: Object3DProps
      gridHelper: Object3DProps
      polarGridHelper: Object3DProps
      directionalLightHelper: Object3DProps
      cameraHelper: Object3DProps
      boxHelper: Object3DProps
      box3Helper: Object3DProps
      planeHelper: Object3DProps
      arrowHelper: Object3DProps
      pointLightHelper: Object3DProps
      hemisphereLightHelper: Object3DProps
      spotLightHelper: Object3DProps
    }
  }
}

export {}
