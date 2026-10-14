import { useMemo } from "react";
import { DOORS, ROOMS, VOID, type Room } from "../plan.ts";
import { plane, type Materials } from "./materials.ts";

type Opening = { c: number; w: number; y0: number; y1: number };
type Rect = { c: number; y: number; w: number; h: number };

/** A wall of length `len` and height `h`, minus its openings, as solid rectangles. */
export function wallRects(len: number, h: number, openings: Opening[]): Rect[] {
  const cuts = [0, len, ...openings.flatMap((o) => [o.c - o.w / 2, o.c + o.w / 2])]
    .filter((x) => x >= 0 && x <= len).sort((a, b) => a - b);
  const out: Rect[] = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const a = cuts[i], b = cuts[i + 1];
    if (b - a < 1e-3) continue;
    const holes = openings.filter((o) => o.c - o.w / 2 <= a + 1e-3 && b <= o.c + o.w / 2 + 1e-3).sort((p, q) => p.y0 - q.y0);
    let y = 0;
    for (const o of [...holes, { y0: h, y1: h }]) {
      if (o.y0 - y > 1e-3) out.push({ c: (a + b) / 2, w: b - a, y: (y + o.y0) / 2, h: o.y0 - y });
      y = Math.max(y, o.y1);
    }
  }
  return out;
}

type Side = "n" | "s" | "w" | "e";
// Where each wall sits, which way it faces (into the room), and how "along" maps to world x/z.
const SIDES: Record<Side, (r: Room) => { len: number; rotY: number; at: (c: number) => [number, number] }> = {
  n: (r) => ({ len: r.x1 - r.x0, rotY: 0, at: (c) => [r.x0 + c, r.z0] }),
  s: (r) => ({ len: r.x1 - r.x0, rotY: Math.PI, at: (c) => [r.x0 + c, r.z1] }),
  w: (r) => ({ len: r.z1 - r.z0, rotY: Math.PI / 2, at: (c) => [r.x0, r.z0 + c] }),
  e: (r) => ({ len: r.z1 - r.z0, rotY: -Math.PI / 2, at: (c) => [r.x1, r.z0 + c] }),
};

function openingsFor(r: Room, side: Side): Opening[] {
  const out: Opening[] = [];
  for (const d of DOORS) {
    if (d.a !== r.id && d.b !== r.id) continue;
    const [x, , z] = d.at;
    if (side === "n" && z === r.z0) out.push({ c: x - r.x0, w: d.w, y0: 0, y1: d.h });
    if (side === "s" && z === r.z1) out.push({ c: x - r.x0, w: d.w, y0: 0, y1: d.h });
    if (side === "w" && x === r.x0) out.push({ c: z - r.z0, w: d.w, y0: 0, y1: d.h });
    if (side === "e" && x === r.x1) out.push({ c: z - r.z0, w: d.w, y0: 0, y1: d.h });
  }
  if (r.id === "atrium" && side === "n") out.push({ c: VOID.x - r.x0, w: VOID.w, y0: VOID.y0, y1: VOID.y1 });
  return out;
}

