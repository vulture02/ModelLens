// three/viewer/ModelViewer.tsx
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Box3, Vector3, PerspectiveCamera } from "three"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { useModel } from "../context/ModelContext"
import ModelLoader from "./ModelLoader"
import { Box } from "lucide-react"

interface ModelViewerRef {
  zoomIn: () => void
  zoomOut: () => void
  rotateLeft: () => void
  rotateRight: () => void
}

// Camera auto-fit component
const FitCamera: React.FC<{ controlsRef: React.RefObject<OrbitControlsImpl | null> }> = ({ controlsRef }) => {
  const { scene } = useThree()

  useEffect(() => {
    if (!controlsRef.current) return

    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 1.5

    const camera = controlsRef.current.object as PerspectiveCamera
    camera.position.set(center.x, center.y, center.z + distance)
    camera.near = distance / 100
    camera.far = distance * 100
    camera.updateProjectionMatrix()
    camera.lookAt(center)

    controlsRef.current.target.set(center.x, center.y, center.z)
    controlsRef.current.update()
  }, [scene, controlsRef])

  return null
}

// Loading spinner inside canvas
const CanvasLoader = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4f46e5" wireframe />
    </mesh>
  )
}

const ModelViewer = forwardRef<ModelViewerRef>((_props, ref) => {
  const { modelUrl, modelType } = useModel()
  const controlsRef = useRef<OrbitControlsImpl>(null)

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }, [modelUrl])

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (controlsRef.current) {
        const camera = controlsRef.current.object as PerspectiveCamera
        const distance = camera.position.distanceTo(controlsRef.current.target)
        const direction = camera.position.clone().sub(controlsRef.current.target).normalize()
        camera.position.add(direction.multiplyScalar(-distance * 0.1))
        controlsRef.current.update()
      }
    },
    zoomOut: () => {
      if (controlsRef.current) {
        const camera = controlsRef.current.object as PerspectiveCamera
        const distance = camera.position.distanceTo(controlsRef.current.target)
        const direction = camera.position.clone().sub(controlsRef.current.target).normalize()
        camera.position.add(direction.multiplyScalar(distance * 0.1))
        controlsRef.current.update()
      }
    },
    rotateLeft: () => {
      if (controlsRef.current) {
        const camera = controlsRef.current.object as PerspectiveCamera
        const target = controlsRef.current.target
        const angle = Math.PI / 8 // 22.5 degrees
        camera.position.sub(target).applyAxisAngle(new Vector3(0, 1, 0), angle).add(target)
        controlsRef.current.update()
      }
    },
    rotateRight: () => {
      if (controlsRef.current) {
        const camera = controlsRef.current.object as PerspectiveCamera
        const target = controlsRef.current.target
        const angle = -Math.PI / 8 // -22.5 degrees
        camera.position.sub(target).applyAxisAngle(new Vector3(0, 1, 0), angle).add(target)
        controlsRef.current.update()
      }
    },
  }))

  // No model uploaded - show placeholder
  if (!modelUrl || !modelType) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Box className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="font-medium text-gray-600 mb-1">No Model Loaded</h3>
        <p className="text-sm text-gray-400">Upload a 3D file to preview</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <Canvas className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800" camera={{ fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.4} />

        <Suspense fallback={<CanvasLoader />}>
          <ModelLoader key={modelUrl} path={modelUrl} type={modelType} />
          <FitCamera controlsRef={controlsRef} />
        </Suspense>

        <OrbitControls ref={controlsRef} enableZoom enableRotate enablePan={false} />

        <Environment preset="city" />
      </Canvas>

      {/* Loading overlay */}
      <div className="absolute bottom-4 left-4 text-xs text-white/60">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
})

ModelViewer.displayName = 'ModelViewer'

export default ModelViewer
