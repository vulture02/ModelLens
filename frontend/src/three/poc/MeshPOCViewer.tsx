import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import {
  Color,
  Box3,
  Vector3,
  PerspectiveCamera,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Loader from "../viewer/Loader";

/* ============================
   🔹 Simple Annotation Interface
============================ */
interface SimpleAnnotation {
  id: string;
  modelId: string;
  meshName: string;
  meshUUID: string;
  label: string;
  description: string;
  aabb: {
    min: number[];
    max: number[];
  };
  createdAt: string;
}

/* ============================
   🔹 Auto Fit Camera (UNCHANGED)
============================ */
const FitCamera: React.FC<{
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}> = ({ controlsRef }) => {
  const { scene } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;

    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.5;

    const camera = controlsRef.current.object as PerspectiveCamera;

    camera.position.set(center.x, center.y, center.z + distance);
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
    camera.lookAt(center);

    controlsRef.current.target.set(center.x, center.y, center.z);
    controlsRef.current.update();
  }, [scene, controlsRef]);

  return null;
};

/* ============================
   🔹 Clickable Model (UNCHANGED)
============================ */
// (unchanged — keeping your code exactly same)
function ClickableModel({
  onSceneReady,
  onMeshSelect,
}: {
  onSceneReady: (scene: any) => void;
  onMeshSelect: (mesh: Mesh) => void;
}) {
  const modelPath = "/car.glb";
  const { scene } = useGLTF(modelPath);

  /* ⭐ ADD THIS (clone materials when model loads) */
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
      }
    });
  }, [scene]);

  const previousRef = useRef<Mesh | null>(null);

  useEffect(() => {
    onSceneReady(scene);
  }, [scene, onSceneReady]);

  useEffect(() => {
    console.log("---- GLB Mesh List ----");
    scene.traverse((child: any) => {
      if (child.isMesh) console.log("GLB Mesh:", child.name);
    });
    console.log("-----------------------");
  }, [scene]);

  const handleClick = (event: any) => {
    event.stopPropagation();

    const mesh = event.object as Mesh;
    if (!mesh.isMesh) return;

    console.log("Mesh Name:", mesh.name);
    console.log("UUID:", mesh.uuid);
    console.log("Click Point:", event.point.toArray());

    if (previousRef.current) {
      (previousRef.current.material as MeshStandardMaterial).color.set(
        "#ffffff",
      );
    }

    (mesh.material as MeshStandardMaterial).color.set("#ff0000");
    previousRef.current = mesh;

    onMeshSelect(mesh);
  };

  return <primitive object={scene} onClick={handleClick} />;
}

