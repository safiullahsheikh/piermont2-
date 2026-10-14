// The Kunsthalle floor plan: one source of truth for the 3D building, the camera and the menu's floor plan.
// Metres; y is up, −z is north. The atrium's north wall holds the Void, so nothing is built north of it.

export type Vec3 = [number, number, number];
export type Pose = { pos: Vec3; look: Vec3; fov: number };
export type RoomId = "atrium" | "gallery" | "exhibit" | "wings" | "studio" | "reading" | "desk";
export type Room = {
  id: RoomId;
  no: number;
  label: string;
  punch: string;
  href: string;
  x0: number; z0: number; x1: number; z1: number; h: number;
  stations: Pose[];
};
/** A doorway: `at` is the centre of the opening at floor level, on the wall the two rooms share. */
export type Door = { a: RoomId; b: RoomId; at: Vec3; w: number; h: number };

const EYE = 1.7;
const p = (pos: Vec3, look: Vec3, fov = 45): Pose => ({ pos, look, fov });

/** The Void: a recessed field of Klein blue set into the atrium's north wall. */
export const VOID = { x: 0, y0: 2.2, y1: 12.2, w: 14, z: -15, depth: 2 } as const;
const VOID_MID: Vec3 = [VOID.x, (VOID.y0 + VOID.y1) / 2, VOID.z];

export const ROOMS: Record<RoomId, Room> = {
  atrium: {
    id: "atrium", no: 1, label: "Atrium", punch: "Look closer. It's all ours.", href: "/",
    x0: -15, z0: -15, x1: 15, z1: 15, h: 18,
    stations: [
      p([0, EYE + 0.4, 12.5], [0, 7.4, -15], 50), // 0 hero: the whole hall, the Void dead ahead
      p([-5, 3.2, 6], [1, 7.2, -15], 46), // 1 manifesto: drifting in
      ...[-1.2, 1.2, -0.8, 0.9, -1.1, 1].map((dx, i) =>
        p([dx * 2.2, 5.6 + (i % 2) * 0.4, 3], [dx * 1.1, 6.6, -15], 44)), // 2–7 featured: the piece framed by the Lightbox, studio around it
      p([9, 11.5, 11], [-2, 5, -13], 52), // 8 bento: high up, looking down across the hall
      p([10, 9, 8], [-4, 3, -10], 50), // 9 collection + achievements
      p([0, 3.4, -8], [0, 2.6, 15], 48), // 10 CTA: turn back toward the front desk
    ],
  },
  desk: {
    id: "desk", no: 7, label: "Front Desk", punch: "Your piece goes here.", href: "/contact",
    x0: -8, z0: 15, x1: 8, z1: 30, h: 6,
    stations: [p([0, EYE, 17.5], [0, 1.4, 28]), p([-4, 2.2, 20], [2, 1.2, 28]), p([3, 2.4, 25], [-3, 1.6, 17])],
  },
  gallery: {
    id: "gallery", no: 2, label: "Long Gallery", punch: "Twenty-five rooms of proof.", href: "/work",
    x0: 15, z0: -6, x1: 75, z1: 6, h: 8,
    stations: [p([18, EYE, 0], [72, 2.4, 0], 50), p([34, EYE, 2.5], [44, 2.2, -6]), p([52, EYE, -2.5], [62, 2.2, 6]), p([70, EYE, 0], [75, 2.6, 0])],
  },
  exhibit: {
    id: "exhibit", no: 3, label: "Exhibit Room", punch: "One piece. Full attention.", href: "/work",
    x0: 75, z0: -10, x1: 95, z1: 10, h: 9,
    stations: [p([78, EYE, 0], [95, 3.4, 0]), p([86, 2.4, 4], [95, 3.2, -1]), p([90, 2, -6], [80, 2.4, 6])],
  },
  wings: {
    id: "wings", no: 4, label: "The Wings", punch: "Every discipline, framed.", href: "/services",
    x0: -51, z0: -9, x1: -15, z1: 9, h: 8,
    stations: [p([-18, EYE, 0], [-51, 2.4, 0], 50), p([-30, EYE, 4], [-40, 2.2, -9]), p([-46, EYE, -4], [-36, 2.2, 9])],
  },
  studio: {
    id: "studio", no: 5, label: "The Workshop", punch: "Where the work gets its nerve.", href: "/studio",
    x0: 15, z0: 6, x1: 35, z1: 26, h: 6,
    stations: [p([25, EYE, 9], [25, 1.6, 26]), p([19, 2.4, 16], [32, 1.2, 22]), p([31, 2, 23], [20, 1.4, 10])],
  },
  reading: {
    id: "reading", no: 6, label: "Reading Room", punch: "Notes from the studio floor.", href: "/journal",
    x0: -35, z0: 9, x1: -15, z1: 29, h: 6,
    stations: [p([-25, EYE, 12], [-25, 1.8, 29]), p([-31, 2.2, 20], [-18, 1.4, 25]), p([-19, 2, 26], [-30, 1.6, 12])],
  },
};

export const ROOM_ORDER: RoomId[] = ["atrium", "gallery", "exhibit", "wings", "studio", "reading", "desk"];

export const DOORS: Door[] = [
  { a: "atrium", b: "desk", at: [0, 0, 15], w: 5, h: 4.5 },
  { a: "atrium", b: "gallery", at: [15, 0, 0], w: 6, h: 6 },
  { a: "gallery", b: "exhibit", at: [75, 0, 0], w: 5, h: 6 },
  { a: "atrium", b: "wings", at: [-15, 0, 0], w: 6, h: 6 },
  { a: "gallery", b: "studio", at: [25, 0, 6], w: 4, h: 4 },
  { a: "wings", b: "reading", at: [-25, 0, 9], w: 4, h: 4 },
];

export function roomForPath(path: string): RoomId {
  if (path.startsWith("/work/")) return "exhibit";
  if (path.startsWith("/work")) return "gallery";
  if (path.startsWith("/services")) return "wings";
  if (path.startsWith("/studio")) return "studio";
  if (path.startsWith("/journal")) return "reading";
  if (path.startsWith("/contact")) return "desk";
  return "atrium";
}

export const doorBetween = (a: RoomId, b: RoomId) => DOORS.find((d) => (d.a === a && d.b === b) || (d.a === b && d.b === a));

/** Rooms to pass through, `from` and `to` included (breadth-first over the doors). */
export function route(from: RoomId, to: RoomId): RoomId[] {
  const prev = new Map<RoomId, RoomId | null>([[from, null]]);
  const queue: RoomId[] = [from];
  while (queue.length) {
    const r = queue.shift()!;
    if (r === to) break;
    for (const d of DOORS) {
      const n = d.a === r ? d.b : d.b === r ? d.a : null;
      if (n && !prev.has(n)) { prev.set(n, r); queue.push(n); }
    }
  }
  const out: RoomId[] = [];
  for (let r: RoomId | null | undefined = to; r; r = prev.get(r)) out.unshift(r);
  return out[0] === from ? out : [from];
}

export { VOID_MID };
