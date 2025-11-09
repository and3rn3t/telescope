// Extend the existing @react-three/fiber types to include the missing JSX properties
// This augments the existing module rather than replacing it

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
        onClick?: (event: any) => void
        onPointerOver?: (event: any) => void
        onPointerOut?: (event: any) => void
        onPointerMove?: (event: any) => void
        onPointerDown?: (event: any) => void
        onPointerUp?: (event: any) => void
        onDoubleClick?: (event: any) => void
        onContextMenu?: (event: any) => void
        onWheel?: (event: any) => void
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
        onClick?: (event: any) => void
        onPointerOver?: (event: any) => void
        onPointerOut?: (event: any) => void
        onPointerMove?: (event: any) => void
        onPointerDown?: (event: any) => void
        onPointerUp?: (event: any) => void
        onDoubleClick?: (event: any) => void
        onContextMenu?: (event: any) => void
        onWheel?: (event: any) => void
      }

      primitive: {
        ref?: React.Ref<any>
        object?: any
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
          thetaLength?: number
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