/* ============================
   🔹 Main Viewer
============================ */
export default function MeshPOCViewer() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const sceneRef = useRef<any>(null);

  const [annotations, setAnnotations] = useState<SimpleAnnotation[]>([]);
  const [selectedMesh, setSelectedMesh] = useState<Mesh | null>(null);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  // 🔥 keep track of last highlighted mesh
  const highlightedMeshRef = useRef<Mesh | null>(null);

  // smooth animation refs
  const animationRef = useRef<number | null>(null);
  const orbitRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
    };
  }, []);

  const [searchText, setSearchText] = useState("");
  const [focusedMeshInfo, setFocusedMeshInfo] = useState<any>(null);

  /* ============================
     ⭐ CASE 1 — LOAD annotations.json from /public
     (ONLY ADDITION)
  ============================ */
  useEffect(() => {
    fetch("/annotations.json")
      .then((res) => res.json())
      .then((data) => {
        setAnnotations(data);
        console.log("Loaded annotations:", data);
      })
      .catch(() => {
        console.log("No annotations.json found in public folder");
      });
  }, []);

  /*==============focus on mesh function (NEW)==============*/

  const focusOnMesh = (meshName: string) => {
    if (!sceneRef.current || !controlsRef.current) return;

    const mesh = sceneRef.current.getObjectByName(meshName) as Mesh;
    if (!mesh) return;

    const camera = controlsRef.current.object as PerspectiveCamera;

    /* ---------- STOP OLD ANIMATION ---------- */
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    /* ---------- RESET OLD HIGHLIGHT ---------- */
    if (highlightedMeshRef.current) {
      const prevMat = highlightedMeshRef.current
        .material as MeshStandardMaterial;
      prevMat?.emissive?.set(0x000000);
    }

    /* ---------- HIGHLIGHT ---------- */
    const mat = mesh.material as MeshStandardMaterial;
    mat?.emissive?.set(0x00ff00);
    mat.emissiveIntensity = 1;
    highlightedMeshRef.current = mesh;

    /* ---------- GET OBJECT CENTER + SIZE ---------- */
    const box = new Box3().setFromObject(mesh);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);

    /* ---------- CALCULATE PERFECT DISTANCE ---------- */
    const fov = camera.fov * (Math.PI / 180);
    const distance = maxDim / Math.tan(fov / 2);

    /* ---------- KEEP CURRENT VIEW DIRECTION ---------- */
    const currentDirection = camera.position
      .clone()
      .sub(controlsRef.current.target)
      .normalize();

    const targetPosition = center
      .clone()
      .add(currentDirection.multiplyScalar(distance * 1.8));

    /* ---------- SMOOTH MOVE ---------- */
    const startPos = camera.position.clone();
    const startTarget = controlsRef.current.target.clone();

    const duration = 600;
    const startTime = performance.now();

    const animate = (time: number) => {
      const t = Math.min((time - startTime) / duration, 1);
      const ease = t * t * (3 - 2 * t);

      camera.position.lerpVectors(startPos, targetPosition, ease);
      controlsRef.current.target.lerpVectors(startTarget, center, ease);

      controlsRef.current.update();

      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    /* ---------- STORE INFO ---------- */
    setFocusedMeshInfo({
      name: mesh.name,
      uuid: mesh.uuid,
      coordinates: center.toArray(),
    });
  };

  /* ============================
     🔍 Search From Annotations
  ============================ */
  const searchFromAnnotations = () => {
    if (!searchText) return;

    const found = annotations.find((a) =>
      a.label.toLowerCase().includes(searchText.toLowerCase()),
    );

    if (!found) {
      alert("No annotation found");
      return;
    }

    focusOnMesh(found.meshName);
  };

  /* ============================
     🔥 Manifest Generator
  ============================ */
  const generateManifest = () => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const nodes: any[] = [];
    const geometry: any = {};

    scene.updateWorldMatrix(true, true);

    scene.traverse((child: any) => {
      const nodeName = child.name || child.uuid;

      nodes.push({
        node_name: nodeName,
        parent: child.parent?.name || null,
        path: child.parent
          ? `/${child.parent.name}/${nodeName}`
          : `/${nodeName}`,
      });

      if (child.isMesh) {
        const box = new Box3().setFromObject(child);

        geometry[nodeName] = {
          aabb: {
            min: box.min.toArray(),
            max: box.max.toArray(),
          },
        };
      }
    });

    const manifest = {
      modelId: crypto.randomUUID(),
      nodes,
      geometry,
    };

    downloadJSON(manifest, "manifest.json");
  };

  const downloadJSON = (data: any, fileName: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800"
        camera={{ fov: 45 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.4} />

        <Suspense fallback={<Loader />}>
          <ClickableModel
            onSceneReady={(scene) => (sceneRef.current = scene)}
            onMeshSelect={(mesh) => setSelectedMesh(mesh)}
          />
          <FitCamera controlsRef={controlsRef} />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enableZoom
          enableRotate
          enablePan={false}
          onStart={() => {
            if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
          }}
        />

        <Environment preset="city" />
      </Canvas>

      {/* Manifest Button */}
      <button
        onClick={generateManifest}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        Download Manifest
      </button>

      {/* Download Annotation */}
      <button
        onClick={() => downloadJSON(annotations, "annotations.json")}
        className="absolute top-16 right-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        Download Annotations
      </button>

      {/* 🔍 SEARCH PANEL */}
      {
        <div className="absolute left-4 bottom-16 bg-black/90 text-white p-5 rounded-xl w-80 shadow-2xl border border-white/10">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-semibold tracking-wide">
              Search Part
            </div>

            <button
              onClick={() => setFocusedMeshInfo(null)}
              className="text-white/60 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          {/* Search Input */}
          <textarea
            placeholder="Search part (e.g. chain, wheel)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            rows={2}
            className="w-full mb-4 px-3 py-2 rounded-lg bg-transparent border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
          />

          {/* Search Button */}
          <button
            onClick={searchFromAnnotations}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg font-medium hover:opacity-90 mb-4"
          >
            Go To Part
          </button>

          {/* Result Display */}
          {focusedMeshInfo && (
            <div className="bg-white/5 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Mesh</span>
                <span className="font-medium">{focusedMeshInfo.name}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-white/50">UUID</span>
                <span className="break-all text-right">
                  {focusedMeshInfo.uuid}
                </span>
              </div>

              <div>
                <div className="text-white/50 mb-1">Coordinates</div>
                <div className="bg-black/40 p-2 rounded text-[11px] font-mono">
                  X: {focusedMeshInfo.coordinates[0].toFixed(3)} <br />
                  Y: {focusedMeshInfo.coordinates[1].toFixed(3)} <br />
                  Z: {focusedMeshInfo.coordinates[2].toFixed(3)}
                </div>
              </div>
            </div>
          )}
        </div>
      }

      {/* Annotation Popup */}
      {selectedMesh && (
        <div className="absolute left-4 top-4 bg-black/90 text-white p-4 rounded-lg w-72 shadow-lg border border-white/10">
          <div className="text-sm mb-3">
            Selected Mesh: <b>{selectedMesh.name}</b>
          </div>

          <input
            placeholder="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded bg-transparent border border-white/20 text-white"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full mb-4 px-3 py-2 rounded bg-transparent border border-white/20 text-white"
          />

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!selectedMesh || !label) return;

                const box = new Box3().setFromObject(selectedMesh);

                const annotation: SimpleAnnotation = {
                  id: crypto.randomUUID(),
                  modelId: "model_local_001",
                  meshName: selectedMesh.name,
                  meshUUID: selectedMesh.uuid,
                  label,
                  description,
                  aabb: {
                    min: box.min.toArray(),
                    max: box.max.toArray(),
                  },
                  createdAt: new Date().toISOString(),
                };

                setAnnotations((prev) => [...prev, annotation]);
                (selectedMesh.material as MeshStandardMaterial).color.set(
                  "#ffffff",
                );
                setSelectedMesh(null);
                setLabel("");
                setDescription("");
              }}
              className="bg-green-600 px-3 py-1 rounded"
            >
              Save
            </button>

            <button
              onClick={() => {
                if (selectedMesh)
                  (selectedMesh.material as MeshStandardMaterial).color.set(
                    "#ffffff",
                  );

                setSelectedMesh(null);
              }}
              className="bg-gray-600 px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 text-xs text-white/60">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
