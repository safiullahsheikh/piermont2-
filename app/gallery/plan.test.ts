import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENES, SCREEN, sceneForPath } from "./plan.ts";
import { flight, poseAt } from "./camera.ts";

test("routes map to scenes", () => {
  assert.equal(sceneForPath("/"), "home");
  assert.equal(sceneForPath("/work"), "work");
  assert.equal(sceneForPath("/work/augen-pro"), "project");
  assert.equal(sceneForPath("/services/branding"), "services");
  assert.equal(sceneForPath("/journal/x"), "journal");
  assert.equal(sceneForPath("/contact"), "contact");
  assert.equal(sceneForPath("/credits"), "home");
});

test("no station sits inside the monitor", () => {
  for (const s of Object.values(SCENES)) for (const { pos: [x, y, z] } of s.stations) {
    assert.ok(!(Math.abs(x) < 2.2 && y < 5 && z < SCREEN.z + 0.3 && z > -3), `${s.id} ${x},${y},${z}`);
  }
});

test("a flight starts and ends on its shots and clears the monitor", () => {
  const a = SCENES.home.stations[1], b = SCENES.studio.stations[0];
  const f = flight(a, b);
  assert.deepEqual(poseAt(f, 0), a);
  assert.deepEqual(poseAt(f, f.length - 1), b);
  assert.ok(Math.hypot(f[1].pos[0], f[1].pos[2]) >= 12.9);
});
