/**
 * React Three Fiber TypeScript Module Augmentation
 * 
 * This file extends the @react-three/fiber module to provide proper TypeScript
 * support for JSX intrinsic elements and their properties.
 */

import type { ReactNode, Ref } from 'react'
import type * as THREE from 'three'
import type { Object3DNode as BaseObject3DNode, MaterialNode as BaseMaterialNode } from '@react-three/fiber'

// Augment the @react-three/fiber module
declare module '@react-three/fiber' {
  namespace JSX {
    interface IntrinsicElements {
      // Override and extend existing elements with proper typing
      group: Object3DNode<THREE.Group, typeof THREE.Group>
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>
      points: Object3DNode<THREE.Points, typeof THREE.Points>
      line: Object3DNode<THREE.Line, typeof THREE.Line>
      lineLoop: Object3DNode<THREE.LineLoop, typeof THREE.LineLoop>
      lineSegments: Object3DNode<THREE.LineSegments, typeof THREE.LineSegments>

      // Geometries with proper args typing
      sphereGeometry: GeometryNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>
      boxGeometry: GeometryNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>
      planeGeometry: GeometryNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>
      cylinderGeometry: GeometryNode<THREE.CylinderGeometry, typeof THREE.CylinderGeometry>
      coneGeometry: GeometryNode<THREE.ConeGeometry, typeof THREE.ConeGeometry>
      torusGeometry: GeometryNode<THREE.TorusGeometry, typeof THREE.TorusGeometry>
      bufferGeometry: GeometryNode<THREE.BufferGeometry, typeof THREE.BufferGeometry>

      // Materials with proper typing
      meshBasicMaterial: MaterialNode<THREE.MeshBasicMaterial, [THREE.MeshBasicMaterialParameters?]>
      meshStandardMaterial: MaterialNode<THREE.MeshStandardMaterial, [THREE.MeshStandardMaterialParameters?]>
      meshPhongMaterial: MaterialNode<THREE.MeshPhongMaterial, [THREE.MeshPhongMaterialParameters?]>
      meshLambertMaterial: MaterialNode<THREE.MeshLambertMaterial, [THREE.MeshLambertMaterialParameters?]>

      // Lights with proper typing
      ambientLight: LightNode<THREE.AmbientLight, typeof THREE.AmbientLight>
      directionalLight: LightNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>
      pointLight: LightNode<THREE.PointLight, typeof THREE.PointLight>
      spotLight: LightNode<THREE.SpotLight, typeof THREE.SpotLight>
      hemisphereLight: LightNode<THREE.HemisphereLight, typeof THREE.HemisphereLight>

      // Special primitive element - this is the key one we need
      primitive: {
        object?: THREE.Object3D | THREE.Material | THREE.BufferGeometry | THREE.Texture
        children?: ReactNode
      }
    }
  }

  // Extend base types with additional properties that React Three Fiber supports
  type Object3DNode<T extends THREE.Object3D, P> = BaseObject3DNode<T, P> & {
    // Transform properties
    position?: [number, number, number] | THREE.Vector3
    rotation?: [number, number, number] | THREE.Euler
    scale?: [number, number, number] | THREE.Vector3 | number
    quaternion?: [number, number, number, number] | THREE.Quaternion
    
    // Object3D properties
    visible?: boolean
    castShadow?: boolean
    receiveShadow?: boolean
    frustumCulled?: boolean
    renderOrder?: number
    userData?: Record<string, unknown>
    
    // Event handlers
    onClick?: (event: Event) => void
    onPointerOver?: (event: PointerEvent) => void
    onPointerOut?: (event: PointerEvent) => void
    onPointerMove?: (event: PointerEvent) => void
    onPointerDown?: (event: PointerEvent) => void
    onPointerUp?: (event: PointerEvent) => void
  }

  type GeometryNode<T extends THREE.BufferGeometry, P> = {
    args?: P extends new (...args: infer A) => T ? A : never
    children?: ReactNode
    ref?: Ref<T>
  }

