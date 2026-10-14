"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { store, useGallery } from "../store.ts";
import { Building } from "./Building.tsx";
import { useMaterials } from "./materials.ts";
import { Rig } from "./Rig.tsx";
import { Atrium } from "./rooms/Atrium.tsx";

function World() {
  const m = useMaterials();
  const { tier } = useGallery();
  const gl = useThree((s) => s.gl);

  // Ready once the first frame with textures has rendered; context loss drops to the stills.
  useEffect(() => {
    const id = requestAnimationFrame(() => store.set({ phase: "ready" }));
    const lost = (e: Event) => { e.preventDefault(); store.set({ phase: "fallback" }); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => { cancelAnimationFrame(id); gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [gl]);

  return (
    <>
      <Environment files="/gallery/hdri/studio_1k.hdr" environmentIntensity={0.1} />
      <color attach="background" args={["#060505"]} />
      <fog attach="fog" args={["#060505", 26, 95]} />
      <Building m={m} />
      <Atrium m={m} />
      <EffectComposer multisampling={0} enableNormalPass={false}>
        {tier === "high" ? <N8AO aoRadius={1.6} intensity={2.2} distanceFalloff={0.6} quality="medium" /> : <N8AO aoRadius={1.4} intensity={2} halfRes quality="performance" />}
        <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.25} intensity={1.1} />
        <ToneMapping mode={ToneMappingMode.AGX} />
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
      shadows={{ type: 2 /* PCFSoft */ }}
      flat
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 50, near: 0.1, far: 220, position: [0, 2, 12] }}
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
