import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { FEATURED } from "../../../content/featured.ts";
import { ROOMS, VOID } from "../../plan.ts";
import { scroll, store, useGallery } from "../../store.ts";
import { AMBER, type Materials } from "../materials.ts";
import { Softbox, Truss } from "../props/Studio.tsx";
import { Ridges } from "../Ridges.tsx";

RectAreaLightUniformsLib.init();

/** Atrium station index of the first featured exhibit. */
export const FEATURED_STATION = 2;
const MAX_W = 8.6, MAX_H = 6.2, CY = (VOID.y0 + VOID.y1) / 2;
const SUNK = VOID.z - VOID.depth + 0.25, RISEN = VOID.z + 1.1;
const tint = new THREE.Color();
const WHITE = new THREE.Color(1, 1, 1);

/** One exhibit that rises out of the Lightbox when its station is on screen and sinks back after. */
function Emerging({ i, src, video, aspect, m }: { i: number; src: string; video?: string; aspect: number; m: Materials }) {
  const map = useTexture(src);
  map.colorSpace = THREE.SRGBColorSpace;
  const group = useRef<THREE.Group>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false }), [map]);
  const vid = useRef<{ el: HTMLVideoElement; tex: THREE.VideoTexture } | null>(null);
  const [w, h] = aspect >= MAX_W / MAX_H ? [MAX_W, MAX_W / aspect] : [MAX_H * aspect, MAX_H];

  useEffect(() => () => { vid.current?.el.pause(); vid.current?.tex.dispose(); mat.dispose(); }, [mat]);

  useFrame((_, dt) => {
    const g = group.current!;
    const live = store.get().room === "atrium";
    const d = Math.abs(scroll.u - (FEATURED_STATION + i));
    const target = live ? THREE.MathUtils.smoothstep(1 - d, 0.15, 0.75) : 0;
    const a = THREE.MathUtils.damp(g.userData.a ?? 0, target, 5, dt);
    g.userData.a = a;
    g.visible = a > 0.004;
    if (!g.visible) { vid.current?.el.pause(); return; }
    g.position.z = THREE.MathUtils.lerp(SUNK, RISEN, a);
    g.rotation.y = (1 - a) * (i % 2 ? 0.12 : -0.12);
    // Out of the light: the piece starts as a warm glow and takes on its own colour as it surfaces.
    mat.color.copy(tint.copy(AMBER).lerp(WHITE, a ** 1.5));
    mat.opacity = Math.min(1, a * 1.6);

    if (video && a > 0.6) {
      if (!vid.current) {
        const el = Object.assign(document.createElement("video"), { src: video, muted: true, loop: true, playsInline: true, crossOrigin: "anonymous", preload: "auto" });
        const tex = new THREE.VideoTexture(el);
        tex.colorSpace = THREE.SRGBColorSpace;
        vid.current = { el, tex };
      }
      const { el, tex } = vid.current;
      if (el.paused) el.play().catch(() => {});
      if (el.readyState >= 2 && mat.map !== tex) { mat.map = tex; mat.needsUpdate = true; }
    } else if (vid.current && !vid.current.el.paused) vid.current.el.pause();
  });

  return (
    <group ref={group} position={[0, CY, SUNK]} visible={false}>
      <mesh material={mat}><planeGeometry args={[w, h]} /></mesh>
      <mesh material={m.ink} position={[0, 0, -0.05]}><boxGeometry args={[w + 0.14, h + 0.14, 0.08]} /></mesh>
    </group>
  );
}

/** Aim a light's target once it mounts. */
const aim = (to: [number, number, number]) => (l: THREE.SpotLight) => { l.target.position.set(...to); l.target.updateMatrixWorld(); };

export function Atrium({ m }: { m: Materials }) {
  const r = ROOMS.atrium;
  const { tier } = useGallery();
  const ridgeW = (r.x1 - r.x0 - VOID.w) / 2 - 1.2;

  return (
    <group>
      {/* Polished studio floor: on capable GPUs it mirrors the lights, softly blurred like epoxy resin. */}
      {tier === "high" && (
        <mesh position={[0, 0.004, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[r.x1 - r.x0, r.z1 - r.z0]} />
          <MeshReflectorMaterial resolution={512} blur={[400, 120]} mixBlur={1} mixStrength={22} roughness={0.55} depthScale={1} minDepthThreshold={0.5} maxDepthThreshold={1.3} color="#161412" metalness={0.5} mirror={0.85} />
        </mesh>
      )}

      {/* The Lightbox throws soft warm light across the floor, like a wall of diffusion. */}
      <rectAreaLight position={[VOID.x, CY, VOID.z + 0.05]} width={VOID.w} height={VOID.y1 - VOID.y0} intensity={1.4} color="#ffb867" />

      {/* Rigging: two trusses of tungsten fresnels, with pools of light on the floor beneath. */}
      <Truss m={m} length={26} lamps={6} position={[0, 13.5, -6]} />
      <Truss m={m} length={26} lamps={6} position={[0, 13.5, 6]} />
      {[-7, 0, 7].map((x) => (
        <spotLight key={x} position={[x, 13, -2]} angle={0.24} penumbra={0.8} intensity={520} distance={32} color="#ffb85c" onUpdate={aim([x * 0.9, 0, -5])} />
      ))}

      {/* Softboxes on stands, angled in toward the Lightbox. */}
      <Softbox m={m} position={[-10.5, 0, -6]} rotation-y={0.75} />
      <Softbox m={m} position={[10.5, 0, -6]} rotation-y={-0.75} />

      {/* Satin ridges flank the Lightbox, raked by two tungsten spots so light runs down every flute. */}
      {[-1, 1].map((s) => {
        const x = s * (VOID.w / 2 + 0.6 + ridgeW / 2);
        return (
          <group key={s}>
            <Ridges width={ridgeW} height={r.h - 2} pitch={0.16} material={m.satin} position={[x, (r.h - 2) / 2 + 0.6, r.z0 + 0.02]} />
            <spotLight position={[x - s * 1.5, r.h - 1, r.z0 + 6]} angle={0.42} penumbra={0.9} intensity={320} distance={40} color="#ffb04d" onUpdate={aim([x, 2, r.z0])} />
          </group>
        );
      })}

      {FEATURED.map((f, i) => (
        <Emerging key={f.slug} i={i} src={`/gallery/exhibits/${f.slug}.webp`} video={f.video} aspect={f.width / f.height} m={m} />
      ))}
    </group>
  );
}