  type MaterialNode<T extends THREE.Material, P> = BaseMaterialNode<T, P[0]> & {
    // Common material properties
    transparent?: boolean
    opacity?: number
    color?: string | number | THREE.Color
    wireframe?: boolean
    visible?: boolean
    
    // Additional material properties
    alphaTest?: number
    blending?: THREE.Blending
    depthTest?: boolean
    depthWrite?: boolean
    fog?: boolean
    side?: THREE.Side
  }

  type LightNode<T extends THREE.Light, P> = Object3DNode<T, P> & {
    color?: string | number | THREE.Color
    intensity?: number
    
    // Shadow properties
    castShadow?: boolean
    'shadow-mapSize'?: [number, number] | THREE.Vector2
    'shadow-bias'?: number
    'shadow-normalBias'?: number
    'shadow-radius'?: number
    'shadow-camera-near'?: number
    'shadow-camera-far'?: number
    'shadow-camera-left'?: number
    'shadow-camera-right'?: number
    'shadow-camera-top'?: number
    'shadow-camera-bottom'?: number
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Three.js Object3D-based components
      group: ThreeElements['group']
      scene: ThreeElements['scene']
      mesh: ThreeElements['mesh']
      points: ThreeElements['points']
      line: ThreeElements['line']
      lineLoop: ThreeElements['lineLoop']
      lineSegments: ThreeElements['lineSegments']
      instancedMesh: ThreeElements['instancedMesh']

      // Geometries
      boxGeometry: ThreeElements['boxGeometry']
      sphereGeometry: ThreeElements['sphereGeometry']
      planeGeometry: ThreeElements['planeGeometry']
      cylinderGeometry: ThreeElements['cylinderGeometry']
      coneGeometry: ThreeElements['coneGeometry']
      torusGeometry: ThreeElements['torusGeometry']
      circleGeometry: ThreeElements['circleGeometry']
      ringGeometry: ThreeElements['ringGeometry']
      dodecahedronGeometry: ThreeElements['dodecahedronGeometry']
      icosahedronGeometry: ThreeElements['icosahedronGeometry']
      octahedronGeometry: ThreeElements['octahedronGeometry']
      tetrahedronGeometry: ThreeElements['tetrahedronGeometry']
      extrudeGeometry: ThreeElements['extrudeGeometry']
      latheGeometry: ThreeElements['latheGeometry']
      parametricGeometry: ThreeElements['parametricGeometry']
      shapeGeometry: ThreeElements['shapeGeometry']
      tubeGeometry: ThreeElements['tubeGeometry']
      bufferGeometry: ThreeElements['bufferGeometry']

      // Materials
      meshBasicMaterial: ThreeElements['meshBasicMaterial']
      meshStandardMaterial: ThreeElements['meshStandardMaterial']
      meshPhongMaterial: ThreeElements['meshPhongMaterial']
      meshLambertMaterial: ThreeElements['meshLambertMaterial']
      meshToonMaterial: ThreeElements['meshToonMaterial']
      meshPhysicalMaterial: ThreeElements['meshPhysicalMaterial']
      meshMatcapMaterial: ThreeElements['meshMatcapMaterial']
      meshNormalMaterial: ThreeElements['meshNormalMaterial']
      meshDepthMaterial: ThreeElements['meshDepthMaterial']
      meshDistanceMaterial: ThreeElements['meshDistanceMaterial']
      pointsMaterial: ThreeElements['pointsMaterial']
      lineBasicMaterial: ThreeElements['lineBasicMaterial']
      lineDashedMaterial: ThreeElements['lineDashedMaterial']
      shaderMaterial: ThreeElements['shaderMaterial']
      rawShaderMaterial: ThreeElements['rawShaderMaterial']
      shadowMaterial: ThreeElements['shadowMaterial']
      spriteMaterial: ThreeElements['spriteMaterial']

      // Lights
      ambientLight: ThreeElements['ambientLight']
      directionalLight: ThreeElements['directionalLight']
      pointLight: ThreeElements['pointLight']
      spotLight: ThreeElements['spotLight']
      hemisphereLight: ThreeElements['hemisphereLight']
      rectAreaLight: ThreeElements['rectAreaLight']

      // Helpers
      axesHelper: ThreeElements['axesHelper']
      gridHelper: ThreeElements['gridHelper']
      polarGridHelper: ThreeElements['polarGridHelper']
      directionalLightHelper: ThreeElements['directionalLightHelper']
      cameraHelper: ThreeElements['cameraHelper']
      boxHelper: ThreeElements['boxHelper']
      box3Helper: ThreeElements['box3Helper']
      planeHelper: ThreeElements['planeHelper']
      arrowHelper: ThreeElements['arrowHelper']
      pointLightHelper: ThreeElements['pointLightHelper']
      hemisphereLightHelper: ThreeElements['hemisphereLightHelper']
      spotLightHelper: ThreeElements['spotLightHelper']

      // Controls and other special elements
      primitive: ThreeElements['primitive']

      // Cameras
      perspectiveCamera: ThreeElements['perspectiveCamera']
      orthographicCamera: ThreeElements['orthographicCamera']
    }
  }
}

