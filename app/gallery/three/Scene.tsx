"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, MeshReflectorMaterial } from "@react-three/drei";
import { Bloom, EffectComposer, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { SCREEN } from "../plan.ts";
import { store, useGallery } from "../store.ts";
import { Machine } from "./Machine.tsx";
import { Rig } from "./Rig.tsx";

RectAreaLightUniformsLib.init();
export const ORANGE = "#ff4d2e";

/** Aim a light's target once it mounts. */
const aim = (to: [number, number, number]) => (l: THREE.SpotLight) => { l.target.position.set(...to); l.target.updateMatrixWorld(); };

function World() {
  const { tier } = useGallery();
  const gl = useThree((s) => s.gl);

  // Ready once the first frame has rendered; context loss drops to the stills.
  useEffect(() => {
    const id = requestAnimationFrame(() => store.set({ phase: "ready" }));
    const lost = (e: Event) => { e.preventDefault(); store.set({ phase: "fallback" }); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => { cancelAnimationFrame(id); gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [gl]);

  return (
    <>
      <Environment files="/gallery/hdri/studio_1k.hdr" environmentIntensity={0.28} />
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", 16, 46]} />

      {/* Key from high front-left, a brand-orange rim from behind, and the tube lighting the desk. */}
      <spotLight position={[-7, 10, 9]} angle={0.42} penumbra={1} intensity={420} color="#fff1de" castShadow={tier === "high"} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} onUpdate={aim([0, 2, 1])} />
      <spotLight position={[6, 7, -7]} angle={0.5} penumbra={0.9} intensity={520} color={ORANGE} onUpdate={aim([0, 3, 0])} />
      <spotLight position={[-6, 3, -6]} angle={0.6} penumbra={1} intensity={160} color="#ffd9c2" onUpdate={aim([0, 3, 0])} />
      <rectAreaLight position={[SCREEN.x, SCREEN.y, SCREEN.z + 0.1]} width={SCREEN.w} height={SCREEN.h} intensity={2.4} color="#dfeaff" />

      <Machine />

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[40, 64]} />
        {tier === "high"
          ? <MeshReflectorMaterial resolution={512} blur={[300, 80]} mixBlur={1} mixStrength={6} roughness={0.7} depthScale={0.6} minDepthThreshold={0.4} maxDepthThreshold={1.2} color="#0d0c0c" metalness={0.4} mirror={0.6} />
          : <meshStandardMaterial color="#0d0c0c" roughness={0.6} />}
      </mesh>
      <ContactShadows position={[0, 0.005, 0.8]} scale={14} blur={2.6} opacity={0.8} far={5} frames={1} resolution={512} />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.3} intensity={0.9} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <Vignette offset={0.3} darkness={0.75} />
        <SMAA />
      </EffectComposer>
    </>
  );
}

export default function Scene() {
  const { tier } = useGallery();
  return (
    <Canvas
      dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
      shadows={{ type: THREE.PCFShadowMap }}
      flat
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 32, near: 0.1, far: 120, position: [3.2, 3.8, 14] }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <Rig />
    </Canvas>
  );
}
