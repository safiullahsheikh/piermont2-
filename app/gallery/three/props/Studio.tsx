import * as THREE from "three";
import type { Materials } from "../materials.ts";

const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.25, 6);
const poleGeo = new THREE.CylinderGeometry(0.022, 0.022, 1, 8);
// A four-sided frustum, wide end toward +z: the softbox's fabric body.
const boxGeo = new THREE.CylinderGeometry(0.95, 0.25, 0.9, 4, 1, false, Math.PI / 4).rotateX(Math.PI / 2);

/** A softbox on a tripod stand. Faces +z; the front is a warm diffuser panel. */
export function Softbox({ m, height = 3.4, ...g }: { m: Materials; height?: number } & React.ComponentProps<"group">) {
  return (
    <group {...g}>
      {/* three legs splayed from the hub */}
      {[0, 1, 2].map((k) => (
        <group key={k} rotation-y={(k * Math.PI * 2) / 3}>
          <mesh geometry={legGeo} material={m.ink} position={[0, 0.58, 0.3]} rotation-x={0.5} />
        </group>
      ))}
      <mesh geometry={poleGeo} material={m.ink} position={[0, height / 2 + 0.5, 0]} scale-y={height - 0.6} />
      <group position={[0, height + 0.3, 0]} rotation-x={-0.12}>
        <mesh geometry={boxGeo} material={m.ink} />
        <mesh material={m.warm} position={[0, 0, 0.452]}><planeGeometry args={[1.3, 1.3]} /></mesh>
      </group>
    </group>
  );
}

const canGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.42, 14).rotateX(Math.PI / 2);
const lensGeo = new THREE.CircleGeometry(0.15, 20);

/** A lighting truss with tungsten fresnels hanging off it, aimed down and in. */
export function Truss({ m, length, lamps, ...g }: { m: Materials; length: number; lamps: number } & React.ComponentProps<"group">) {
  return (
    <group {...g}>
      <mesh material={m.ink}><boxGeometry args={[length, 0.28, 0.28]} /></mesh>
      {Array.from({ length: lamps }, (_, i) => {
        const x = -length / 2 + (length / lamps) * (i + 0.5);
        return (
          <group key={i} position={[x, -0.45, 0]} rotation-x={-Math.PI / 2 + 0.55}>
            <mesh geometry={canGeo} material={m.ink} />
            <mesh geometry={lensGeo} material={m.warm} position={[0, 0, 0.215]} />
          </group>
        );
      })}
    </group>
  );
}
