import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Satin ridges: a fluted panel of half-round flutes standing proud of a wall. Built as one
 * instanced mesh, centred on its group origin, facing +z (rotate the group to face the room).
 */
export function Ridges({ width, height, pitch = 0.14, material, ...group }: {
  width: number; height: number; pitch?: number; material: THREE.Material;
} & Omit<React.ComponentProps<"group">, "children">) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = Math.floor(width / pitch);
  const r = pitch * 0.46;
  const geo = useMemo(() => {
    // Half cylinder, open-ended: theta −90°…90° puts the curved face toward +z.
    return new THREE.CylinderGeometry(r, r, height, 14, 1, true, -Math.PI / 2, Math.PI);
  }, [r, height]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) ref.current!.setMatrixAt(i, m.makeTranslation(-width / 2 + pitch * (i + 0.5), 0, 0));
    ref.current!.instanceMatrix.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [n, width, pitch]);

  return (
    <group {...group}>
      <instancedMesh ref={ref} args={[geo, material, n]} castShadow receiveShadow />
      {/* Backing board, so the gaps between flutes read as shadow rather than see-through. */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#2a2826" roughness={1} />
      </mesh>
    </group>
  );
}
