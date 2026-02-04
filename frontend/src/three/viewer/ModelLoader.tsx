import { useEffect, useRef } from "react"
import { Group, Box3, Vector3, Mesh, MeshStandardMaterial, Object3D, AnimationClip, AnimationAction } from "three"
import { useLoader } from "@react-three/fiber"
import { useGLTF, useAnimations } from "@react-three/drei"
import { FBXLoader } from "three-stdlib"
import { OBJLoader } from "three-stdlib"
import { STLLoader } from "three-stdlib"

type Props = {
  path: string
  type: "glb" | "gltf" | "fbx" | "obj" | "stl"
}

// ─── Helper: centers any loaded scene object ────────────────────────────────
function CenterAndPlay({
  scene,
  animations,
  groupRef,
}: {
  scene: Object3D
  animations?: AnimationClip[]
  groupRef: React.RefObject<Group | null>
}) {
  const { actions } = useAnimations(animations ?? [], groupRef)

  useEffect(() => {
    if (!scene) return

    scene.updateWorldMatrix(true, true)

    // Play all animations
    Object.values(actions ?? {}).forEach((a: AnimationAction | null) => a?.play())

    // Center the model at origin
    const box = new Box3().setFromObject(scene)
    const center = box.getCenter(new Vector3())
    scene.position.sub(center)
  }, [scene, actions])

  return null
}

// ─── GLB / GLTF ─────────────────────────────────────────────────────────────
function GLTFModel({ path }: { path: string }) {
  const groupRef = useRef<Group>(null)
  const gltf = useGLTF(path) // always called — no condition

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
      <CenterAndPlay scene={gltf.scene} animations={gltf.animations} groupRef={groupRef} />
    </group>
  )
}

// ─── FBX ────────────────────────────────────────────────────────────────────
function FBXModel({ path }: { path: string }) {
  const groupRef = useRef<Group>(null)
  const fbx = useLoader(FBXLoader, path) // always called — no condition

  return (
    <group ref={groupRef}>
      <primitive object={fbx} />
      <CenterAndPlay scene={fbx} animations={fbx.animations} groupRef={groupRef} />
    </group>
  )
}

// ─── OBJ ────────────────────────────────────────────────────────────────────
function OBJModel({ path }: { path: string }) {
  const groupRef = useRef<Group>(null)
  const obj = useLoader(OBJLoader, path) // always called — no condition

  return (
    <group ref={groupRef}>
      <primitive object={obj} />
      <CenterAndPlay scene={obj} groupRef={groupRef} />
    </group>
  )
}

// ─── STL ────────────────────────────────────────────────────────────────────
function STLModel({ path }: { path: string }) {
  const groupRef = useRef<Group>(null)
  const geometry = useLoader(STLLoader, path) // always called — no condition

  // STL returns raw geometry → wrap in Mesh + Group
  const scene = (() => {
    const material = new MeshStandardMaterial({ color: 0x888888 })
    const mesh = new Mesh(geometry, material)
    const group = new Group()
    group.add(mesh)
    return group
  })()

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      <CenterAndPlay scene={scene} groupRef={groupRef} />
    </group>
  )
}

// ─── Main router component ──────────────────────────────────────────────────
// This component ONLY decides which sub-component to render.
// Each sub-component calls its own hooks unconditionally — no Rules-of-Hooks violation.
const ModelLoader: React.FC<Props> = ({ path, type }) => {
  switch (type) {
    case "glb":
    case "gltf":
      return <GLTFModel key={path} path={path} />
    case "fbx":
      return <FBXModel key={path} path={path} />
    case "obj":
      return <OBJModel key={path} path={path} />
    case "stl":
      return <STLModel key={path} path={path} />
    default:
      return null
  }
}

export default ModelLoader