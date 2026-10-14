import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { KEYBOARD } from "../plan.ts";
import { store } from "../store.ts";
import type { Plastics } from "./Machine.tsx";

const U = 0.27; // one key unit
type Key = { code: string; x: number; z: number; w: number; tone: 0 | 1 | 2 };

// [code, width] per row, as on a full-size board. "" is a gap.
const ROWS: [string, number][][] = [
  [["Escape", 1], ["", 1], ...["F1", "F2", "F3", "F4"].map((c) => [c, 1] as [string, number]), ["", 0.5], ...["F5", "F6", "F7", "F8"].map((c) => [c, 1] as [string, number]), ["", 0.5], ...["F9", "F10", "F11", "F12"].map((c) => [c, 1] as [string, number])],
  [["Backquote", 1], ..."1234567890".split("").map((d) => [`Digit${d}`, 1] as [string, number]), ["Minus", 1], ["Equal", 1], ["Backspace", 2]],
  [["Tab", 1.5], ..."QWERTYUIOP".split("").map((l) => [`Key${l}`, 1] as [string, number]), ["BracketLeft", 1], ["BracketRight", 1], ["Backslash", 1.5]],
  [["CapsLock", 1.75], ..."ASDFGHJKL".split("").map((l) => [`Key${l}`, 1] as [string, number]), ["Semicolon", 1], ["Quote", 1], ["Enter", 2.25]],
  [["ShiftLeft", 2.25], ..."ZXCVBNM".split("").map((l) => [`Key${l}`, 1] as [string, number]), ["Comma", 1], ["Period", 1], ["Slash", 1], ["ShiftRight", 2.75]],
  [["ControlLeft", 1.25], ["MetaLeft", 1.25], ["AltLeft", 1.25], ["Space", 6.25], ["AltRight", 1.25], ["MetaRight", 1.25], ["ContextMenu", 1.25], ["ControlRight", 1.25]],
];
const PAD = [
  ["NumLock", "NumpadDivide", "NumpadMultiply", "NumpadSubtract"],
  ["Numpad7", "Numpad8", "Numpad9", "NumpadAdd"],
  ["Numpad4", "Numpad5", "Numpad6", "NumpadEqual"],
  ["Numpad1", "Numpad2", "Numpad3", "NumpadEnter"],
  ["Numpad0", "NumpadComma", "NumpadDecimal", "NumpadParen"],
];

const LAYOUT: Key[] = (() => {
  const keys: Key[] = [];
  const x0 = -19.5 * U / 2;
  const rowZ = (r: number) => KEYBOARD.z - 0.86 + r * U + (r > 0 ? 0.12 : 0);
  ROWS.forEach((row, r) => {
    let x = x0;
    for (const [code, w] of row) {
      if (code) {
        const alpha = /^(Key|Digit)|^(Backquote|Minus|Equal|Bracket|Backslash|Semicolon|Quote|Comma|Period|Slash|Space)/.test(code);
        keys.push({ code, x: x + (w * U) / 2, z: rowZ(r), w, tone: code === "Escape" ? 2 : alpha ? 0 : 1 });
      }
      x += w * U;
    }
  });
  PAD.forEach((row, r) => row.forEach((code, c) =>
    keys.push({ code, x: x0 + (15.5 + c + 0.5) * U, z: rowZ(r + 1), w: 1, tone: /Numpad\d/.test(code) ? 0 : 1 })));
  return keys;
})();
const LETTERS = LAYOUT.map((k, i) => (k.tone === 0 && k.code.startsWith("Key") ? i : -1)).filter((i) => i >= 0);
const press = new Float32Array(LAYOUT.length);
const byCode = new Map(LAYOUT.map((k, i) => [k.code, i]));

/** Push a key down on the 3D board (decays back up on its own). */
export function pressKey(code: string) {
  const i = byCode.get(code);
  if (i !== undefined) press[i] = 1;
}

const TONES = ["#e9e1d1", "#b9ae99", "#ff4d2e"].map((c) => new THREE.Color(c));
const TILT = 0.07;

/** A full-size keyboard: every cap its own instance, so any of them can be pressed. */
export function Keyboard({ m }: { m: Plastics }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.16), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.5 }), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const next = useRef(0);

  useEffect(() => {
    const mesh = ref.current!;
    LAYOUT.forEach((k, i) => mesh.setColorAt(i, TONES[k.tone]));
    mesh.instanceColor!.needsUpdate = true;
    const down = (e: KeyboardEvent) => pressKey(e.code);
    addEventListener("keydown", down);
    return () => { removeEventListener("keydown", down); geo.dispose(); mat.dispose(); };
  }, [geo, mat]);

  useFrame((state, dt) => {
    const mesh = ref.current!;
    // On the home page the machine types to itself, a few keys a second.
    if (store.get().scene === "home" && state.clock.elapsedTime > next.current) {
      press[LETTERS[(Math.random() * LETTERS.length) | 0]] = 1;
      next.current = state.clock.elapsedTime + 0.12 + Math.random() * 0.35;
    }
    LAYOUT.forEach((k, i) => {
      press[i] = Math.max(0, press[i] - dt * 7);
      const d = Math.sin(Math.min(press[i], 1) * Math.PI * 0.5) * 0.055;
      o.position.set(k.x, 0.3 + (KEYBOARD.z - k.z) * Math.tan(TILT) - d, k.z);
      o.rotation.set(TILT, 0, 0);
      o.scale.set(k.w * U - 0.035, 0.13, U - 0.035);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <RoundedBox args={[19.5 * U + 0.36, 0.26, 6 * U + 0.62]} radius={0.08} smoothness={3} position={[0, 0.15, KEYBOARD.z - 0.15]} rotation-x={TILT} material={m.shell} castShadow receiveShadow />
      <instancedMesh ref={ref} args={[geo, mat, LAYOUT.length]} castShadow receiveShadow frustumCulled={false} />
    </group>
  );
}
