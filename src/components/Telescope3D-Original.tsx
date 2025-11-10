import { Card } from '@/components/ui/card'
import { TelescopeComponent } from '@/lib/telescope-data'
import { Cpu, Cube, Eye, Lightning } from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Telescope3DProps {
  onComponentClick: (component: TelescopeComponent) => void
  selectedComponent: TelescopeComponent | null
  components: TelescopeComponent[]
}

interface ComponentMarker {
  id: string
  position: THREE.Vector3
  component: TelescopeComponent
  mesh?: THREE.Mesh
  labelDiv?: HTMLDivElement
}

const categoryIcons = {
  optics: Eye,
  instruments: Cpu,
  structure: Cube,
  power: Lightning,
}

const categoryColors = {
  optics: '#eab308',
  instruments: '#8b5cf6',
  structure: '#06b6d4',
  power: '#f59e0b',
}

const componentPositions: Record<string, [number, number, number]> = {
  'primary-mirror': [0, 0, 0],
  'secondary-mirror': [0, 0, 4],
  sunshield: [0, -3, -2],
  nircam: [0, -1.5, 0.5],
  nirspec: [-1.2, -1.5, 0.5],
  miri: [1.2, -1.5, 0.5],
  niriss: [0.6, -1.5, 0.5],
  fgs: [-0.6, -1.5, 0.5],
  'solar-arrays': [3, -2, -1],
  'spacecraft-bus': [0, -2, -1],
  ote: [0, 0.5, 0],
  backplane: [0, 0, -0.5],
}

