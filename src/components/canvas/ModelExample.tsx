import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "../Loader";

const Model = () => {
  const model = useGLTF("./ThreeDExample0.gltf");

  return (
    <primitive
      object={model.scene}
      scale={2.5}
      position={[0, -1, 0]}
      rotation-y={0}
    />
  );
};

const ModelExample = () => {
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1]}
      gl={{ preserveDrawingBuffer: true }}
      camera={{
        fov: 40,
        near: 0.1,
        far: 200,
        position: [0, 0, 10],
      }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          autoRotate
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <Model />

        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default ModelExample;