function RoomShell({ r, m }: { r: Room; m: Materials }) {
  const walls = useMemo(() => (["n", "s", "w", "e"] as Side[]).flatMap((side) => {
    const s = SIDES[side](r);
    return wallRects(s.len, r.h, openingsFor(r, side)).map((q) => {
      const [x, z] = s.at(q.c);
      return { key: `${side}${q.c}${q.y}`, geo: plane(q.w, q.h), pos: [x, q.y, z] as const, rotY: s.rotY };
    });
  }), [r]);

  const w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
  const ceiling = useMemo(() => [{ geo: plane(w, d), pos: [cx, r.h, cz] as const }], [r, w, d, cx, cz]);
  const floorGeo = useMemo(() => plane(w, d), [w, d]);

  return (
    <group>
      <mesh geometry={floorGeo} material={m.floor} position={[cx, 0, cz]} rotation-x={-Math.PI / 2} receiveShadow />
      {ceiling.map((c, i) => (
        <mesh key={i} geometry={c.geo} material={m.ceiling} position={c.pos} rotation-x={Math.PI / 2} castShadow />
      ))}
      {walls.map((q) => (
        <mesh key={q.key} geometry={q.geo} material={r.id === "atrium" ? m.concrete : m.plaster} position={q.pos} rotation-y={q.rotY} castShadow receiveShadow />
      ))}
      {/* Shadow gap: the dark reveal where gallery walls meet the floor. */}
      {(["n", "s", "w", "e"] as Side[]).map((side) => {
        const s = SIDES[side](r);
        const [x, z] = s.at(s.len / 2);
        const inward = 0.012;
        const off: Record<Side, [number, number]> = { n: [0, inward], s: [0, -inward], w: [inward, 0], e: [-inward, 0] };
        return (
          <mesh key={side} material={m.ink} position={[x + off[side][0], 0.03, z + off[side][1]]} rotation-y={s.rotY}>
            <planeGeometry args={[s.len, 0.06]} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Door reveals: deep concrete jambs, so openings read as cut through a thick wall. */
function Jambs({ m }: { m: Materials }) {
  return (
    <>
      {DOORS.map((d) => {
        const a = ROOMS[d.a];
        const alongX = d.at[0] === a.x0 || d.at[0] === a.x1; // wall runs along z
        const depth = 0.6, t = 0.08;
        const sides = [-1, 1].map((k) => (alongX ? [d.at[0], d.h / 2, d.at[2] + k * (d.w / 2 - t / 2)] : [d.at[0] + k * (d.w / 2 - t / 2), d.h / 2, d.at[2]]) as [number, number, number]);
        const size = (alongX ? [depth, d.h, t] : [t, d.h, depth]) as [number, number, number];
        const top = (alongX ? [depth, t, d.w] : [d.w, t, depth]) as [number, number, number];
        return (
          <group key={d.a + d.b}>
            {sides.map((p, i) => (
              <mesh key={i} position={p} material={m.concrete} castShadow receiveShadow>
                <boxGeometry args={size} />
              </mesh>
            ))}
            <mesh position={[d.at[0], d.h - t / 2, d.at[2]]} material={m.concrete}>
              <boxGeometry args={top} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** The Lightbox: a recess behind the atrium's north wall, every inner face one warm unlit field. */
function Void({ m }: { m: Materials }) {
  const { x, y0, y1, w, z, depth } = VOID;
  const h = y1 - y0, yc = (y0 + y1) / 2, zc = z - depth / 2;
  return (
    <group>
      <mesh material={m.lightbox} position={[x, yc, z - depth]}><planeGeometry args={[w, h]} /></mesh>
      <mesh material={m.lightboxSide} position={[x - w / 2, yc, zc]} rotation-y={Math.PI / 2}><planeGeometry args={[depth, h]} /></mesh>
      <mesh material={m.lightboxSide} position={[x + w / 2, yc, zc]} rotation-y={-Math.PI / 2}><planeGeometry args={[depth, h]} /></mesh>
      <mesh material={m.lightboxSide} position={[x, y0, zc]} rotation-x={-Math.PI / 2}><planeGeometry args={[w, depth]} /></mesh>
      <mesh material={m.lightboxSide} position={[x, y1, zc]} rotation-x={Math.PI / 2}><planeGeometry args={[w, depth]} /></mesh>
      {/* A hairline of amber light framing the opening. */}
      <mesh material={m.strip} position={[x, y0 + 0.01, z + 0.03]}><boxGeometry args={[w, 0.03, 0.04]} /></mesh>
      <mesh material={m.strip} position={[x, y1 - 0.01, z + 0.03]}><boxGeometry args={[w, 0.03, 0.04]} /></mesh>
      <mesh material={m.strip} position={[x - w / 2 + 0.01, yc, z + 0.03]}><boxGeometry args={[0.03, h, 0.04]} /></mesh>
      <mesh material={m.strip} position={[x + w / 2 - 0.01, yc, z + 0.03]}><boxGeometry args={[0.03, h, 0.04]} /></mesh>
    </group>
  );
}

export function Building({ m }: { m: Materials }) {
  return (
    <group>
      {Object.values(ROOMS).map((r) => <RoomShell key={r.id} r={r} m={m} />)}
      <Jambs m={m} />
      <Void m={m} />
    </group>
  );
}