// Define the ThreeElements interface with proper types
interface ThreeElements {
  // Object3D base properties
  group: Object3DNode<THREE.Group, typeof THREE.Group>
  scene: Object3DNode<THREE.Scene, typeof THREE.Scene>
  mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>
  points: Object3DNode<THREE.Points, typeof THREE.Points>
  line: Object3DNode<THREE.Line, typeof THREE.Line>
  lineLoop: Object3DNode<THREE.LineLoop, typeof THREE.LineLoop>
  lineSegments: Object3DNode<THREE.LineSegments, typeof THREE.LineSegments>
  instancedMesh: Object3DNode<THREE.InstancedMesh, typeof THREE.InstancedMesh>

  // Geometries
  boxGeometry: Node<THREE.BoxGeometry, typeof THREE.BoxGeometry>
  sphereGeometry: Node<THREE.SphereGeometry, typeof THREE.SphereGeometry>
  planeGeometry: Node<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>
  cylinderGeometry: Node<THREE.CylinderGeometry, typeof THREE.CylinderGeometry>
  coneGeometry: Node<THREE.ConeGeometry, typeof THREE.ConeGeometry>
  torusGeometry: Node<THREE.TorusGeometry, typeof THREE.TorusGeometry>
  circleGeometry: Node<THREE.CircleGeometry, typeof THREE.CircleGeometry>
  ringGeometry: Node<THREE.RingGeometry, typeof THREE.RingGeometry>
  dodecahedronGeometry: Node<THREE.DodecahedronGeometry, typeof THREE.DodecahedronGeometry>
  icosahedronGeometry: Node<THREE.IcosahedronGeometry, typeof THREE.IcosahedronGeometry>
  octahedronGeometry: Node<THREE.OctahedronGeometry, typeof THREE.OctahedronGeometry>
  tetrahedronGeometry: Node<THREE.TetrahedronGeometry, typeof THREE.TetrahedronGeometry>
  extrudeGeometry: Node<THREE.ExtrudeGeometry, typeof THREE.ExtrudeGeometry>
  latheGeometry: Node<THREE.LatheGeometry, typeof THREE.LatheGeometry>
  parametricGeometry: Node<THREE.ParametricGeometry, typeof THREE.ParametricGeometry>
  shapeGeometry: Node<THREE.ShapeGeometry, typeof THREE.ShapeGeometry>
  tubeGeometry: Node<THREE.TubeGeometry, typeof THREE.TubeGeometry>
  bufferGeometry: Node<THREE.BufferGeometry, typeof THREE.BufferGeometry>

