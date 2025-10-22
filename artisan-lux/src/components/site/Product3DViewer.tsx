"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type Model3DProps = {
  url: string;
};

function Model3D({ url }: Model3DProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (modelRef.current) {
      // Subtle floating animation
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={1.5} />
    </group>
  );
}

type Product3DViewerProps = {
  modelUrl: string;
  productName: string;
};

export function Product3DViewer({ modelUrl, productName }: Product3DViewerProps) {
  return (
    <div className="w-full aspect-square bg-neutral-50 rounded-lg overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#e5e5e5" />
            </mesh>
          }
        >
          <Model3D url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      <div className="text-center text-sm text-neutral-500 mt-2">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}

// AR Viewer using model-viewer
export function ProductARViewer({ modelUrl, productName }: Product3DViewerProps) {
  return (
    <div className="w-full aspect-square bg-neutral-50 rounded-lg overflow-hidden relative">
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <model-viewer
              src="${modelUrl}"
              alt="${productName}"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style="width: 100%; height: 100%;"
            >
              <button
                slot="ar-button"
                style="position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; border: none; cursor: pointer;"
              >
                View in AR
              </button>
            </model-viewer>
          `,
        }}
      />
    </div>
  );
}
