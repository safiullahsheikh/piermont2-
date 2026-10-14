import { ROOMS, doorBetween, type Pose, type RoomId, type Vec3 } from "./plan.ts";

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

const centre = (id: RoomId) => { const r = ROOMS[id]; return [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2]; };

/** A walk from one pose to another through the doorways of `rooms` (as returned by `route`). */
export function walk(from: Pose, rooms: RoomId[], to: Pose): Pose[] {
  const out: Pose[] = [from];
  for (let i = 0; i + 1 < rooms.length; i++) {
    const d = doorBetween(rooms[i], rooms[i + 1]);
    if (!d) continue;
    const r = ROOMS[rooms[i]];
    const [ax, az] = centre(rooms[i]), [bx, bz] = centre(rooms[i + 1]);
    // Doors on an east/west wall are crossed along x; on a north/south wall, along z.
    const alongX = d.at[0] === r.x0 || d.at[0] === r.x1;
    const dir: [number, number] = alongX ? [Math.sign(bx - ax), 0] : [0, Math.sign(bz - az)];
    const at = (k: number): Vec3 => [d.at[0] + dir[0] * k, 1.7, d.at[2] + dir[1] * k];
    const ahead = (k: number): Vec3 => [d.at[0] + dir[0] * (k + 10), 1.8, d.at[2] + dir[1] * (k + 10)];
    out.push({ pos: at(-3), look: ahead(-3), fov: 50 }, { pos: at(0), look: ahead(0), fov: 52 }, { pos: at(3), look: ahead(3), fov: 50 });
  }
  out.push(to);
  return out;
}