  // Materials
  meshBasicMaterial: MaterialNode<THREE.MeshBasicMaterial, [THREE.MeshBasicMaterialParameters?]>
  meshStandardMaterial: MaterialNode<
    THREE.MeshStandardMaterial,
    [THREE.MeshStandardMaterialParameters?]
  >
  meshPhongMaterial: MaterialNode<THREE.MeshPhongMaterial, [THREE.MeshPhongMaterialParameters?]>
  meshLambertMaterial: MaterialNode<
    THREE.MeshLambertMaterial,
    [THREE.MeshLambertMaterialParameters?]
  >
  meshToonMaterial: MaterialNode<THREE.MeshToonMaterial, [THREE.MeshToonMaterialParameters?]>
  meshPhysicalMaterial: MaterialNode<
    THREE.MeshPhysicalMaterial,
    [THREE.MeshPhysicalMaterialParameters?]
  >
  meshMatcapMaterial: MaterialNode<THREE.MeshMatcapMaterial, [THREE.MeshMatcapMaterialParameters?]>
  meshNormalMaterial: MaterialNode<THREE.MeshNormalMaterial, [THREE.MeshNormalMaterialParameters?]>
  meshDepthMaterial: MaterialNode<THREE.MeshDepthMaterial, [THREE.MeshDepthMaterialParameters?]>
  meshDistanceMaterial: MaterialNode<
    THREE.MeshDistanceMaterial,
    [THREE.MeshDistanceMaterialParameters?]
  >
  pointsMaterial: MaterialNode<THREE.PointsMaterial, [THREE.PointsMaterialParameters?]>
  lineBasicMaterial: MaterialNode<THREE.LineBasicMaterial, [THREE.LineBasicMaterialParameters?]>
  lineDashedMaterial: MaterialNode<THREE.LineDashedMaterial, [THREE.LineDashedMaterialParameters?]>
  shaderMaterial: MaterialNode<THREE.ShaderMaterial, [THREE.ShaderMaterialParameters?]>
  rawShaderMaterial: MaterialNode<THREE.RawShaderMaterial, [THREE.RawShaderMaterialParameters?]>
  shadowMaterial: MaterialNode<THREE.ShadowMaterial, [THREE.ShadowMaterialParameters?]>
  spriteMaterial: MaterialNode<THREE.SpriteMaterial, [THREE.SpriteMaterialParameters?]>

  // Lights
  ambientLight: LightNode<THREE.AmbientLight, typeof THREE.AmbientLight>
  directionalLight: LightNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>
  pointLight: LightNode<THREE.PointLight, typeof THREE.PointLight>
  spotLight: LightNode<THREE.SpotLight, typeof THREE.SpotLight>
  hemisphereLight: LightNode<THREE.HemisphereLight, typeof THREE.HemisphereLight>
  rectAreaLight: LightNode<THREE.RectAreaLight, typeof THREE.RectAreaLight>

  // Helpers
  axesHelper: Object3DNode<THREE.AxesHelper, typeof THREE.AxesHelper>
  gridHelper: Object3DNode<THREE.GridHelper, typeof THREE.GridHelper>
  polarGridHelper: Object3DNode<THREE.PolarGridHelper, typeof THREE.PolarGridHelper>
  directionalLightHelper: Object3DNode<
    THREE.DirectionalLightHelper,
    typeof THREE.DirectionalLightHelper
  >
  cameraHelper: Object3DNode<THREE.CameraHelper, typeof THREE.CameraHelper>
  boxHelper: Object3DNode<THREE.BoxHelper, typeof THREE.BoxHelper>
  box3Helper: Object3DNode<THREE.Box3Helper, typeof THREE.Box3Helper>
  planeHelper: Object3DNode<THREE.PlaneHelper, typeof THREE.PlaneHelper>
  arrowHelper: Object3DNode<THREE.ArrowHelper, typeof THREE.ArrowHelper>
  pointLightHelper: Object3DNode<THREE.PointLightHelper, typeof THREE.PointLightHelper>
  hemisphereLightHelper: Object3DNode<
    THREE.HemisphereLightHelper,
    typeof THREE.HemisphereLightHelper
  >
  spotLightHelper: Object3DNode<THREE.SpotLightHelper, typeof THREE.SpotLightHelper>

  // Special elements
  primitive: {
    object?:
      | THREE.Object3D
      | THREE.Material
      | THREE.Geometry
      | THREE.BufferGeometry
      | THREE.Texture
      | THREE.Light
    children?: ReactNode
  }

  // Cameras
  perspectiveCamera: Object3DNode<THREE.PerspectiveCamera, typeof THREE.PerspectiveCamera>
  orthographicCamera: Object3DNode<THREE.OrthographicCamera, typeof THREE.OrthographicCamera>
}

