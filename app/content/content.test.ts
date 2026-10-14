import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { PROJECTS } from "./projects.ts";
import { WINGS, projectsIn } from "./wings.ts";
import { BRANDS, LOCATIONS, REVIEWS, SOCIALS } from "../site.ts";

test("every project belongs to exactly one wing", () => {
  assert.equal(WINGS.reduce((n, w) => n + projectsIn(w).length, 0), PROJECTS.length);
  for (const w of WINGS) assert.ok(projectsIn(w).length > 0, w.slug);
});

test("carry-forward data is intact", () => {
  assert.deepEqual(REVIEWS.map((r) => r.label), ["Bark", "Trustpilot", "Google Reviews", "Clutch"]);
  assert.deepEqual(SOCIALS.map((s) => s.label), ["Instagram", "LinkedIn"]);
  assert.equal(LOCATIONS.length, 2);
  assert.equal(BRANDS.length, 12);
  for (const b of BRANDS) assert.ok(existsSync(`public/brands/${b.slug}.png`), b.slug);
  for (const p of PROJECTS) assert.ok(existsSync(`public${p.image}`), p.image);
});
