import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SCENES, SCREEN } from "../plan.ts";
import { screen, store } from "../store.ts";
import { Keyboard } from "./Keyboard.tsx";

/** The materials of a late-80s desktop: sun-warmed ABS, a darker trim, and black for the slots. */
export function usePlastics() {
  return useMemo(() => ({
    shell: new THREE.MeshPhysicalMaterial({ color: "#d9cfbc", roughness: 0.46, clearcoat: 0.35, clearcoatRoughness: 0.45 }),
    trim: new THREE.MeshPhysicalMaterial({ color: "#c4b9a4", roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.5 }),
    slot: new THREE.MeshStandardMaterial({ color: "#16130f", roughness: 0.8 }),
    tube: new THREE.MeshBasicMaterial({ color: "#050505" }),
    led: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff4d2e").multiplyScalar(6), toneMapped: false }),
  }), []);
}
export type Plastics = ReturnType<typeof usePlastics>;

const roundRect = <T extends THREE.Path>(s: T, x: number, y: number, w: number, h: number, r: number) => {
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

// Bezel: 4.0 × 3.55, from the chin (y 1.0) to the brow (y 4.55); the opening sits around the glass.
const BEZEL = { y0: 1.0, y1: 4.55, w: 4, front: 1.0, depth: 0.32 };

const SCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

// A CRT: barrel-curved picture, scanlines, an aperture grille, a dark rim, and static between channels.
const SCREEN_FRAG = /* glsl */ `
uniform sampler2D map; uniform float hasMap, time, noise, power; uniform vec2 rep, off;
varying vec2 vUv;
float rnd(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  vec2 o = abs(uv.yx) / vec2(6.0, 5.0);
  uv = (uv + uv * o * o) * 0.5 + 0.5;
  // The tube is a touch smaller than the glass: a black rim with a soft inner edge.
  vec2 m = smoothstep(0.0, 0.025, uv) * smoothstep(0.0, 0.025, 1.0 - uv);
  vec3 c = hasMap > 0.5 ? texture2D(map, clamp(uv, 0.0, 1.0) * rep + off).rgb : vec3(0.02);
  c = pow(c, vec3(2.2));
  float s = 0.78 + 0.22 * sin(uv.y * 1300.0 + time * 6.0);
  float g = 0.9 + 0.1 * sin(gl_FragCoord.x * 2.1);
  c *= s * g;
  float n = rnd(uv * 480.0 + fract(time * 7.0));
  c = mix(c, vec3(n * 0.9), noise);
  c += vec3(0.008, 0.01, 0.009) * (0.6 + 0.4 * sin(uv.y * 3.0 - time * 1.4)); // phosphor glow
  c *= pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.22) * m.x * m.y;
  gl_FragColor = vec4(c * power * 1.3, 1.0);
}`;

/** The picture: one <video>, re-pointed whenever the page asks for a different loop, with static across the cut. */
function Screen() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: SCREEN_VERT, fragmentShader: SCREEN_FRAG, toneMapped: false,
    uniforms: { map: { value: null }, hasMap: { value: 0 }, time: { value: 0 }, noise: { value: 1 }, power: { value: 0 }, rep: { value: new THREE.Vector2(1, 1) }, off: { value: new THREE.Vector2() } },
  }), []);
  const geo = useMemo(() => {
    // The glass bulges toward you, like a real tube.
    const g = new THREE.PlaneGeometry(SCREEN.w + 0.16, SCREEN.h + 0.16, 32, 24);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / (SCREEN.w / 2), y = pos.getY(i) / (SCREEN.h / 2);
      pos.setZ(i, 0.14 * (1 - 0.5 * x * x) * (1 - 0.5 * y * y) - 0.07);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const v = useRef<{ el: HTMLVideoElement; tex: THREE.VideoTexture; src: string; want: string; cut: number } | null>(null);

  useEffect(() => {
    const el = Object.assign(document.createElement("video"), { muted: true, loop: true, playsInline: true, preload: "auto" });
    el.setAttribute("crossorigin", "anonymous");
    const tex = new THREE.VideoTexture(el);
    v.current = { el, tex, src: "", want: "", cut: 0 };
    mat.uniforms.map.value = tex;
    return () => { el.pause(); el.removeAttribute("src"); el.load(); tex.dispose(); mat.dispose(); geo.dispose(); };
  }, [mat, geo]);

  useFrame((state, dt) => {
    const s = v.current;
    if (!s) return;
    const u = mat.uniforms;
    u.time.value = state.clock.elapsedTime;
    u.power.value = THREE.MathUtils.damp(u.power.value, 1, 1.6, dt); // the tube warms up

    const want = screen.src || SCENES[store.get().scene].screen;
    if (want !== s.want) { s.want = want; s.cut = 0.14; }
    if (s.cut > 0) {
      s.cut -= dt;
      if (s.cut <= 0 && s.src !== s.want) { s.src = s.want; s.el.src = s.want; s.el.play().catch(() => {}); }
    }
    const live = s.el.readyState >= 2 && s.src === s.want && s.cut <= 0;
    u.hasMap.value = s.el.readyState >= 2 ? 1 : 0;
    u.noise.value = THREE.MathUtils.damp(u.noise.value, live ? 0.04 : 0.85, live ? 5 : 30, dt);
    if (live && s.el.videoWidth) {
      // Cover-fit the loop into the 4:3 tube.
      const a = s.el.videoWidth / s.el.videoHeight, t = SCREEN.w / SCREEN.h;
      if (a > t) { u.rep.value.set(t / a, 1); u.off.value.set((1 - t / a) / 2, 0); }
      else { u.rep.value.set(1, a / t); u.off.value.set(0, (1 - a / t) / 2); }
    }
  });

  return (
    <group position={[SCREEN.x, SCREEN.y, BEZEL.front - 0.1]}>
      <mesh geometry={geo} material={mat} />
      {/* The glass: a faint reflection of the room over the picture. */}
      <mesh geometry={geo} position-z={0.012}>
        <meshPhysicalMaterial color="#000" roughness={0.08} metalness={0} clearcoat={1} transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Logo() {
  const map = useTexture("/logo-cream.png");
  map.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh position={[-1.35, BEZEL.y0 + 0.24, BEZEL.front + 0.065]}>
      <planeGeometry args={[0.62, 0.26]} />
      <meshStandardMaterial map={map} color="#5d554a" transparent roughness={0.6} />
    </mesh>
  );
}

export function Machine() {
  const m = usePlastics();
  const bezel = useMemo(() => {
    const { y0, y1, w } = BEZEL;
    const shape = roundRect(new THREE.Shape(), -w / 2, y0, w, y1 - y0, 0.26);
    shape.holes.push(roundRect(new THREE.Path(), SCREEN.x - SCREEN.w / 2 - 0.1, SCREEN.y - SCREEN.h / 2 - 0.1, SCREEN.w + 0.2, SCREEN.h + 0.2, 0.2));
    const g = new THREE.ExtrudeGeometry(shape, { depth: BEZEL.depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4, curveSegments: 10 });
    g.translate(0, 0, BEZEL.front - BEZEL.depth - 0.06);
    return g;
  }, []);
  const grille = useMemo(() => Array.from({ length: 8 }, (_, i) => BEZEL.y0 + 0.12 + i * 0.062), []);
  const vents = useMemo(() => Array.from({ length: 16 }, (_, i) => -1.3 + i * 0.175), []);
  const body = useRef<THREE.Group>(null);

  // A slow breath: the machine turns a few degrees toward the pointer, desktop only.
  useFrame((state, dt) => {
    const g = body.current!;
    const k = store.get().tier === "high" ? 1 : 0;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.06 * k, 2, dt);
  });

  return (
    <group ref={body}>
      {/* Monitor */}
      <mesh geometry={bezel} material={m.shell} castShadow receiveShadow />
      <mesh position={[SCREEN.x, SCREEN.y, BEZEL.front - 0.34]} material={m.tube}><planeGeometry args={[SCREEN.w + 0.3, SCREEN.h + 0.3]} /></mesh>
      <RoundedBox args={[3.86, 3.42, 1.6]} radius={0.2} smoothness={4} position={[0, 2.78, -0.08]} material={m.shell} castShadow receiveShadow />
      <RoundedBox args={[3.1, 2.7, 1.3]} radius={0.24} smoothness={4} position={[0, 2.92, -1.3]} material={m.trim} castShadow />
      <RoundedBox args={[2.3, 1.9, 0.8]} radius={0.22} smoothness={4} position={[0, 3.0, -2.2]} material={m.trim} castShadow />
      {vents.map((x) => <mesh key={x} position={[x * 0.92, 4.495, -0.6]} material={m.slot}><boxGeometry args={[0.07, 0.02, 0.9]} /></mesh>)}

      {/* Chin: speaker grille on the left, floppy drive and power light on the right */}
      <RoundedBox args={[2.5, 0.6, 0.06]} radius={0.03} smoothness={2} position={[-0.55, BEZEL.y0 + 0.34, BEZEL.front + 0.04]} material={m.trim} receiveShadow />
      {grille.map((y) => <mesh key={y} position={[-0.55, y, BEZEL.front + 0.075]} material={m.slot}><boxGeometry args={[2.36, 0.018, 0.01]} /></mesh>)}
      <RoundedBox args={[0.92, 0.2, 0.06]} radius={0.03} smoothness={2} position={[1.32, BEZEL.y0 + 0.42, BEZEL.front + 0.04]} material={m.trim} />
      <mesh position={[1.32, BEZEL.y0 + 0.43, BEZEL.front + 0.075]} material={m.slot}><boxGeometry args={[0.74, 0.035, 0.01]} /></mesh>
      <mesh position={[1.62, BEZEL.y0 + 0.17, BEZEL.front + 0.04]} material={m.led}><boxGeometry args={[0.1, 0.04, 0.04]} /></mesh>
      <Logo />
      <Screen />

      {/* Stand */}
      <RoundedBox args={[1.5, 0.9, 1.2]} radius={0.12} smoothness={3} position={[0, 0.62, -0.3]} material={m.trim} castShadow />
      <RoundedBox args={[2.7, 0.2, 2.1]} radius={0.09} smoothness={3} position={[0, 0.1, -0.3]} material={m.shell} castShadow receiveShadow />

      <Keyboard m={m} />
    </group>
  );
}