export function Telescope3D({ onComponentClick, selectedComponent, components }: Telescope3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const markersRef = useRef<ComponentMarker[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0f)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(8, 5, 8)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(5, 10, 5)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0x8888ff, 0.3)
    directionalLight2.position.set(-5, 3, -5)
    scene.add(directionalLight2)

    const primaryMirrorGroup = new THREE.Group()
    const hexagonShape = new THREE.Shape()
    const size = 0.4
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = size * Math.cos(angle)
      const y = size * Math.sin(angle)
      if (i === 0) {
        hexagonShape.moveTo(x, y)
      } else {
        hexagonShape.lineTo(x, y)
      }
    }
    hexagonShape.lineTo(size * Math.cos(0), size * Math.sin(0))

    const extrudeSettings = {
      steps: 1,
      depth: 0.05,
      bevelEnabled: false,
    }
    const hexGeometry = new THREE.ExtrudeGeometry(hexagonShape, extrudeSettings)
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xaa8800,
      emissiveIntensity: 0.2,
    })

    const hexPositions = [
      [0, 0],
      [0.87, 0],
      [-0.87, 0],
      [0.435, 0.75],
      [-0.435, 0.75],
      [0.435, -0.75],
      [-0.435, -0.75],
      [1.305, 0.75],
      [-1.305, 0.75],
      [1.305, -0.75],
      [-1.305, -0.75],
      [0.87, 1.5],
      [-0.87, 1.5],
      [0, 1.5],
      [0, -1.5],
      [0.87, -1.5],
      [-0.87, -1.5],
      [1.74, 0],
    ]

    hexPositions.forEach(([x, y]) => {
      const hex = new THREE.Mesh(hexGeometry, mirrorMaterial)
      hex.position.set(x, y, 0)
      primaryMirrorGroup.add(hex)
    })

    scene.add(primaryMirrorGroup)

    const secondaryMirrorGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32)
    const secondaryMirror = new THREE.Mesh(secondaryMirrorGeometry, mirrorMaterial)
    secondaryMirror.position.set(0, 0, 4)
    secondaryMirror.rotation.x = Math.PI / 2
    scene.add(secondaryMirror)

    const strutMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3,
    })
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3
      const x = Math.cos(angle) * 0.4
      const y = Math.sin(angle) * 0.4
      const strutGeometry = new THREE.CylinderGeometry(0.02, 0.02, 4, 8)
      const strut = new THREE.Mesh(strutGeometry, strutMaterial)
      strut.position.set(x, y, 2)
      strut.rotation.x = Math.PI / 2
      scene.add(strut)
    }

    const sunshieldGeometry = new THREE.BoxGeometry(5, 3.5, 0.1)
    const sunshieldMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.4,
      roughness: 0.6,
      side: THREE.DoubleSide,
    })
    const sunshield = new THREE.Mesh(sunshieldGeometry, sunshieldMaterial)
    sunshield.position.set(0, -3, -2)
    scene.add(sunshield)

    const instrumentGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.3)
    const instruments = ['nircam', 'nirspec', 'miri', 'niriss', 'fgs']
    instruments.forEach((id, _idx) => {
      const pos = componentPositions[id]
      const component = components.find(c => c.id === id)
      if (pos && component) {
        const color = categoryColors[component.category] || 0x8b5cf6
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          metalness: 0.6,
          roughness: 0.4,
          emissive: new THREE.Color(color),
          emissiveIntensity: 0.3,
        })
        const mesh = new THREE.Mesh(instrumentGeometry, material)
        mesh.position.set(pos[0], pos[1], pos[2])
        scene.add(mesh)
      }
    })

    const busGeometry = new THREE.BoxGeometry(1.5, 1, 1)
    const busMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3,
    })
    const spacecraftBus = new THREE.Mesh(busGeometry, busMaterial)
    spacecraftBus.position.set(0, -2, -1)
    scene.add(spacecraftBus)

    const solarArrayGeometry = new THREE.BoxGeometry(1.5, 0.05, 1.2)
    const solarArrayMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a3e,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x0a0a1e,
      emissiveIntensity: 0.4,
    })
    const solarArray = new THREE.Mesh(solarArrayGeometry, solarArrayMaterial)
    solarArray.position.set(3, -2, -1)
    scene.add(solarArray)

    const backplaneGeometry = new THREE.BoxGeometry(3, 2, 0.2)
    const backplaneMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.5,
      roughness: 0.5,
    })
    const backplane = new THREE.Mesh(backplaneGeometry, backplaneMaterial)
    backplane.position.set(0, 0, -0.5)
    scene.add(backplane)

    const markers: ComponentMarker[] = []
    components.forEach(component => {
      const pos = componentPositions[component.id]
      if (pos) {
        const markerGeometry = new THREE.SphereGeometry(0.15, 16, 16)
        const markerMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(categoryColors[component.category]),
          emissive: new THREE.Color(categoryColors[component.category]),
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.8,
        })
        const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial)
        markerMesh.position.set(pos[0], pos[1], pos[2])
        scene.add(markerMesh)

        markers.push({
          id: component.id,
          position: new THREE.Vector3(pos[0], pos[1], pos[2]),
          component,
          mesh: markerMesh,
        })
      }
    })
    markersRef.current = markers

    const starGeometry = new THREE.BufferGeometry()
    const starPositions: number[] = []
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 200
      const y = (Math.random() - 0.5) * 200
      const z = (Math.random() - 0.5) * 200
      starPositions.push(x, y, z)
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3))
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x
        const deltaY = e.clientY - previousMousePositionRef.current.y

        rotationRef.current.y += deltaX * 0.005
        rotationRef.current.x += deltaY * 0.005

        rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x))

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    const handleClick = (e: MouseEvent) => {
      if (isDraggingRef.current) return

      const rect = renderer.domElement.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

      const validMeshes = markers
        .map(m => m.mesh)
        .filter((mesh): mesh is THREE.Mesh => mesh !== undefined)
      const intersects = raycaster.intersectObjects(validMeshes)

      if (intersects.length > 0) {
        const marker = markers.find(m => m.mesh === intersects[0].object)
        if (marker) {
          onComponentClick(marker.component)
        }
      }
    }

    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('click', handleClick)

    const handleResize = () => {
      if (!containerRef.current) return
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight

      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      const radius = 12
      const targetX = radius * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x)
      const targetY = radius * Math.sin(rotationRef.current.x)
      const targetZ = radius * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x)

      camera.position.x += (targetX - camera.position.x) * 0.05
      camera.position.y += (targetY + 5 - camera.position.y) * 0.05
      camera.position.z += (targetZ - camera.position.z) * 0.05
      camera.lookAt(0, 0, 0)

      primaryMirrorGroup.rotation.z += 0.001
      stars.rotation.y += 0.0002

      markers.forEach(marker => {
        if (marker.mesh) {
          marker.mesh.rotation.y += 0.02
          const isSelected = selectedComponent?.id === marker.id
          const scale = isSelected ? 1.3 : 1
          marker.mesh.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
        }
      })

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [components, onComponentClick, selectedComponent])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />

      <Card className="absolute top-4 left-4 p-4 bg-card/90 backdrop-blur-sm">
        <h3 className="font-semibold mb-3 text-sm">Component Key</h3>
        <div className="space-y-2">
          {Object.entries(categoryColors).map(([category, color]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons]
            return (
              <div key={category} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <Icon size={14} />
                <span className="text-xs capitalize">{category}</span>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="absolute bottom-4 left-4 right-4 p-3 bg-card/90 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-medium">Click and drag</span> to rotate •{' '}
          <span className="font-medium">Click markers</span> to view component details
        </p>
      </Card>
    </div>
  )
}
