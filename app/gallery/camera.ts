import type { Pose, Vec3 } from "./plan.ts";

const cr = (a: number, b: number, c: number, d: number, t: number) => {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
};
const crv = (a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3 => [0, 1, 2].map((i) => cr(a[i], b[i], c[i], d[i], t)) as Vec3;

/** Pose at continuous station index `u` (clamped to the ends), Catmull-Rom through the stations. */
export function poseAt(s: Pose[], u: number): Pose {
  const n = s.length - 1;
  const v = Math.min(Math.max(u, 0), n);
  const i = Math.min(Math.floor(v), Math.max(n - 1, 0));
  const t = n === 0 ? 0 : v - i;
  if (t === 0) return s[i];
  if (t === 1) return s[i + 1];
  const a = s[Math.max(i - 1, 0)], b = s[i], c = s[i + 1], d = s[Math.min(i + 2, n)];
  return { pos: crv(a.pos, b.pos, c.pos, d.pos, t), look: crv(a.look, b.look, c.look, d.look, t), fov: b.fov + (c.fov - b.fov) * t };
}

/** A crane move between two shots: up and back out, around the machine, then in. */
export function flight(from: Pose, to: Pose): Pose[] {
  const mid = from.pos.map((v, i) => (v + to.pos[i]) / 2) as Vec3;
  const r = Math.max(Math.hypot(mid[0], mid[2]), 1);
  const out = Math.max(13 / r, 1); // never cut through the monitor
  const crane: Vec3 = [mid[0] * out, Math.max(mid[1], 4) + 2.5, mid[2] * out];
  return [from, { pos: crane, look: [0, 2.6, 0], fov: Math.max(from.fov, to.fov) + 6 }, to];
}