// Helper types for Three.js JSX elements
type Vector3 = THREE.Vector3 | [x: number, y: number, z: number]
type Euler = THREE.Euler | [x: number, y: number, z: number]
type Color = THREE.Color | string | number

// Base node type for all Three.js objects
type Node<T, P> = {
  args?: P extends new (...args: unknown[]) => unknown ? ConstructorParameters<P> : never
  children?: ReactNode
  ref?: Ref<T>
}

// Object3D node with transform properties
type Object3DNode<T extends THREE.Object3D, P> = Node<T, P> & {
  position?: Vector3
  rotation?: Euler
  scale?: Vector3 | number
  quaternion?: THREE.Quaternion | [x: number, y: number, z: number, w: number]
  matrix?: THREE.Matrix4
  matrixAutoUpdate?: boolean
  visible?: boolean
  castShadow?: boolean
  receiveShadow?: boolean
  frustumCulled?: boolean
  renderOrder?: number
  userData?: Record<string, unknown>
  layers?: THREE.Layers
  up?: Vector3

  // Event handlers
  onClick?: (event: Event) => void
  onPointerOver?: (event: PointerEvent) => void
  onPointerOut?: (event: PointerEvent) => void
  onPointerMove?: (event: PointerEvent) => void
  onPointerDown?: (event: PointerEvent) => void
  onPointerUp?: (event: PointerEvent) => void
  onDoubleClick?: (event: MouseEvent) => void
  onContextMenu?: (event: MouseEvent) => void
  onWheel?: (event: WheelEvent) => void
}

// Material node with material-specific properties
type MaterialNode<T extends THREE.Material, P> = Node<T, P[0]> & {
  transparent?: boolean
  opacity?: number
  alphaTest?: number
  alphaHash?: boolean
  alphaMap?: THREE.Texture | null
  blendDst?: THREE.BlendingDstFactor
  blendDstAlpha?: number | null
  blendEquation?: THREE.BlendingEquation
  blendEquationAlpha?: number | null
  blending?: THREE.Blending
  blendSrc?: THREE.BlendingSrcFactor | THREE.BlendingDstFactor
  blendSrcAlpha?: number | null
  clipIntersection?: boolean
  clippingPlanes?: THREE.Plane[] | null
  clipShadows?: boolean
  colorWrite?: boolean
  defines?: Record<string, unknown>
  depthFunc?: THREE.DepthModes
  depthTest?: boolean
  depthWrite?: boolean
  fog?: boolean
  name?: string
  polygonOffset?: boolean
  polygonOffsetFactor?: number
  polygonOffsetUnits?: number
  precision?: 'highp' | 'mediump' | 'lowp' | null
  premultipliedAlpha?: boolean
  dithering?: boolean
  side?: THREE.Side
  shadowSide?: THREE.Side | null
  toneMapped?: boolean
  userData?: Record<string, unknown>
  vertexColors?: boolean
  visible?: boolean
  stencilWrite?: boolean
  stencilFunc?: THREE.StencilFunc
  stencilRef?: number
  stencilWriteMask?: number
  stencilFuncMask?: number
  stencilFail?: THREE.StencilOp
  stencilZFail?: THREE.StencilOp
  stencilZPass?: THREE.StencilOp

  // Common material properties
  color?: Color
  map?: THREE.Texture | null
  wireframe?: boolean
  wireframeLinewidth?: number
}

// Light node with light-specific properties
type LightNode<T extends THREE.Light, P> = Object3DNode<T, P> & {
  color?: Color
  intensity?: number

  // Shadow properties (for lights that support shadows)
  castShadow?: boolean
  'shadow-mapSize'?: [width: number, height: number] | THREE.Vector2
  'shadow-bias'?: number
  'shadow-normalBias'?: number
  'shadow-radius'?: number
  'shadow-blurSamples'?: number
  'shadow-camera-near'?: number
  'shadow-camera-far'?: number
  'shadow-camera-left'?: number
  'shadow-camera-right'?: number
  'shadow-camera-top'?: number
  'shadow-camera-bottom'?: number
  'shadow-camera-fov'?: number
  'shadow-camera-zoom'?: number
}

export {}
