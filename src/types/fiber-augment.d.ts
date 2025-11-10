// Extend the existing @react-three/fiber types to include the missing JSX properties
// This augments the existing module rather than replacing it

import { ThreeEvent } from '@react-three/fiber'
import { ReactNode } from 'react'
import * as THREE from 'three'

declare module '@react-three/fiber' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: {
        ref?: React.Ref<THREE.Mesh>
        position?: [number, number, number] | THREE.Vector3
        rotation?: [number, number, number] | THREE.Euler
        scale?: [number, number, number] | THREE.Vector3 | number
        visible?: boolean
        castShadow?: boolean
        receiveShadow?: boolean
        frustumCulled?: boolean
        renderOrder?: number
        userData?: Record<string, unknown>
        children?: ReactNode
        onClick?: (event: ThreeEvent<MouseEvent>) => void
        onPointerOver?: (event: ThreeEvent<PointerEvent>) => void
        onPointerOut?: (event: ThreeEvent<PointerEvent>) => void
        onPointerMove?: (event: ThreeEvent<PointerEvent>) => void
        onPointerDown?: (event: ThreeEvent<PointerEvent>) => void
        onPointerUp?: (event: ThreeEvent<PointerEvent>) => void
        onDoubleClick?: (event: ThreeEvent<MouseEvent>) => void
        onContextMenu?: (event: ThreeEvent<MouseEvent>) => void
        onWheel?: (event: ThreeEvent<WheelEvent>) => void
      }

      group: {
        ref?: React.Ref<THREE.Group>
        position?: [number, number, number] | THREE.Vector3
        rotation?: [number, number, number] | THREE.Euler
        scale?: [number, number, number] | THREE.Vector3 | number
        visible?: boolean
        castShadow?: boolean
        receiveShadow?: boolean
        frustumCulled?: boolean
        renderOrder?: number
        userData?: Record<string, unknown>
        children?: ReactNode
        onClick?: (event: ThreeEvent<MouseEvent>) => void
        onPointerOver?: (event: ThreeEvent<PointerEvent>) => void
        onPointerOut?: (event: ThreeEvent<PointerEvent>) => void
        onPointerMove?: (event: ThreeEvent<PointerEvent>) => void
        onPointerDown?: (event: ThreeEvent<PointerEvent>) => void
        onPointerUp?: (event: ThreeEvent<PointerEvent>) => void
        onDoubleClick?: (event: ThreeEvent<MouseEvent>) => void
        onContextMenu?: (event: ThreeEvent<MouseEvent>) => void
        onWheel?: (event: ThreeEvent<WheelEvent>) => void
      }

      primitive: {
        ref?: React.Ref<THREE.Object3D>
        object?: THREE.Object3D
        children?: ReactNode
      }

      sphereGeometry: {
        ref?: React.Ref<THREE.SphereGeometry>
        args?: [
          radius?: number,
          widthSegments?: number,
          heightSegments?: number,
          phiStart?: number,
          phiLength?: number,
          thetaStart?: number,
          thetaLength?: number,
        ]
      }

      meshBasicMaterial: {
        ref?: React.Ref<THREE.MeshBasicMaterial>
        transparent?: boolean
        opacity?: number
        color?: string | number | THREE.Color
        wireframe?: boolean
        map?: THREE.Texture
        alphaMap?: THREE.Texture
        side?: THREE.Side
        visible?: boolean
      }

      ambientLight: {
        ref?: React.Ref<THREE.AmbientLight>
        color?: string | number | THREE.Color
        intensity?: number
      }

      directionalLight: {
        ref?: React.Ref<THREE.DirectionalLight>
        color?: string | number | THREE.Color
        intensity?: number
        position?: [number, number, number] | THREE.Vector3
        target?: THREE.Object3D
        castShadow?: boolean
        'shadow-mapSize'?: [number, number] | THREE.Vector2
        'shadow-camera-near'?: number
        'shadow-camera-far'?: number
        'shadow-camera-left'?: number
        'shadow-camera-right'?: number
        'shadow-camera-top'?: number
        'shadow-camera-bottom'?: number
      }
    }
  }
}

export {}
