import { test } from "node:test";
import assert from "node:assert/strict";
import { DOORS, ROOMS, VOID, roomForPath, route, type RoomId } from "./plan.ts";
import { poseAt, walk } from "./camera.ts";

const ids = Object.keys(ROOMS) as RoomId[];
const inside = (id: RoomId, [x, y, z]: number[]) => {
  const r = ROOMS[id];
  return x > r.x0 + 0.5 && x < r.x1 - 0.5 && z > r.z0 + 0.5 && z < r.z1 - 0.5 && y > 0.3 && y < r.h - 0.3;
};

test("every station sits inside its room", () => {
  for (const r of Object.values(ROOMS)) for (const s of r.stations) assert.ok(inside(r.id, s.pos), `${r.id} ${s.pos}`);
});

test("rooms never overlap", () => {
  for (const a of ids) for (const b of ids) {
    if (a >= b) continue;
    const A = ROOMS[a], B = ROOMS[b];
    assert.ok(A.x1 <= B.x0 || B.x1 <= A.x0 || A.z1 <= B.z0 || B.z1 <= A.z0, `${a} overlaps ${b}`);
  }
});

test("every door sits on a wall shared by its two rooms, inside both walls' extent", () => {
  for (const d of DOORS) {
    const a = ROOMS[d.a], b = ROOMS[d.b], [x, , z] = d.at;
    const onX = (a.x1 === b.x0 || a.x0 === b.x1) && (x === a.x1 || x === a.x0)
      && z - d.w / 2 >= Math.max(a.z0, b.z0) && z + d.w / 2 <= Math.min(a.z1, b.z1);
    const onZ = (a.z1 === b.z0 || a.z0 === b.z1) && (z === a.z1 || z === a.z0)
      && x - d.w / 2 >= Math.max(a.x0, b.x0) && x + d.w / 2 <= Math.min(a.x1, b.x1);
    assert.ok(onX || onZ, `${d.a}-${d.b}`);
    assert.ok(d.h < Math.min(a.h, b.h), `${d.a}-${d.b} taller than a room`);
  }
});

test("the building is connected", () => {
  for (const id of ids) assert.equal(route("atrium", id).at(-1), id);
});

test("routes map to rooms", () => {
  assert.equal(roomForPath("/"), "atrium");
  assert.equal(roomForPath("/work"), "gallery");
  assert.equal(roomForPath("/work/augen-pro"), "exhibit");
  assert.equal(roomForPath("/services/branding"), "wings");
  assert.equal(roomForPath("/studio"), "studio");
  assert.equal(roomForPath("/journal/x"), "reading");
  assert.equal(roomForPath("/contact"), "desk");
});

test("poseAt hits stations exactly and clamps", () => {
  const s = ROOMS.atrium.stations;
  assert.deepEqual(poseAt(s, 0).pos, s[0].pos);
  assert.deepEqual(poseAt(s, 3).pos, s[3].pos);
  assert.deepEqual(poseAt(s, s.length - 1).pos, s.at(-1)!.pos);
  assert.deepEqual(poseAt(s, 99).pos, s.at(-1)!.pos);
  assert.deepEqual(poseAt(s, -2).pos, s[0].pos);
});

test("the atrium camera stays inside the hall and in front of the Void at every scroll position", () => {
  const s = ROOMS.atrium.stations;
  for (let u = 0; u <= s.length - 1; u += 0.01) {
    const pos = poseAt(s, u).pos;
    assert.ok(inside("atrium", pos), `u=${u.toFixed(2)} ${pos}`);
    assert.ok(pos[2] > VOID.z + 1, `u=${u.toFixed(2)} inside the Void`);
  }
});

test("walks between rooms pass through each door opening", () => {
  for (const to of ids) {
    const rooms = route("atrium", to);
    const path = walk(ROOMS.atrium.stations[0], rooms, ROOMS[to].stations[0]);
    for (let i = 0; i + 1 < rooms.length; i++) {
      const d = DOORS.find((x) => (x.a === rooms[i] && x.b === rooms[i + 1]) || (x.b === rooms[i] && x.a === rooms[i + 1]))!;
      assert.ok(path.some((q) => Math.hypot(q.pos[0] - d.at[0], q.pos[2] - d.at[2]) < 0.01 && q.pos[1] < d.h), `${d.a}-${d.b}`);
    }
  }
});
