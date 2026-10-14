# Piermont World — Foundation + Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One persistent, procedurally generated Three.js world (night harbor → sunrise summit) behind the homepage, driven by scroll, with an opt-in sound layer, a launch loader, and graceful fallbacks.

**Architecture:** A single `<World/>` client component in the root layout owns one fixed `<canvas>`. Pure logic (noise, time of day, camera path, scroll mapping, quality tiers, terrain shape) lives in small `.ts` files with `node --test` tests. Scene modules (`sky`, `ocean`, `pier`, `lighthouse`, `fog`, `lanterns`, `boats`, `terrain`, `clouds`) each export `create(ctx) → { update(frame), dispose() }`, and nothing outside `app/world/` imports Three.js. Pages opt in by marking sections with `data-station="<name>"`.

**Tech Stack:** Next.js 16.3 (App Router), React 19.2, Tailwind 4, three (+ `three/addons`), gsap 3.13+ (ScrollTrigger, SplitText), lenis, Web Audio API, Node 24 built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-14-world-foundation-and-home-design.md`

## Global Constraints

- New runtime dependencies: `three`, `gsap`, `lenis` only. Dev dependency: `@types/three`. No R3F, no drei, no test framework.
- No git: the user declined it. There are no commit steps. Task 1 makes a file backup instead.
- 100% procedural 3D: no GLB/GLTF models, no HDRIs, no image textures for the world (project images on boat sails are content, not world textures).
- World JS ≤ 220 KB gzipped, loaded after the page is interactive (`import()` inside an effect).
- Canvas DPR cap: 1.75 (high), 1.5 (medium), 1.25 (low).
- FPS targets: 60 on the high tier at 1440×900; ≥ 45 on the low tier.
- Lenis: `duration: 1.15`, `touchMultiplier: 1.4`.
- Entrance ease: `expo.out`. Text entrances: blur 6px → 0, 1.1s, word stagger 0.05s.
- Sound is off unless the visitor picks "Set sail with sound". The choice persists in `localStorage["piermont:sound"]`.
- `prefers-reduced-motion`, `?gl=off`, software renderers, and 2+ GL context losses within 3 days all mean no canvas, so stills are shown instead.
- HTML content never waits on the world.
- Pages without `data-station` elements keep their current look, and the canvas is hidden on them.
- Before writing Next-specific code, read the matching guide in `node_modules/next/dist/docs/` (AGENTS.md rule).

## Deviations from the spec (decided while planning; flag to the user)

1. **Water** uses three's `Water` addon (normal-mapped plane with real planar reflections of the pier, lighthouse, lanterns and boats) with a procedurally generated normal map, instead of Gerstner displacement. A calm harbor reads as more realistic with true reflections than with displaced geometry.
2. **Section order** follows the current DOM order: Hero → Video → Projects → Services → Testimonials → Stories → Contact → Footer. Stations therefore run `pier-end → lighthouse-lens → fleet → lantern-0…5 → landfall (testimonials) → ridge-dawn (stories) → summit (contact) → cloud-sea (footer)`.
3. **Projects** keeps its existing stacked-card scroll mechanics (already polished). Instead of a cover-flow rewrite, the active card drives the active boat in the scene, which then plays that project's video on its sail.
4. **Low drifting clouds** become a second cloud-sea layer 25 units above the first, for parallax.
5. **Sound toggle** floats bottom-right instead of sitting in the header. `HeroHeader` is shared by every page, so putting it there would change pages outside this scope.
6. **"Click a lantern to fly to it"** is dropped. The canvas is `pointer-events: none` so the content stays usable, and the camera already glides to each lantern as its card scrolls in.
7. **Camera flights between pages** are deferred to sub-project #2, which is where a second world page first exists.

---

## File map

```
app/world/
  lib/noise.ts            pure: seeded value noise, tiling fBm, ridged multifractal
  lib/noise.test.ts
  lib/timeOfDay.ts        pure: t → sky/light/fog state
  lib/timeOfDay.test.ts
  lib/terrainShape.ts     pure: terrainHeight(x, z), PEAK
  lib/path.ts             pure: samplePath, scrollToParam
  lib/path.test.ts
  lib/stations.ts         pure: station table, lantern/boat positions, service colors
  lib/stations.test.ts    cameras never go under terrain or water
  lib/quality.ts          pure: tier selection, downgrade, GL gate
  lib/quality.test.ts
  lib/readout.ts          pure: camera state → HUD values
  lib/readout.test.ts
  store.ts                tiny pub-sub (phase, readout, sound) + per-frame bus
  engine/glsl.ts          shared GLSL: hash, noise3, fbm3, fog
  engine/textures.ts      canvas-painted textures (water normals, wood, tower, moon, glow)
  engine/post.ts          composer: render → bloom → output → grade
  engine/rig.ts           damped camera + pointer/tilt parallax
  engine/scroll.ts        Lenis + ScrollTrigger + station anchors → u
  engine/world.ts         createWorld(): renderer, scene, modules, loop, public API
  scene/types.ts          Ctx, Frame, Module
  scene/sky.ts  scene/ocean.ts  scene/pier.ts  scene/lighthouse.ts  scene/fog.ts
  scene/lanterns.ts  scene/boats.ts  scene/terrain.ts  scene/clouds.ts
  sound/audio.ts          Web Audio graph + procedural ambience and SFX
  World.tsx               client mount point (root layout)
  Loader.tsx              launch screen (replaces components/LoadingScreen.tsx on world pages)
  Signature.tsx           self-writing script logo (SVG generated in Task 12)
  SummitSignature.tsx     gold signature written by scroll at the summit
  magnetic.ts             [data-magnetic] pointer pull
  Readout.tsx             HUD
  SoundToggle.tsx
  Stills.tsx              fallback backgrounds
  world.css               all world + dark-home styles, scoped under .world-home / .world-*
app/components/HomeHero.tsx       new hero (replaces GlitchHeadline + HeroComputer on home)
app/components/HomeVideo.tsx      modify: porthole
app/components/ServicesSection.tsx modify: station markers + active lantern
app/components/ProjectsSection.tsx modify: active boat
app/page.tsx                      modify: stations, world-home wrapper
app/layout.tsx                    modify: mount <World/>
scripts/trace-signature.py        PNG → self-writing SVG data
public/world/stills/*.webp        fallback frames (Task 15)
```

---

### Task 1: Dependencies, backup, test runner

**Files:**
- Modify: `package.json` (scripts + deps)
- Modify: `tsconfig.json` (`allowImportingTsExtensions`)

**Interfaces:**
- Produces: `npm test` runs every `app/world/**/*.test.ts` with Node's runner.

- [ ] **Step 1: Back up the current app (no git)**

```bash
cd "C:/Users/mytha/onedrive/desktop/piermont/piermont-main"
mkdir -p "../piermont-backup-2026-10-14"
cp -r app public package.json package-lock.json "../piermont-backup-2026-10-14/"
ls "../piermont-backup-2026-10-14"
```
Expected: `app  package-lock.json  package.json  public`

- [ ] **Step 2: Install**

```bash
npm install three gsap lenis
npm install -D @types/three
node -e "console.log(require('three/package.json').version, require('gsap/package.json').version, require('lenis/package.json').version)"
```
Expected: three ≥ 0.17x, gsap ≥ 3.13 (SplitText ships free in the main package from 3.13), lenis ≥ 1.3.

- [ ] **Step 3: Add the test script.** In `package.json` `"scripts"`, add:

```json
"test": "node --test \"app/world/**/*.test.ts\""
```

- [ ] **Step 4: Allow `.ts` import specifiers** (Node's type stripping needs explicit extensions; `noEmit` is already true). In `tsconfig.json` `compilerOptions`, add:

```json
"allowImportingTsExtensions": true,
```

- [ ] **Step 5: Verify the toolchain**

Run: `npx tsc --noEmit && npm run lint`
Expected: both exit 0 (same as before the change).

---

### Task 2: Noise library

**Files:**
- Create: `app/world/lib/noise.ts`
- Test: `app/world/lib/noise.test.ts`

**Interfaces:**
- Produces: `rng(seed): () => number`, `valueNoise2(w, h, seed): (x, y) => number`, `fbm2(octaves, baseCells, seed): (u, v) => number` (tiles on [0,1)), `ridged2(octaves, seed): (x, y) => number`. All return values are in [0,1].

- [ ] **Step 1: Write the failing test**

```ts
// app/world/lib/noise.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { fbm2, ridged2, rng, valueNoise2 } from "./noise.ts";

test("rng is deterministic and in [0,1)", () => {
  const a = rng(42), b = rng(42);
  for (let i = 0; i < 1000; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
});

test("valueNoise2 stays in [0,1] and tiles", () => {
  const n = valueNoise2(8, 8, 3);
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 40 - 20, y = Math.random() * 40 - 20;
    const v = n(x, y);
    assert.ok(v >= 0 && v <= 1, `out of range ${v}`);
    assert.ok(Math.abs(v - n(x + 8, y + 8)) < 1e-9, "not periodic");
  }
});

test("fbm2 tiles across the unit square", () => {
  const f = fbm2(4, 4, 9);
  for (let i = 0; i <= 20; i++) {
    const v = i / 20;
    assert.ok(Math.abs(f(0, v) - f(1, v)) < 1e-9);
    assert.ok(Math.abs(f(v, 0) - f(v, 1)) < 1e-9);
  }
});

test("ridged2 stays in [0,1] and varies", () => {
  const r = ridged2(5, 1);
  let min = 1, max = 0;
  for (let i = 0; i < 2000; i++) {
    const v = r(Math.random() * 50, Math.random() * 50);
    assert.ok(v >= 0 && v <= 1);
    min = Math.min(min, v); max = Math.max(max, v);
  }
  assert.ok(max - min > 0.3, "ridged noise is too flat");
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test`
Expected: FAIL, `Cannot find module ... noise.ts`

- [ ] **Step 3: Implement**

```ts
// app/world/lib/noise.ts
/** Seeded, deterministic noise shared by texture painting and terrain. Pure: no DOM, no three. */

/** xorshift32 → [0,1). */
export function rng(seed: number) {
  let t = seed >>> 0 || 1;
  return () => {
    t ^= t << 13;
    t ^= t >>> 17;
    t ^= t << 5;
    return (t >>> 0) / 4294967296;
  };
}

/** Value noise on a w×h lattice; periodic in x (w) and y (h). */
export function valueNoise2(w: number, h: number, seed: number) {
  const r = rng(seed);
  const g = new Float32Array(w * h);
  for (let i = 0; i < g.length; i++) g[i] = r();
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const x0 = ((xi % w) + w) % w, y0 = ((yi % h) + h) % h;
    const x1 = (x0 + 1) % w, y1 = (y0 + 1) % h;
    const a = g[y0 * w + x0], b = g[y0 * w + x1], c = g[y1 * w + x0], d = g[y1 * w + x1];
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
}

/** Fractal sum of tiling value noise, normalised to [0,1]; tiles on u,v ∈ [0,1). */
export function fbm2(octaves: number, baseCells: number, seed: number) {
  const layers = Array.from({ length: octaves }, (_, o) =>
    valueNoise2(baseCells << o, baseCells << o, seed + o * 101),
  );
  return (u: number, v: number) => {
    let sum = 0, amp = 0.5, norm = 0;
    for (let o = 0; o < octaves; o++) {
      const cells = baseCells << o;
      sum += amp * layers[o](u * cells, v * cells);
      norm += amp;
      amp *= 0.5;
    }
    return sum / norm;
  };
}

/** Ridged multifractal (sharp crests) in [0,1]. Inputs in "noise units"; period 256. */
export function ridged2(octaves: number, seed: number) {
  const layers = Array.from({ length: octaves }, (_, o) => valueNoise2(256, 256, seed + o * 131));
  return (x: number, y: number) => {
    let sum = 0, amp = 0.5, freq = 1, norm = 0, weight = 1;
    for (let o = 0; o < octaves; o++) {
      let n = 1 - Math.abs(layers[o](x * freq, y * freq) * 2 - 1);
      n *= n;
      n *= weight;
      weight = Math.min(1, n * 2);
      sum += n * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return sum / norm;
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: 4 passing.

---

### Task 3: Time of day

**Files:**
- Create: `app/world/lib/timeOfDay.ts`
- Test: `app/world/lib/timeOfDay.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type RGB = [number, number, number];
  type SkyState = { sunElevation: number; exposure: number; fog: RGB; fogDensity: number; stars: number; moon: number;
                    turbidity: number; rayleigh: number; keyColor: RGB; keyIntensity: number; ambient: RGB };
  skyAt(t: number): SkyState   // t clamped to [0,1]
  KEYS: { t: number; s: SkyState }[]
  SUN_AZIMUTH = 180            // degrees; the sun rises in −z, ahead of the summit camera
  ```

- [ ] **Step 1: Write the failing test**

```ts
// app/world/lib/timeOfDay.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { KEYS, skyAt } from "./timeOfDay.ts";

test("endpoints equal the first and last keys", () => {
  assert.deepEqual(skyAt(0), KEYS[0].s);
  assert.deepEqual(skyAt(1), KEYS[KEYS.length - 1].s);
});

test("clamps outside [0,1]", () => {
  assert.deepEqual(skyAt(-3), skyAt(0));
  assert.deepEqual(skyAt(9), skyAt(1));
});

test("the sun only rises and the stars only fade", () => {
  let prev = skyAt(0);
  for (let i = 1; i <= 200; i++) {
    const s = skyAt(i / 200);
    assert.ok(s.sunElevation >= prev.sunElevation - 1e-9);
    assert.ok(s.stars <= prev.stars + 1e-9);
    prev = s;
  }
});

test("every key is visited exactly", () => {
  for (const k of KEYS) assert.deepEqual(skyAt(k.t), k.s);
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

```ts
// app/world/lib/timeOfDay.ts
/** Time of day along the journey: 0 = night harbor, 1 = sunrise above the clouds. */
export type RGB = [number, number, number];
export type SkyState = {
  sunElevation: number; // degrees
  exposure: number;
  fog: RGB;
  fogDensity: number;
  stars: number;
  moon: number;
  turbidity: number;
  rayleigh: number;
  keyColor: RGB; // moonlight at night, sunlight at dawn
  keyIntensity: number;
  ambient: RGB;
};

export const SUN_AZIMUTH = 180;

export const KEYS: { t: number; s: SkyState }[] = [
  { t: 0, s: { sunElevation: -12, exposure: 0.34, fog: [0.018, 0.03, 0.055], fogDensity: 0.0042, stars: 1, moon: 1, turbidity: 2, rayleigh: 0.4, keyColor: [0.3, 0.38, 0.62], keyIntensity: 0.35, ambient: [0.015, 0.022, 0.04] } },
  { t: 0.4, s: { sunElevation: -6, exposure: 0.42, fog: [0.06, 0.09, 0.16], fogDensity: 0.0026, stars: 0.55, moon: 0.7, turbidity: 3, rayleigh: 1.2, keyColor: [0.4, 0.48, 0.75], keyIntensity: 0.4, ambient: [0.04, 0.06, 0.11] } },
  { t: 0.72, s: { sunElevation: -1.5, exposure: 0.55, fog: [0.42, 0.33, 0.38], fogDensity: 0.0012, stars: 0.1, moon: 0.2, turbidity: 6, rayleigh: 2, keyColor: [1, 0.62, 0.45], keyIntensity: 0.9, ambient: [0.16, 0.13, 0.17] } },
  { t: 1, s: { sunElevation: 6, exposure: 0.62, fog: [0.95, 0.68, 0.45], fogDensity: 0.0006, stars: 0, moon: 0, turbidity: 8, rayleigh: 1.6, keyColor: [1, 0.78, 0.55], keyIntensity: 2.2, ambient: [0.3, 0.27, 0.26] } },
];

const smooth = (x: number) => x * x * (3 - 2 * x);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: RGB, b: RGB, k: number): RGB => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];

export function skyAt(t: number): SkyState {
  const x = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < KEYS.length - 2 && x > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  if (x <= a.t) return a.s;
  if (x >= b.t) return b.s;
  const k = smooth((x - a.t) / (b.t - a.t));
  return {
    sunElevation: mix(a.s.sunElevation, b.s.sunElevation, k),
    exposure: mix(a.s.exposure, b.s.exposure, k),
    fog: mix3(a.s.fog, b.s.fog, k),
    fogDensity: mix(a.s.fogDensity, b.s.fogDensity, k),
    stars: mix(a.s.stars, b.s.stars, k),
    moon: mix(a.s.moon, b.s.moon, k),
    turbidity: mix(a.s.turbidity, b.s.turbidity, k),
    rayleigh: mix(a.s.rayleigh, b.s.rayleigh, k),
    keyColor: mix3(a.s.keyColor, b.s.keyColor, k),
    keyIntensity: mix(a.s.keyIntensity, b.s.keyIntensity, k),
    ambient: mix3(a.s.ambient, b.s.ambient, k),
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all passing.

---

### Task 4: Camera path, scroll mapping, terrain shape, stations

**Files:**
- Create: `app/world/lib/path.ts`, `app/world/lib/terrainShape.ts`, `app/world/lib/stations.ts`
- Test: `app/world/lib/path.test.ts`, `app/world/lib/stations.test.ts`

**Interfaces:**
- Consumes: `ridged2` (Task 2).
- Produces:
  ```ts
  // path.ts
  type Vec3 = [number, number, number];
  type Station = { name: string; pos: Vec3; look: Vec3; fov: number; tod: number };
  type Pose = { pos: Vec3; look: Vec3; fov: number; tod: number };
  samplePath(stations: Station[], u: number): Pose
  scrollToParam(anchors: number[], probe: number): number   // → [0,1]
  // terrainShape.ts
  terrainHeight(x: number, z: number): number
  PEAK: { x: number; z: number; y: number }
  CLOUD_Y: number
  // stations.ts
  STATIONS: Record<StationName, Station>
  type StationName = "harbor-fog" | "pier-end" | "lighthouse-lens" | "fleet" | `lantern-${0|1|2|3|4|5}` | "landfall" | "ridge-dawn" | "summit" | "cloud-sea"
  HOME_ORDER: StationName[]           // DOM order on the homepage
  LANTERNS: { pos: Vec3; color: string }[]   // 6, one per service, service order
  BOATS: { pos: Vec3; yaw: number }[]        // 10
  LIGHTHOUSE: { base: Vec3; lamp: Vec3 }
  STATION_LABELS: Record<StationName, string>
  ```

- [ ] **Step 1: Write the failing tests**

```ts
// app/world/lib/path.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { samplePath, scrollToParam, type Station } from "./path.ts";

const S: Station[] = [
  { name: "a", pos: [0, 0, 0], look: [0, 0, -1], fov: 40, tod: 0 },
  { name: "b", pos: [10, 0, 0], look: [10, 0, -1], fov: 50, tod: 0.5 },
  { name: "c", pos: [20, 5, 0], look: [20, 5, -1], fov: 60, tod: 1 },
];

test("hits stations exactly", () => {
  assert.deepEqual(samplePath(S, 0).pos, [0, 0, 0]);
  assert.deepEqual(samplePath(S, 0.5).pos, [10, 0, 0]);
  assert.deepEqual(samplePath(S, 1).pos, [20, 5, 0]);
  assert.equal(samplePath(S, 1).fov, 60);
});

test("is continuous", () => {
  let prev = samplePath(S, 0);
  for (let i = 1; i <= 1000; i++) {
    const p = samplePath(S, i / 1000);
    const d = Math.hypot(p.pos[0] - prev.pos[0], p.pos[1] - prev.pos[1], p.pos[2] - prev.pos[2]);
    assert.ok(d < 0.2, `jump of ${d} at ${i}`);
    prev = p;
  }
});

test("single station and clamping", () => {
  assert.deepEqual(samplePath([S[1]], 0.7).pos, [10, 0, 0]);
  assert.deepEqual(samplePath(S, -1).pos, [0, 0, 0]);
  assert.deepEqual(samplePath(S, 2).pos, [20, 5, 0]);
});

test("scrollToParam maps anchors to evenly spaced params", () => {
  const a = [100, 500, 1300];
  assert.equal(scrollToParam(a, 0), 0);
  assert.equal(scrollToParam(a, 100), 0);
  assert.equal(scrollToParam(a, 300), 0.25);
  assert.equal(scrollToParam(a, 500), 0.5);
  assert.equal(scrollToParam(a, 900), 0.75);
  assert.equal(scrollToParam(a, 5000), 1);
  assert.equal(scrollToParam([200], 900), 0);
  assert.equal(scrollToParam([200, 200, 600], 400), 0.75);
});
```

```ts
// app/world/lib/stations.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { samplePath } from "./path.ts";
import { HOME_ORDER, LANTERNS, PEAK, STATIONS, BOATS } from "./stations.ts";
import { terrainHeight } from "./terrainShape.ts";

const ground = (x: number, z: number) => Math.max(0, terrainHeight(x, z));

test("homepage path never dips under the ground or water", () => {
  const path = HOME_ORDER.map((n) => STATIONS[n]);
  for (let i = 0; i <= 2000; i++) {
    const p = samplePath(path, i / 2000).pos;
    const clearance = p[1] - ground(p[0], p[2]);
    assert.ok(clearance > 1.5, `camera ${clearance.toFixed(2)}m above ground at u=${i / 2000}`);
  }
});

test("time of day never goes backwards along the homepage", () => {
  const path = HOME_ORDER.map((n) => STATIONS[n]);
  for (let i = 1; i < path.length; i++) assert.ok(path[i].tod >= path[i - 1].tod, path[i].name);
});

test("summit camera stands just above the peak", () => {
  const s = STATIONS.summit.pos;
  const clearance = s[1] - terrainHeight(s[0], s[2]);
  assert.ok(clearance > 2 && clearance < 20, `summit clearance ${clearance}`);
  assert.ok(PEAK.y > 300);
});

test("lanterns and boats float on open water", () => {
  for (const l of LANTERNS) assert.ok(terrainHeight(l.pos[0], l.pos[2]) < -1);
  for (const b of BOATS) assert.ok(terrainHeight(b.pos[0], b.pos[2]) < -1);
  assert.equal(LANTERNS.length, 6);
  assert.equal(BOATS.length, 10);
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npm test`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `path.ts`**

```ts
// app/world/lib/path.ts
export type Vec3 = [number, number, number];
export type Station = { name: string; pos: Vec3; look: Vec3; fov: number; tod: number };
export type Pose = { pos: Vec3; look: Vec3; fov: number; tod: number };

function catmull(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const t2 = t * t, t3 = t2 * t;
  const out: Vec3 = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    out[k] = 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t +
      (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
      (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
  }
  return out;
}

/** u ∈ [0,1] spans the whole station list; station i sits at u = i/(n-1). */
export function samplePath(stations: Station[], u: number): Pose {
  const n = stations.length;
  const s0 = stations[0];
  if (n === 1) return { pos: [...s0.pos], look: [...s0.look], fov: s0.fov, tod: s0.tod };
  const x = Math.min(1, Math.max(0, u)) * (n - 1);
  const i = Math.min(n - 2, Math.floor(x));
  const t = x - i;
  const at = (j: number) => stations[Math.min(n - 1, Math.max(0, j))];
  const a = at(i - 1), b = at(i), c = at(i + 1), d = at(i + 2);
  if (t === 0) return { pos: [...b.pos], look: [...b.look], fov: b.fov, tod: b.tod };
  if (t === 1) return { pos: [...c.pos], look: [...c.look], fov: c.fov, tod: c.tod };
  return {
    pos: catmull(a.pos, b.pos, c.pos, d.pos, t),
    look: catmull(a.look, b.look, c.look, d.look, t),
    fov: b.fov + (c.fov - b.fov) * t,
    tod: b.tod + (c.tod - b.tod) * t,
  };
}

/** anchors: document-y of each station (ascending); probe: scrollY + innerHeight/2. */
export function scrollToParam(anchors: number[], probe: number): number {
  const n = anchors.length;
  if (n < 2 || probe <= anchors[0]) return 0;
  if (probe >= anchors[n - 1]) return 1;
  let i = 0;
  while (i < n - 2 && probe >= anchors[i + 1]) i++;
  const span = Math.max(1e-6, anchors[i + 1] - anchors[i]);
  return (i + (probe - anchors[i]) / span) / (n - 1);
}
```

Note on the last assertion of the scroll test: `[200, 200, 600]` with probe 400 → the loop skips the zero-length span to i = 1, giving `(1 + 200/400) / 2 = 0.75` (no division by zero).

- [ ] **Step 4: Implement `terrainShape.ts`**

```ts
// app/world/lib/terrainShape.ts
import { ridged2 } from "./noise.ts";

const ridge = ridged2(6, 1717);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Massif centred at (0, −1100). The shore starts at z = −300; nearer than that, the seabed is at −8. */
export function terrainHeight(x: number, z: number): number {
  const dx = x / 700, dz = (z + 1100) / 650;
  const m0 = Math.max(0, 1 - Math.sqrt(dx * dx + dz * dz));
  const massif = m0 * m0 * (3 - 2 * m0);
  const r = ridge(x / 420 + 20, z / 420 + 20);
  const land = smooth(-300, -420, z);
  return (massif * 330 + r * 140 * (0.35 + massif)) * land - 8 * (1 - land);
}

function findPeak() {
  let best = { x: 0, z: -1100, y: -Infinity };
  for (let x = -160; x <= 160; x += 4)
    for (let z = -1260; z <= -940; z += 4) {
      const y = terrainHeight(x, z);
      if (y > best.y) best = { x, z, y };
    }
  return best;
}

export const PEAK = findPeak();
export const CLOUD_Y = Math.round(PEAK.y * 0.6);
```

- [ ] **Step 5: Implement `stations.ts`**

```ts
// app/world/lib/stations.ts
import type { Station, Vec3 } from "./path.ts";
import { PEAK, terrainHeight } from "./terrainShape.ts";

export { PEAK };

export type StationName =
  | "harbor-fog" | "pier-end" | "lighthouse-lens" | "fleet"
  | "lantern-0" | "lantern-1" | "lantern-2" | "lantern-3" | "lantern-4" | "lantern-5"
  | "landfall" | "ridge-dawn" | "summit" | "cloud-sea";

/** Service order matches components/ServicesSection SERVICES. */
export const SERVICE_COLORS = ["#ff7a59", "#f5c26b", "#6fd3c6", "#8f7cff", "#7fd07a", "#5ab0ff"] as const;

export const LIGHTHOUSE = { base: [26, 0, -110] as Vec3, lamp: [26, 31, -110] as Vec3 };

export const LANTERNS = SERVICE_COLORS.map((color, i) => ({
  pos: [-30 + i * 12, 0.6, -140 - (i % 2) * 14 - i * 4] as Vec3,
  color,
}));

export const BOATS = Array.from({ length: 10 }, (_, i) => ({
  pos: [(i % 2 ? 1 : -1) * (14 + (i >> 1) * 8), 0, -196 - i * 7] as Vec3,
  yaw: (i % 2 ? -1 : 1) * (0.5 + (i % 3) * 0.15),
}));

const above = (x: number, z: number, h: number): Vec3 => [x, Math.max(0, terrainHeight(x, z)) + h, z];
const lanternStation = (i: number): Station => {
  const p = LANTERNS[i].pos;
  return { name: `lantern-${i}`, pos: [p[0] + 3, p[1] + 3.2, p[2] + 12], look: [p[0], p[1] + 0.8, p[2]], fov: 42, tod: 0.26 + i * 0.028 };
};

export const STATIONS: Record<StationName, Station> = {
  "harbor-fog": { name: "harbor-fog", pos: [0, 4, 30], look: [0, 3, -60], fov: 50, tod: 0 },
  "pier-end": { name: "pier-end", pos: [1.5, 3.6, -58], look: [0, 4, -200], fov: 45, tod: 0.04 },
  "lighthouse-lens": { name: "lighthouse-lens", pos: [14, 30, -96], look: LIGHTHOUSE.lamp, fov: 38, tod: 0.1 },
  fleet: { name: "fleet", pos: [-10, 8, -168], look: [0, 3, -240], fov: 50, tod: 0.2 },
  "lantern-0": lanternStation(0),
  "lantern-1": lanternStation(1),
  "lantern-2": lanternStation(2),
  "lantern-3": lanternStation(3),
  "lantern-4": lanternStation(4),
  "lantern-5": lanternStation(5),
  landfall: { name: "landfall", pos: above(0, -330, 40), look: [PEAK.x, PEAK.y * 0.55, PEAK.z], fov: 55, tod: 0.5 },
  "ridge-dawn": { name: "ridge-dawn", pos: above(60, -760, 45), look: [PEAK.x, PEAK.y, PEAK.z], fov: 50, tod: 0.7 },
  summit: { name: "summit", pos: [PEAK.x, PEAK.y + 6, PEAK.z + 4], look: [PEAK.x, PEAK.y - 10, PEAK.z - 1600], fov: 52, tod: 0.92 },
  "cloud-sea": { name: "cloud-sea", pos: [PEAK.x, PEAK.y + 40, PEAK.z - 60], look: [PEAK.x, PEAK.y * 0.55, PEAK.z - 1600], fov: 60, tod: 1 },
};

export const HOME_ORDER: StationName[] = [
  "pier-end", "lighthouse-lens", "fleet",
  "lantern-0", "lantern-1", "lantern-2", "lantern-3", "lantern-4", "lantern-5",
  "landfall", "ridge-dawn", "summit", "cloud-sea",
];

export const STATION_LABELS: Record<StationName, string> = {
  "harbor-fog": "Harbor", "pier-end": "End of the pier", "lighthouse-lens": "Lighthouse", fleet: "The fleet",
  "lantern-0": "Brand Identity", "lantern-1": "Strategy", "lantern-2": "Design & Innovation",
  "lantern-3": "AI Systems", "lantern-4": "SEO", "lantern-5": "Development",
  landfall: "Landfall", "ridge-dawn": "The ridge", summit: "Summit", "cloud-sea": "Above the clouds",
};
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: all passing. If `homepage path never dips` fails, the message gives `u` and clearance. Raise that station's `above(..., h)` height or move its x away from the ridge, then re-run. Do not loosen the test.

---

### Task 5: Quality tiers and HUD readout

**Files:**
- Create: `app/world/lib/quality.ts`, `app/world/lib/readout.ts`
- Test: `app/world/lib/quality.test.ts`, `app/world/lib/readout.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // quality.ts
  type Tier = "high" | "medium" | "low";
  type Probe = { webgl2: boolean; renderer: string; memory?: number; coarse: boolean };
  type TierSpec = { dpr: number; reflection: number; terrainSeg: number; stars: number; bloom: boolean; fogLayers: number };
  TIERS: Record<Tier, TierSpec>
  pickTier(p: Probe): Tier | null           // null → no WebGL
  downgrade(tier: Tier, fps: number[]): Tier // median < 50 → one step down
  glAllowed(search: string, lost: { n: number; t: number } | null, now: number, reducedMotion: boolean): boolean
  // readout.ts
  type Readout = { mode: "sea" | "alt"; heading: number; knots: number; tide: number; lat: number; lon: number; alt: number; temp: number };
  readout(pos: Vec3, prevPos: Vec3, dt: number, forward: Vec3, time: number, onLand: boolean): Readout
  formatReadout(r: Readout): string[]   // e.g. ["HDG 042°", "3.2 KN", "TIDE +1.4 M", "41.0423°N"]
  ```

- [ ] **Step 1: Write the failing tests**

```ts
// app/world/lib/quality.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { downgrade, glAllowed, pickTier } from "./quality.ts";

test("software renderers get no GL", () => {
  assert.equal(pickTier({ webgl2: true, renderer: "Google SwiftShader", coarse: false }), null);
  assert.equal(pickTier({ webgl2: true, renderer: "llvmpipe (LLVM 15)", coarse: false }), null);
});

test("tier picks", () => {
  assert.equal(pickTier({ webgl2: true, renderer: "Apple M2", coarse: false }), "high");
  assert.equal(pickTier({ webgl2: false, renderer: "Intel HD", coarse: false }), "medium");
  assert.equal(pickTier({ webgl2: true, renderer: "Adreno 730", coarse: true, memory: 8 }), "medium");
  assert.equal(pickTier({ webgl2: true, renderer: "Mali-G57", coarse: true, memory: 4 }), "low");
  assert.equal(pickTier({ webgl2: false, renderer: "", coarse: true }), "low");
});

test("downgrade on low median fps only", () => {
  assert.equal(downgrade("high", [60, 58, 61, 59]), "high");
  assert.equal(downgrade("high", [40, 42, 70, 39]), "medium");
  assert.equal(downgrade("low", [20, 20, 20]), "low");
});

test("GL gate", () => {
  const now = 1_000_000_000;
  assert.equal(glAllowed("", null, now, false), true);
  assert.equal(glAllowed("?gl=off", null, now, false), false);
  assert.equal(glAllowed("", null, now, true), false);
  assert.equal(glAllowed("", { n: 2, t: now - 1000 }, now, false), false);
  assert.equal(glAllowed("", { n: 2, t: now - 4 * 864e5 }, now, false), true);
  assert.equal(glAllowed("?gl=force", { n: 5, t: now }, now, true), true);
});
```

```ts
// app/world/lib/readout.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatReadout, readout } from "./readout.ts";

test("heading follows the forward vector", () => {
  const r = readout([0, 3, 0], [0, 3, 1], 1, [0, 0, -1], 0, false);
  assert.equal(Math.round(r.heading), 0);
  assert.equal(Math.round(readout([0, 3, 0], [0, 3, 0], 1, [1, 0, 0], 0, false).heading), 90);
});

test("speed in knots from displacement", () => {
  const r = readout([0, 3, -10], [0, 3, 0], 2, [0, 0, -1], 0, false); // 5 m/s
  assert.ok(Math.abs(r.knots - 9.72) < 0.05);
});

test("land mode reports altitude and lapse-rate temperature", () => {
  const r = readout([0, 400, -1100], [0, 400, -1100], 1, [0, 0, -1], 0, true);
  assert.equal(r.mode, "alt");
  assert.equal(r.alt, 1280);
  assert.ok(Math.abs(r.temp - (12 - 1280 * 0.0065)) < 1e-9);
  assert.deepEqual(formatReadout(r).slice(0, 1), ["ALT 1,280 M"]);
});

test("sea formatting", () => {
  const f = formatReadout({ mode: "sea", heading: 42.4, knots: 3.21, tide: 1.4, lat: 41.04231, lon: -73.9187, alt: 0, temp: 0 });
  assert.deepEqual(f, ["HDG 042°", "3.2 KN", "TIDE +1.4 M", "41.0423°N 73.9187°W"]);
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npm test`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `quality.ts`**

```ts
// app/world/lib/quality.ts
export type Tier = "high" | "medium" | "low";
export type Probe = { webgl2: boolean; renderer: string; memory?: number; coarse: boolean };
export type TierSpec = { dpr: number; reflection: number; terrainSeg: number; stars: number; bloom: boolean; fogLayers: number };

export const TIERS: Record<Tier, TierSpec> = {
  high: { dpr: 1.75, reflection: 1024, terrainSeg: 384, stars: 4000, bloom: true, fogLayers: 4 },
  medium: { dpr: 1.5, reflection: 512, terrainSeg: 256, stars: 2500, bloom: true, fogLayers: 3 },
  low: { dpr: 1.25, reflection: 256, terrainSeg: 160, stars: 1200, bloom: false, fogLayers: 2 },
};

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function pickTier(p: Probe): Tier | null {
  if (SOFTWARE.test(p.renderer)) return null;
  if (p.coarse) return p.webgl2 && (p.memory ?? 4) > 4 ? "medium" : "low";
  return p.webgl2 ? "high" : "medium";
}

export function downgrade(tier: Tier, fps: number[]): Tier {
  const s = [...fps].sort((a, b) => a - b);
  const median = s[Math.floor(s.length / 2)] ?? 60;
  if (median >= 50) return tier;
  return tier === "high" ? "medium" : "low";
}

const THREE_DAYS = 3 * 864e5;

export function glAllowed(search: string, lost: { n: number; t: number } | null, now: number, reducedMotion: boolean) {
  if (/[?&]gl=force\b/.test(search)) return true;
  if (/[?&]gl=off\b/.test(search) || reducedMotion) return false;
  return !(lost && lost.n >= 2 && now - lost.t < THREE_DAYS);
}
```

- [ ] **Step 4: Implement `readout.ts`**

```ts
// app/world/lib/readout.ts
import type { Vec3 } from "./path.ts";

export type Readout = { mode: "sea" | "alt"; heading: number; knots: number; tide: number; lat: number; lon: number; alt: number; temp: number };

const HOME = { lat: 41.0423, lon: -73.9187 }; // Piermont pier, NY
const METERS_PER_UNIT = 3.2; // the peak (~440 units) reads as ~1,400 m

export function readout(pos: Vec3, prev: Vec3, dt: number, forward: Vec3, time: number, onLand: boolean): Readout {
  const heading = ((Math.atan2(forward[0], -forward[2]) * 180) / Math.PI + 360) % 360;
  const speed = Math.hypot(pos[0] - prev[0], pos[2] - prev[2]) / Math.max(dt, 1e-3);
  const lat = HOME.lat - pos[2] / 111_000;
  const lon = HOME.lon + pos[0] / (111_000 * Math.cos((HOME.lat * Math.PI) / 180));
  const alt = Math.round(pos[1] * METERS_PER_UNIT);
  return {
    mode: onLand ? "alt" : "sea",
    heading,
    knots: speed * 1.944,
    tide: 1.4 + Math.sin(time * 0.05) * 0.3,
    lat,
    lon,
    alt,
    temp: 12 - alt * 0.0065,
  };
}

export function formatReadout(r: Readout): string[] {
  if (r.mode === "alt") {
    return [`ALT ${r.alt.toLocaleString("en-US")} M`, `TEMP ${r.temp >= 0 ? "+" : "−"}${Math.abs(r.temp).toFixed(1)} °C`];
  }
  return [
    `HDG ${String(Math.round(r.heading) % 360).padStart(3, "0")}°`,
    `${r.knots.toFixed(1)} KN`,
    `TIDE ${r.tide >= 0 ? "+" : "−"}${Math.abs(r.tide).toFixed(1)} M`,
    `${r.lat.toFixed(4)}°N ${Math.abs(r.lon).toFixed(4)}°W`,
  ];
}
```

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: all passing.

---

### Task 6: Engine skeleton: store, renderer, post, loop, World mount, sky

This is the first task with pixels. The deliverable is a night sky with stars, moon and graded post-processing behind a test page.

**Files:**
- Create: `app/world/store.ts`, `app/world/engine/glsl.ts`, `app/world/engine/textures.ts`, `app/world/engine/post.ts`, `app/world/engine/world.ts`, `app/world/scene/types.ts`, `app/world/scene/sky.ts`, `app/world/World.tsx`, `app/world/world.css`
- Modify: `app/layout.tsx` (mount `<World/>`)

**Interfaces:**
- Consumes: `skyAt`, `SUN_AZIMUTH` (Task 3); `TIERS`, `pickTier`, `downgrade`, `glAllowed` (Task 5); `fbm2`, `rng` (Task 2).
- Produces:
  ```ts
  // store.ts
  type Phase = "off" | "loading" | "ready" | "launching" | "flying" | "fallback";
  type WorldState = { phase: Phase; lines: string[]; label: string; sound: boolean; activeStation: string };
  store.get(): WorldState; store.set(p: Partial<WorldState>): void; store.subscribe(fn: () => void): () => void
  frameBus.emit(f: { lens: { x: number; y: number; r: number } | null }): void; frameBus.on(fn): () => void
  // scene/types.ts
  type Ctx = { scene: Scene; renderer: WebGLRenderer; camera: PerspectiveCamera; tier: TierSpec;
               light: { dir: Vector3; color: Color; ambient: Color; moonDir: Vector3; sunDir: Vector3 };
               fog: { color: Color; density: number } };
  type Frame = { time: number; dt: number; tod: number; sky: SkyState; ignition: number; u: number };
  type Module = { update(f: Frame): void; dispose(): void; setActive?(i: number): void };
  // engine/world.ts
  createWorld(canvas: HTMLCanvasElement, tier: Tier): Promise<WorldApi>
  type WorldApi = { setPose(p: Pose): void; snap(): void; setTod(t: number): void; setIgnition(x: number): void;
                    setU(u: number): void; setActive(kind: "lantern" | "boat", i: number): void;
                    dispose(): void }   // Task 11 replaces setTod with follow() and adds setRunning()
  ```

- [ ] **Step 1: Read the Next 16 guides this task touches**

Run: `ls node_modules/next/dist/docs/01-app/01-getting-started node_modules/next/dist/docs/01-app/02-guides | head -80` and read `lazy-loading.md` plus the layouts guide. Confirm that a client component rendered in `app/layout.tsx` survives navigations and that `next/dynamic` with `ssr:false` is only allowed in a client file.

- [ ] **Step 2: `store.ts`**

```ts
// app/world/store.ts
export type Phase = "off" | "loading" | "ready" | "launching" | "flying" | "fallback";
export type WorldState = { phase: Phase; lines: string[]; label: string; sound: boolean; activeStation: string };

let state: WorldState = { phase: "off", lines: [], label: "", sound: false, activeStation: "" };
const subs = new Set<() => void>();

export const store = {
  get: () => state,
  set(p: Partial<WorldState>) {
    state = { ...state, ...p };
    subs.forEach((f) => f());
  },
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => void subs.delete(fn);
  },
};

type FrameInfo = { lens: { x: number; y: number; r: number } | null };
const frameSubs = new Set<(f: FrameInfo) => void>();
/** Per-frame data for DOM effects that must move in lockstep with the canvas (no React state). */
export const frameBus = {
  emit: (f: FrameInfo) => frameSubs.forEach((fn) => fn(f)),
  on(fn: (f: FrameInfo) => void) {
    frameSubs.add(fn);
    return () => void frameSubs.delete(fn);
  },
};
```

- [ ] **Step 3: `engine/glsl.ts`**

```ts
// app/world/engine/glsl.ts
/** Shared GLSL. Custom ShaderMaterials output linear colour; OutputPass applies ACES + sRGB. */
export const NOISE = /* glsl */ `
float hash13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float noise3(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm3(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * noise3(p); p = p * 2.02 + 17.1; a *= 0.5; } return s; }
`;

export const FOG = /* glsl */ `
uniform vec3 uFogColor; uniform float uFogDensity;
vec3 applyFog(vec3 col, float dist){ float f = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist); return mix(col, uFogColor, clamp(f, 0.0, 1.0)); }
`;
```

- [ ] **Step 4: `engine/textures.ts`**

```ts
// app/world/engine/textures.ts
import * as THREE from "three";
import { fbm2, rng } from "../lib/noise.ts";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function tex(c: HTMLCanvasElement, color: boolean, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Tileable water normal map: two fBm bands, finite-difference normals. */
export function waterNormals(size = 512) {
  const f = fbm2(5, 4, 11), g = fbm2(4, 9, 23);
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) h[y * size + x] = f(x / size, y / size) * 0.7 + g(x / size, y / size) * 0.3;
  const [c, ctx] = canvas(size, size);
  const img = ctx.createImageData(size, size);
  const at = (x: number, y: number) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 9, dy = (at(x, y + 1) - at(x, y - 1)) * 9;
      const l = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
      img.data[i] = (-dx / l * 0.5 + 0.5) * 255;
      img.data[i + 1] = (-dy / l * 0.5 + 0.5) * 255;
      img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  return tex(c, false);
}

/** Weathered planks: long grain along v, knots, salt bleaching. */
export function woodTexture(size = 512) {
  const grain = fbm2(4, 3, 5), fine = fbm2(3, 24, 7), r = rng(99);
  const [c, ctx] = canvas(size, size);
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      const g = grain(u * 0.25, v) * 0.6 + fine(u, v * 0.08) * 0.4;
      const band = 0.5 + 0.5 * Math.sin((u * 18 + g * 6) * Math.PI);
      const base = 0.22 + band * 0.1 + g * 0.12;
      const i = (y * size + x) * 4;
      img.data[i] = base * 255 * 1.02;
      img.data[i + 1] = base * 255 * 0.86;
      img.data[i + 2] = base * 255 * 0.7;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  for (let k = 0; k < 14; k++) {
    const x = r() * size, y = r() * size, rad = 4 + r() * 8;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, "rgba(25,16,10,0.75)");
    grd.addColorStop(1, "rgba(25,16,10,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return tex(c, true);
}

/** Lighthouse tower: white with two red bands, rain streaks and grime at the base. */
export function towerTexture() {
  const w = 256, h = 1024;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = "#e9e4da";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#a3282a";
  ctx.fillRect(0, h * 0.18, w, h * 0.14);
  ctx.fillRect(0, h * 0.52, w, h * 0.14);
  const r = rng(4);
  for (let i = 0; i < 260; i++) {
    const x = r() * w, y = r() * h * 0.9, len = 20 + r() * 160;
    const g = ctx.createLinearGradient(x, y, x, y + len);
    g.addColorStop(0, `rgba(40,36,32,${0.04 + r() * 0.08})`);
    g.addColorStop(1, "rgba(40,36,32,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, 1 + r() * 2, len);
  }
  const base = ctx.createLinearGradient(0, h * 0.75, 0, h);
  base.addColorStop(0, "rgba(30,28,24,0)");
  base.addColorStop(1, "rgba(30,28,24,0.55)");
  ctx.fillStyle = base;
  ctx.fillRect(0, h * 0.75, w, h * 0.25);
  const t = tex(c, true, false);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/** Moon disc with soft maria and a halo. */
export function moonTexture() {
  const s = 256;
  const [c, ctx] = canvas(s, s);
  const halo = ctx.createRadialGradient(s / 2, s / 2, s * 0.12, s / 2, s / 2, s / 2);
  halo.addColorStop(0, "rgba(200,215,255,0.35)");
  halo.addColorStop(1, "rgba(200,215,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, s, s);
  ctx.save();
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.13, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#f4f1e8";
  ctx.fillRect(0, 0, s, s);
  const f = fbm2(4, 4, 31);
  const r = s * 0.13;
  for (let y = -r; y < r; y += 1)
    for (let x = -r; x < r; x += 1) {
      const n = f((x + r) / (2 * r), (y + r) / (2 * r));
      if (n > 0.55) {
        ctx.fillStyle = `rgba(120,118,112,${(n - 0.55) * 1.4})`;
        ctx.fillRect(s / 2 + x, s / 2 + y, 1, 1);
      }
    }
  ctx.restore();
  return tex(c, true, false);
}

/** Soft additive glow used by lamps, lanterns and the lighthouse. */
export function glowTexture() {
  const s = 128;
  const [c, ctx] = canvas(s, s);
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.55)");
  g.addColorStop(0.5, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return tex(c, true, false);
}
```

- [ ] **Step 5: `scene/types.ts`**

```ts
// app/world/scene/types.ts
import type { Color, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import type { SkyState } from "../lib/timeOfDay.ts";
import type { TierSpec } from "../lib/quality.ts";

export type Ctx = {
  scene: Scene;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  tier: TierSpec;
  light: { dir: Vector3; color: Color; ambient: Color; moonDir: Vector3; sunDir: Vector3 };
  fog: { color: Color; density: number };
};
export type Frame = { time: number; dt: number; tod: number; sky: SkyState; ignition: number; u: number };
export type Module = { update(f: Frame): void; dispose(): void; setActive?(i: number): void };
```

- [ ] **Step 6: `scene/sky.ts`** (atmosphere, stars, moon, key light, environment map)

```ts
// app/world/scene/sky.ts
import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { SUN_AZIMUTH } from "../lib/timeOfDay.ts";
import { moonTexture } from "../engine/textures.ts";
import type { Ctx, Module } from "./types.ts";

const MOON_ELEVATION = 24, MOON_AZIMUTH = 205;

function dirFrom(elevDeg: number, azDeg: number, out: THREE.Vector3) {
  const phi = THREE.MathUtils.degToRad(90 - elevDeg), theta = THREE.MathUtils.degToRad(azDeg);
  return out.setFromSphericalCoords(1, phi, theta);
}

export function createSky(ctx: Ctx): Module {
  const sky = new Sky();
  sky.scale.setScalar(9000);
  const su = sky.material.uniforms;
  su.mieCoefficient.value = 0.004;
  su.mieDirectionalG.value = 0.82;
  ctx.scene.add(sky);

  // Stars: upper hemisphere, twinkle, fade with sky.stars.
  const n = ctx.tier.stars;
  const pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3().randomDirection();
    v.y = Math.abs(v.y) * 0.95 + 0.05;
    v.normalize().multiplyScalar(5000);
    pos.set([v.x, v.y, v.z], i * 3);
    seed[i] = Math.random();
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  sg.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const starMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uDpr: { value: ctx.renderer.getPixelRatio() } },
    vertexShader: /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform float uDpr; varying float vA;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.6 + 0.4 * sin(uTime * (0.7 + aSeed * 2.3) + aSeed * 50.0);
        vA = tw * (0.35 + 0.65 * aSeed * aSeed);
        gl_PointSize = (0.8 + aSeed * aSeed * 2.4) * uDpr;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * uOpacity; gl_FragColor = vec4(vec3(0.85, 0.9, 1.0) * a * 2.0, a); }`,
  });
  const stars = new THREE.Points(sg, starMat);
  stars.frustumCulled = false;
  ctx.scene.add(stars);

  const moonMat = new THREE.SpriteMaterial({ map: moonTexture(), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, color: 0xffffff });
  const moon = new THREE.Sprite(moonMat);
  moon.scale.setScalar(900);
  dirFrom(MOON_ELEVATION, MOON_AZIMUTH, ctx.light.moonDir);
  moon.position.copy(ctx.light.moonDir).multiplyScalar(4500);
  ctx.scene.add(moon);

  const key = new THREE.DirectionalLight(0xffffff, 1);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x080808, 1);
  ctx.scene.add(key, key.target, hemi);

  // Environment: re-bake the sky into a PMREM when time of day moves noticeably.
  const pmrem = new THREE.PMREMGenerator(ctx.renderer);
  const envScene = new THREE.Scene();
  const envSky = new Sky();
  envSky.scale.setScalar(9000);
  envScene.add(envSky);
  let envRT: THREE.WebGLRenderTarget | null = null, lastEnvTod = -1;

  const fogColor = new THREE.Color();
  return {
    update(f) {
      const s = f.sky;
      dirFrom(s.sunElevation, SUN_AZIMUTH, ctx.light.sunDir);
      su.sunPosition.value.copy(ctx.light.sunDir);
      su.turbidity.value = s.turbidity;
      su.rayleigh.value = s.rayleigh;
      starMat.uniforms.uTime.value = f.time;
      starMat.uniforms.uOpacity.value = s.stars;
      moonMat.opacity = s.moon;
      stars.position.copy(ctx.camera.position);
      moon.position.copy(ctx.light.moonDir).multiplyScalar(4500).add(ctx.camera.position);

      // Key light: moon at night, crossfading to the sun as it nears the horizon.
      const k = THREE.MathUtils.smoothstep(s.sunElevation, -5, 0);
      ctx.light.dir.copy(ctx.light.moonDir).lerp(ctx.light.sunDir, k).normalize();
      ctx.light.color.setRGB(...s.keyColor);
      ctx.light.ambient.setRGB(...s.ambient);
      key.position.copy(ctx.light.dir).multiplyScalar(500).add(ctx.camera.position);
      key.target.position.copy(ctx.camera.position);
      key.color.copy(ctx.light.color);
      key.intensity = s.keyIntensity * 2.2;
      hemi.color.copy(ctx.light.ambient).multiplyScalar(6);
      hemi.groundColor.setRGB(s.ambient[0] * 1.5, s.ambient[1] * 1.5, s.ambient[2] * 1.5);
      hemi.intensity = 1;

      fogColor.setRGB(...s.fog);
      ctx.fog.color.copy(fogColor);
      ctx.fog.density = s.fogDensity;
      ctx.renderer.toneMappingExposure = s.exposure;

      if (Math.abs(f.tod - lastEnvTod) > 0.015) {
        lastEnvTod = f.tod;
        const eu = envSky.material.uniforms;
        eu.sunPosition.value.copy(ctx.light.sunDir);
        eu.turbidity.value = s.turbidity;
        eu.rayleigh.value = s.rayleigh;
        eu.mieCoefficient.value = 0.004;
        eu.mieDirectionalG.value = 0.82;
        envRT?.dispose();
        envRT = pmrem.fromScene(envScene, 0, 0.1, 10000);
        ctx.scene.environment = envRT.texture;
      }
    },
    dispose() {
      sky.geometry.dispose(); sky.material.dispose();
      sg.dispose(); starMat.dispose();
      moonMat.map?.dispose(); moonMat.dispose();
      envRT?.dispose(); pmrem.dispose();
      envSky.geometry.dispose(); envSky.material.dispose();
      ctx.scene.remove(sky, stars, moon, key, key.target, hemi);
    },
  };
}
```

- [ ] **Step 7: `engine/post.ts`**

```ts
// app/world/engine/post.ts
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import type { TierSpec } from "../lib/quality.ts";

const Grade = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.035 }, uVignette: { value: 0.55 }, uRes: { value: new THREE.Vector2(1, 1) } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime, uGrain, uVignette; uniform vec2 uRes; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5; float r2 = dot(c, c);
      vec2 ca = c * r2 * 0.012;
      vec3 col = vec3(texture2D(tDiffuse, vUv + ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - ca).b);
      col *= 1.0 - uVignette * smoothstep(0.1, 0.9, r2 * 2.2);
      col += (hash(vUv * uRes + fract(uTime) * 97.0) - 0.5) * uGrain;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function createPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, tier: TierSpec) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = tier.bloom ? new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.65, 0.82) : null;
  if (bloom) composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(Grade);
  composer.addPass(grade);
  return {
    composer,
    setSize(w: number, h: number) {
      composer.setSize(w, h);
      grade.uniforms.uRes.value.set(w, h);
    },
    render(time: number) {
      grade.uniforms.uTime.value = time;
      composer.render();
    },
    dispose() { composer.dispose(); },
  };
}
```

- [ ] **Step 8: `engine/world.ts`** (sky only for now; later tasks add one line per module)

```ts
// app/world/engine/world.ts
import * as THREE from "three";
import { skyAt } from "../lib/timeOfDay.ts";
import { downgrade, TIERS, type Tier } from "../lib/quality.ts";
import type { Pose } from "../lib/path.ts";
import { createSky } from "../scene/sky.ts";
import type { Ctx, Frame, Module } from "../scene/types.ts";
import { createPost } from "./post.ts";

export type WorldApi = {
  setPose(p: Pose): void;
  snap(): void;
  setTod(t: number): void;
  setIgnition(x: number): void;
  setU(u: number): void;
  setActive(kind: "lantern" | "boat", i: number): void;
  dispose(): void;
};

export async function createWorld(canvas: HTMLCanvasElement, initialTier: Tier): Promise<WorldApi> {
  let tier = initialTier;
  const spec = TIERS[tier];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier !== "low", powerPreference: "high-performance", alpha: false });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, spec.dpr));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 9000);
  const ctx: Ctx = {
    scene, renderer, camera, tier: spec,
    light: { dir: new THREE.Vector3(0, 1, 0), color: new THREE.Color(), ambient: new THREE.Color(), moonDir: new THREE.Vector3(), sunDir: new THREE.Vector3() },
    fog: { color: new THREE.Color(), density: 0.004 },
  };
  scene.fog = new THREE.FogExp2(0x000000, 0.004);

  const modules: Module[] = [createSky(ctx)];
  const named: Partial<Record<"lantern" | "boat", Module>> = {};

  const post = createPost(renderer, scene, camera, spec);
  const resize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    post.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  const pose: Pose = { pos: [0, 4, 30], look: [0, 3, -60], fov: 50, tod: 0 };
  let tod = 0, ignition = 0, u = 0;
  const look = new THREE.Vector3();
  const applyPose = () => {
    camera.position.set(...pose.pos);
    look.set(...pose.look);
    camera.lookAt(look);
    camera.fov = pose.fov;
    camera.updateProjectionMatrix();
  };

  const clock = new THREE.Clock();
  const fps: number[] = [];
  let raf = 0, running = true, sampled = false;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.1), time = clock.elapsedTime;
    if (!sampled && time > 1.5) {
      fps.push(1 / Math.max(dt, 1e-3));
      if (fps.length >= 90) {
        sampled = true;
        const next = downgrade(tier, fps);
        if (next !== tier) {
          tier = next;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TIERS[tier].dpr));
          resize();
        }
      }
    }
    applyPose();
    const f: Frame = { time, dt, tod, sky: skyAt(tod), ignition, u };
    for (const m of modules) m.update(f);
    (scene.fog as THREE.FogExp2).color.copy(ctx.fog.color);
    (scene.fog as THREE.FogExp2).density = ctx.fog.density;
    post.render(time);
  };
  const onVis = () => {
    running = !document.hidden;
    clock.getDelta();
  };
  document.addEventListener("visibilitychange", onVis);
  frame();

  return {
    setPose(p) { Object.assign(pose, p); tod = p.tod; },
    snap() { applyPose(); },
    setTod(t) { tod = t; },
    setIgnition(x) { ignition = x; },
    setU(x) { u = x; },
    setActive(kind, i) { named[kind]?.setActive?.(i); },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      modules.forEach((m) => m.dispose());
      post.dispose();
      renderer.dispose();
    },
  };
}
```

- [ ] **Step 9: `World.tsx`** (mount point; for now it just shows the sky on pages with stations)

```tsx
// app/world/World.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { glAllowed, pickTier } from "./lib/quality.ts";
import { store } from "./store.ts";
import "./world.css";

const LOST_KEY = "piermont:gl-lost";

function readLost() {
  try { return JSON.parse(localStorage.getItem(LOST_KEY) || "null") as { n: number; t: number } | null; } catch { return null; }
}
function markLost() {
  try {
    const l = readLost();
    localStorage.setItem(LOST_KEY, JSON.stringify({ n: (l?.n ?? 0) + 1, t: Date.now() }));
  } catch {}
}

function probe() {
  const c = document.createElement("canvas");
  const gl2 = c.getContext("webgl2");
  const gl = gl2 || c.getContext("webgl");
  if (!gl) return null;
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return pickTier({
    webgl2: !!gl2,
    renderer,
    memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    coarse: matchMedia("(pointer: coarse)").matches,
  });
}

/** One canvas for the whole site. Pages opt in with [data-station] elements. */
export function World() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<import("./engine/world.ts").WorldApi | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const stations = document.querySelectorAll("[data-station]");
    const active = stations.length > 0;
    root.classList.toggle("world-on", active);
    if (!active) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!glAllowed(location.search, readLost(), Date.now(), reduced)) {
      store.set({ phase: "fallback" });
      return;
    }
    const tier = probe();
    if (!tier) {
      store.set({ phase: "fallback" });
      return;
    }
    if (apiRef.current) return;

    let cancelled = false;
    const canvas = canvasRef.current!;
    const onLost = (e: Event) => {
      e.preventDefault();
      markLost();
      store.set({ phase: "fallback" });
    };
    canvas.addEventListener("webglcontextlost", onLost);
    store.set({ phase: "loading" });
    import("./engine/world.ts").then(async ({ createWorld }) => {
      if (cancelled) return;
      apiRef.current = await createWorld(canvas, tier);
      store.set({ phase: "ready" });
    });
    return () => {
      cancelled = true;
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, [pathname]);

  useEffect(() => () => apiRef.current?.dispose(), []);

  return <canvas ref={canvasRef} className="world-canvas" aria-hidden="true" />;
}
```

- [ ] **Step 10: `world.css`** (start of the file; later tasks append)

```css
/* app/world/world.css — styles for the 3D world and the dark world pages. */
.world-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100svh;
  z-index: 0;
  display: none;
  pointer-events: none;
}
html.world-on .world-canvas { display: block; }
html.world-on body { background: #04060b; color: #eef1f6; }
html.world-on { scroll-behavior: auto; }
.world-home { position: relative; z-index: 1; }
```

- [ ] **Step 11: Mount in the root layout.** In `app/layout.tsx`, add `import { World } from "./world/World";` and render `<World />` as the first child of `<body>` (before `<LoadingScreen />`).

- [ ] **Step 12: Temporary check page.** Create `app/world-test/page.tsx`:

```tsx
export default function WorldTest() {
  return <main className="world-home" style={{ height: "300vh" }}><div data-station="harbor-fog" /></main>;
}
```

- [ ] **Step 13: Verify in a browser**

Run: `npm run dev`, open `http://localhost:3000/world-test`.
Expected: a deep-blue night sky full of twinkling stars and a moon with a soft halo, subtle grain and vignette, and no console errors. `http://localhost:3000/` is unchanged (canvas hidden). `?gl=off` shows a plain dark page.
Run: `npx tsc --noEmit && npm run lint`. Expected: exit 0.

---

### Task 7: Ocean

**Files:**
- Create: `app/world/scene/ocean.ts`
- Modify: `app/world/engine/world.ts` (register module)

**Interfaces:**
- Consumes: `Ctx`, `Frame`, `Module` (Task 6); `waterNormals` (Task 6).
- Produces: `createOcean(ctx): Module`.

- [ ] **Step 1: Implement**

```ts
// app/world/scene/ocean.ts
import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { waterNormals } from "../engine/textures.ts";
import type { Ctx, Module } from "./types.ts";

export function createOcean(ctx: Ctx): Module {
  const size = ctx.tier.reflection;
  const water = new Water(new THREE.PlaneGeometry(9000, 9000), {
    textureWidth: size,
    textureHeight: size,
    waterNormals: waterNormals(),
    sunDirection: new THREE.Vector3(0, 1, 0),
    sunColor: 0xffffff,
    waterColor: 0x02121c,
    distortionScale: 2.4,
    fog: true,
    alpha: 1,
  });
  water.rotation.x = -Math.PI / 2;
  ctx.scene.add(water);
  const u = water.material.uniforms;
  u.size.value = 2.6;
  const glint = new THREE.Color();

  return {
    update(f) {
      u.time.value += f.dt * 0.32;
      // The glitter path follows the key light: the moon at night, the sun at dawn.
      u.sunDirection.value.copy(ctx.light.dir);
      glint.copy(ctx.light.color).multiplyScalar(0.6 + f.sky.keyIntensity * 0.5);
      u.sunColor.value.copy(glint);
      u.waterColor.value.setRGB(0.008 + f.tod * 0.03, 0.05 + f.tod * 0.05, 0.08 + f.tod * 0.04);
      // Follow the camera so the plane never ends; snap to the normal map's tile size to avoid swimming.
      water.position.x = Math.round(ctx.camera.position.x / 50) * 50;
      water.position.z = Math.round(ctx.camera.position.z / 50) * 50;
    },
    dispose() {
      ctx.scene.remove(water);
      water.geometry.dispose();
      water.material.uniforms.normalSampler.value.dispose();
      water.material.dispose();
    },
  };
}
```

- [ ] **Step 2: Register.** In `engine/world.ts`, import `createOcean` and change `const modules: Module[] = [createSky(ctx)];` to `const modules: Module[] = [createSky(ctx), createOcean(ctx)];`.

- [ ] **Step 3: Verify in a browser.** Open `/world-test`.
Expected: dark water to the horizon with a moving moon glitter path, soft wave normals with no visible tiling at the camera height of 4 m, and stars reflected faintly. Snapping x/z to 50 must produce no visible jump (the tiling period divides 50). If a jump shows, set the snap to `9000 / 2.6 / 512`-aligned values or remove the follow (9 km is wide enough for the harbor).

---

### Task 8: Pier, lighthouse, fog banks

**Files:**
- Create: `app/world/scene/pier.ts`, `app/world/scene/lighthouse.ts`, `app/world/scene/fog.ts`
- Modify: `app/world/engine/world.ts` (register)

**Interfaces:**
- Consumes: `LIGHTHOUSE` (Task 4), `NOISE`, `FOG` (Task 6), `woodTexture`, `towerTexture`, `glowTexture` (Task 6).
- Produces: `createPier(ctx)`, `createLighthouse(ctx)` (beam strength = `f.ignition × (1 − smoothstep(.55,.75,tod))`), `createFog(ctx)`.

- [ ] **Step 1: `pier.ts`**

```ts
// app/world/scene/pier.ts
import * as THREE from "three";
import { glowTexture, woodTexture } from "../engine/textures.ts";
import { rng } from "../lib/noise.ts";
import type { Ctx, Module } from "./types.ts";

const START = 12, END = -70, DECK_Y = 2.2, HALF_W = 2.1;

export function createPier(ctx: Ctx): Module {
  const group = new THREE.Group();
  const r = rng(77);
  const wood = woodTexture();
  const mat = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.88, metalness: 0, envMapIntensity: 0.35 });

  // Planks, laid across the pier with tiny height and yaw jitter.
  const plank = new THREE.BoxGeometry(HALF_W * 2 + 0.2, 0.1, 0.3);
  const count = Math.floor((START - END) / 0.34);
  const planks = new THREE.InstancedMesh(plank, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
  const tint = new THREE.Color();
  for (let i = 0; i < count; i++) {
    p.set((r() - 0.5) * 0.06, DECK_Y + (r() - 0.5) * 0.03, START - i * 0.34);
    e.set((r() - 0.5) * 0.01, (r() - 0.5) * 0.015, (r() - 0.5) * 0.012);
    m.compose(p, q.setFromEuler(e), s);
    planks.setMatrixAt(i, m);
    planks.setColorAt(i, tint.setHSL(0.07, 0.25, 0.42 + r() * 0.18));
  }
  group.add(planks);

  // Pylons every 4 m on both sides, 7 m tall, sunk into the water.
  const pylonGeo = new THREE.CylinderGeometry(0.2, 0.26, 7.5, 12);
  const rows = Math.floor((START - END) / 4) + 1;
  const pylons = new THREE.InstancedMesh(pylonGeo, mat, rows * 2);
  for (let i = 0; i < rows; i++)
    for (const side of [-1, 1]) {
      p.set(side * HALF_W, DECK_Y - 3.6, START - i * 4);
      e.set((r() - 0.5) * 0.03, r() * 6, (r() - 0.5) * 0.03);
      m.compose(p, q.setFromEuler(e), s);
      pylons.setMatrixAt(i * 2 + (side > 0 ? 1 : 0), m);
    }
  group.add(pylons);

  // Railing posts and sagging rope.
  const postGeo = new THREE.BoxGeometry(0.12, 1.1, 0.12);
  const posts = new THREE.InstancedMesh(postGeo, mat, rows * 2);
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x5a4a38, roughness: 1 });
  for (const side of [-1, 1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < rows; i++) {
      const z = START - i * 4;
      p.set(side * (HALF_W - 0.05), DECK_Y + 0.55, z);
      m.compose(p, q.identity(), s);
      posts.setMatrixAt(i * 2 + (side > 0 ? 1 : 0), m);
      pts.push(new THREE.Vector3(side * (HALF_W - 0.05), DECK_Y + 1.05, z));
      if (i < rows - 1) pts.push(new THREE.Vector3(side * (HALF_W - 0.05), DECK_Y + 0.85, z - 2));
    }
    const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), rows * 8, 0.025, 5), ropeMat);
    group.add(rope);
  }
  group.add(posts);

  // Lamp posts every 16 m alternating sides; warm glow sprites plus one real light at the pier end.
  const glow = glowTexture();
  const lampMat = new THREE.SpriteMaterial({ map: glow, color: 0xffb36b, blending: THREE.AdditiveBlending, depthWrite: false, fog: true });
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, 3.2, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.5, metalness: 0.8 });
  const sprites: THREE.Sprite[] = [];
  for (let z = START - 4, k = 0; z > END; z -= 16, k++) {
    const x = (k % 2 ? 1 : -1) * (HALF_W + 0.1);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, DECK_Y + 1.6, z);
    const lamp = new THREE.Sprite(lampMat);
    lamp.position.set(x, DECK_Y + 3.25, z);
    lamp.scale.setScalar(1.6);
    sprites.push(lamp);
    group.add(pole, lamp);
  }
  const endLight = new THREE.PointLight(0xffa860, 14, 26, 1.6);
  endLight.position.set(0, DECK_Y + 3, END + 3);
  group.add(endLight);

  ctx.scene.add(group);
  return {
    update(f) {
      const flicker = 0.92 + Math.sin(f.time * 13.1) * 0.03 + Math.sin(f.time * 7.3) * 0.04;
      for (const sp of sprites) sp.scale.setScalar(1.6 * flicker);
      endLight.intensity = 14 * flicker * (1 - f.tod * 0.6);
    },
    dispose() {
      ctx.scene.remove(group);
      [plank, pylonGeo, postGeo, poleGeo].forEach((g) => g.dispose());
      group.traverse((o) => { if (o instanceof THREE.Mesh && o.geometry instanceof THREE.TubeGeometry) o.geometry.dispose(); });
      [mat, ropeMat, poleMat, lampMat].forEach((x) => x.dispose());
      wood.dispose(); glow.dispose();
    },
  };
}
```

- [ ] **Step 2: `lighthouse.ts`**

```ts
// app/world/scene/lighthouse.ts
import * as THREE from "three";
import { NOISE } from "../engine/glsl.ts";
import { glowTexture, towerTexture } from "../engine/textures.ts";
import { LIGHTHOUSE } from "../lib/stations.ts";
import { fbm2 } from "../lib/noise.ts";
import type { Ctx, Module } from "./types.ts";

const BEAM_LEN = 320;

export function createLighthouse(ctx: Ctx): Module {
  const g = new THREE.Group();
  g.position.set(...LIGHTHOUSE.base);

  // Rock island: displaced icosahedron, flattened.
  const rockGeo = new THREE.IcosahedronGeometry(11, 4);
  const n = fbm2(4, 3, 3);
  const pa = rockGeo.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  for (let i = 0; i < pa.count; i++) {
    v.fromBufferAttribute(pa, i);
    const d = 0.75 + n((v.x / 22 + 0.5) % 1, (v.z / 22 + 0.5 + v.y / 44) % 1) * 0.6;
    v.multiplyScalar(d);
    v.y = v.y * 0.35 - 1.2;
    pa.setXYZ(i, v.x, v.y, v.z);
  }
  rockGeo.computeVertexNormals();
  const rock = new THREE.Mesh(rockGeo, new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.96, flatShading: true }));
  g.add(rock);

  // Tower: tapered lathe profile.
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; prof.push(new THREE.Vector2(4.2 - t * 1.6, 1.5 + t * 26)); }
  const tower = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), new THREE.MeshStandardMaterial({ map: towerTexture(), roughness: 0.7 }));
  g.add(tower);

  const metal = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.4, metalness: 0.9 });
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.35, 48), metal);
  gallery.position.y = 27.7;
  const rail = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.05, 6, 64), metal);
  rail.rotation.x = Math.PI / 2;
  rail.position.y = 28.7;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.7, 2.4, 32), metal);
  roof.position.y = 33.3;
  const lampRoom = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, 3.6, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffc070, emissiveIntensity: 0, transparent: true, opacity: 0.55, roughness: 0.1 }),
  );
  lampRoom.position.y = 30;
  g.add(gallery, rail, roof, lampRoom);

  const glowMat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffd9a0, blending: THREE.AdditiveBlending, depthWrite: false });
  const lamp = new THREE.Sprite(glowMat);
  lamp.position.y = 31;
  lamp.scale.setScalar(9);
  g.add(lamp);
  const light = new THREE.PointLight(0xffc98a, 0, 90, 1.4);
  light.position.y = 31;
  g.add(light);

  // Volumetric-looking beams: two open cones, additive, noise-modulated.
  const beamGeo = new THREE.ConeGeometry(26, BEAM_LEN, 48, 1, true);
  beamGeo.translate(0, -BEAM_LEN / 2, 0);
  beamGeo.rotateZ(Math.PI / 2); // apex at origin, opening along +x
  const beamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uStrength: { value: 0 }, uColor: { value: new THREE.Color(1, 0.86, 0.62) } },
    vertexShader: /* glsl */ `
      varying float vAlong; varying vec3 vWorld; varying vec3 vN;
      void main(){
        vAlong = clamp(position.x / ${BEAM_LEN.toFixed(1)}, 0.0, 1.0);
        vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${NOISE}
      uniform float uTime, uStrength; uniform vec3 uColor;
      varying float vAlong; varying vec3 vWorld; varying vec3 vN;
      void main(){
        vec3 V = normalize(cameraPosition - vWorld);
        float edge = pow(abs(dot(normalize(vN), V)), 1.6);
        float dust = 0.45 + 0.55 * fbm3(vWorld * 0.035 + vec3(uTime * 0.12, 0.0, uTime * 0.07));
        float fall = pow(1.0 - vAlong, 2.2) * smoothstep(0.0, 0.02, vAlong);
        float a = edge * dust * fall * uStrength * 0.55;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
  const beams = new THREE.Group();
  beams.position.y = 31;
  const b1 = new THREE.Mesh(beamGeo, beamMat), b2 = new THREE.Mesh(beamGeo, beamMat);
  b2.rotation.y = Math.PI;
  beams.add(b1, b2);
  g.add(beams);

  ctx.scene.add(g);
  const lampMat = lampRoom.material as THREE.MeshStandardMaterial;
  return {
    update(f) {
      const on = f.ignition * (1 - THREE.MathUtils.smoothstep(f.tod, 0.55, 0.75));
      beams.rotation.y += f.dt * 0.38;
      beamMat.uniforms.uTime.value = f.time;
      beamMat.uniforms.uStrength.value = on;
      lampMat.emissiveIntensity = 3 * f.ignition;
      glowMat.opacity = f.ignition;
      lamp.scale.setScalar(9 + Math.sin(f.time * 2) * 0.4);
      light.intensity = 60 * f.ignition;
    },
    dispose() {
      ctx.scene.remove(g);
      g.traverse((o) => {
        if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); }
      });
      glowMat.map?.dispose(); glowMat.dispose();
    },
  };
}
```

- [ ] **Step 3: `fog.ts`** (drifting harbor fog banks, gone by landfall)

```ts
// app/world/scene/fog.ts
import * as THREE from "three";
import { FOG, NOISE } from "../engine/glsl.ts";
import type { Ctx, Module } from "./types.ts";

export function createFog(ctx: Ctx): Module {
  const mats: THREE.ShaderMaterial[] = [];
  const geo = new THREE.PlaneGeometry(900, 900);
  geo.rotateX(-Math.PI / 2);
  const group = new THREE.Group();
  for (let i = 0; i < ctx.tier.fogLayers; i++) {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: {
        uTime: { value: 0 }, uOpacity: { value: 0 }, uSeed: { value: i * 13.7 },
        uLight: { value: new THREE.Color() }, uFogColor: { value: new THREE.Color() }, uFogDensity: { value: 0 },
      },
      vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        ${NOISE}
        ${FOG}
        uniform float uTime, uOpacity, uSeed; uniform vec3 uLight; varying vec3 vW;
        void main(){
          float d = fbm3(vec3(vW.xz * 0.012 + vec2(uTime * 0.01, uTime * 0.004), uSeed + uTime * 0.02));
          float a = smoothstep(0.42, 0.78, d) * uOpacity;
          float dist = length(vW - cameraPosition);
          a *= smoothstep(4.0, 30.0, dist) * (1.0 - smoothstep(250.0, 420.0, dist));
          vec3 col = uFogColor * 2.2 + uLight * 0.08;
          gl_FragColor = vec4(col, a);
        }`,
    });
    mats.push(mat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 1.2 + i * 1.6;
    group.add(mesh);
  }
  ctx.scene.add(group);
  return {
    update(f) {
      const thick = 1 - THREE.MathUtils.smoothstep(f.tod, 0.3, 0.48);
      group.position.set(ctx.camera.position.x, 0, ctx.camera.position.z);
      group.visible = thick > 0.001;
      for (const m of mats) {
        m.uniforms.uTime.value = f.time;
        m.uniforms.uOpacity.value = 0.32 * thick;
        m.uniforms.uLight.value.copy(ctx.light.color);
        m.uniforms.uFogColor.value.copy(ctx.fog.color);
        m.uniforms.uFogDensity.value = ctx.fog.density;
      }
    },
    dispose() {
      ctx.scene.remove(group);
      geo.dispose();
      mats.forEach((m) => m.dispose());
    },
  };
}
```

Note: the fog banks follow the camera in world xz, so the noise must be sampled in world space (`vW`). That's already the case, so the banks stay put while the camera moves.

- [ ] **Step 4: Register** all three in `engine/world.ts`. Fog goes last, because it is transparent:
`[createSky(ctx), createOcean(ctx), createPier(ctx), createLighthouse(ctx), createFog(ctx)]`.

- [ ] **Step 5: Temporary ignition.** In `engine/world.ts`, set `let ignition = new URLSearchParams(location.search).has("lit") ? 1 : 0;` so the beam can be checked before the loader exists. Task 12 removes this line.

- [ ] **Step 6: Verify in a browser.** Open `/world-test?lit`.
Expected: you stand at the pier head looking down a lamp-lit wooden pier. A red-and-white lighthouse sits on a rock, its rotating beams sweep through drifting fog, and the pier, lighthouse and beams reflect in the water.
Professionalism checks:
- No z-fighting on the planks.
- No hard fog-plane edges where layers intersect the pylons. If you see seams, lower `uOpacity` or raise the `smoothstep(4.0, 30.0)` near fade.
- The beam has no visible cone rim. If it does, raise the `edge` exponent.

---

### Task 9: Lanterns and boats

**Files:**
- Create: `app/world/scene/lanterns.ts`, `app/world/scene/boats.ts`
- Modify: `app/world/engine/world.ts` (register, wire `named`)

**Interfaces:**
- Consumes: `LANTERNS`, `BOATS` (Task 4); `PROJECTS` from `app/work/projects.ts` (`image`, `video?`).
- Produces: `createLanterns(ctx): Module` with `setActive(i)`; `createBoats(ctx): Module` with `setActive(i)`.

- [ ] **Step 1: `lanterns.ts`**

```ts
// app/world/scene/lanterns.ts
import * as THREE from "three";
import { glowTexture } from "../engine/textures.ts";
import { LANTERNS } from "../lib/stations.ts";
import type { Ctx, Module } from "./types.ts";

export function createLanterns(ctx: Ctx): Module {
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    prof.push(new THREE.Vector2(0.18 + Math.sin(t * Math.PI) * 0.42, t * 1.3));
  }
  const geo = new THREE.LatheGeometry(prof, 24);
  const glow = glowTexture();
  const items = LANTERNS.map((l, i) => {
    const color = new THREE.Color(l.color);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: color }, uPower: { value: 1 } },
      vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vW;
        void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uPower; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
        void main(){
          float ribs = 0.75 + 0.25 * smoothstep(0.2, 0.0, abs(fract(vUv.y * 9.0) - 0.5));
          float facing = pow(abs(dot(normalize(vN), normalize(cameraPosition - vW))), 0.7);
          vec3 col = uColor * (0.6 + 1.6 * facing) * ribs * uPower + vec3(1.0, 0.9, 0.7) * facing * 0.6 * uPower;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const body = new THREE.Mesh(geo, mat);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(4);
    halo.position.y = 0.65;
    const g = new THREE.Group();
    g.add(body, halo);
    g.position.set(...l.pos);
    ctx.scene.add(g);
    return { g, mat, halo, color };
  });
  const light = new THREE.PointLight(0xffffff, 0, 18, 1.5);
  ctx.scene.add(light);
  let active = -1;

  return {
    setActive(i) { active = i; },
    update(f) {
      items.forEach((it, i) => {
        const bob = Math.sin(f.time * 0.9 + i * 1.7);
        it.g.position.y = LANTERNS[i].pos[1] + bob * 0.12;
        it.g.rotation.z = Math.sin(f.time * 0.7 + i) * 0.05;
        const target = i === active ? 1.8 : 1;
        it.mat.uniforms.uPower.value += (target - it.mat.uniforms.uPower.value) * (1 - Math.exp(-f.dt * 4));
        it.halo.material.opacity = 0.55 * it.mat.uniforms.uPower.value;
      });
      if (active >= 0) {
        const it = items[active];
        light.color.copy(it.color);
        light.position.copy(it.g.position).y += 0.7;
        light.intensity += (22 - light.intensity) * (1 - Math.exp(-f.dt * 4));
      } else light.intensity *= Math.exp(-f.dt * 4);
    },
    dispose() {
      items.forEach((it) => { ctx.scene.remove(it.g); it.mat.dispose(); it.halo.material.dispose(); });
      ctx.scene.remove(light);
      geo.dispose(); glow.dispose();
    },
  };
}
```

- [ ] **Step 2: `boats.ts`**

```ts
// app/world/scene/boats.ts
import * as THREE from "three";
import { PROJECTS } from "../../work/projects";
import { BOATS } from "../lib/stations.ts";
import type { Ctx, Module } from "./types.ts";

function hullGeometry() {
  const g = new THREE.BoxGeometry(2.4, 1.1, 7, 6, 3, 16);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    const y = p.getY(i), z = p.getZ(i);
    const bow = Math.max(0, z / 3.5);
    x *= (1 - bow * bow * 0.96) * (y < 0 ? 0.55 + (y + 0.55) * 0.8 : 1);
    p.setXYZ(i, x, y + bow * bow * 0.35, z);
  }
  g.computeVertexNormals();
  return g;
}

export function createBoats(ctx: Ctx): Module {
  const hull = hullGeometry();
  const mast = new THREE.CylinderGeometry(0.06, 0.08, 8, 8);
  const sailGeo = new THREE.PlaneGeometry(3.6, 5.4, 10, 14);
  const sp = sailGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i);
    sp.setZ(i, Math.sin(((x + 1.8) / 3.6) * Math.PI) * 0.55);
  }
  sailGeo.computeVertexNormals();

  const hullMat = new THREE.MeshStandardMaterial({ color: 0x0f1620, roughness: 0.55, metalness: 0.1 });
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x2b2018, roughness: 0.8 });
  const loader = new THREE.TextureLoader();
  let loaded = false;
  const boats = BOATS.map((b, i) => {
    const sailMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: 0.9, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0 });
    const g = new THREE.Group();
    const h = new THREE.Mesh(hull, hullMat);
    const m = new THREE.Mesh(mast, mastMat);
    m.position.set(0, 4.3, -0.4);
    const s = new THREE.Mesh(sailGeo, sailMat);
    s.position.set(0, 4.6, -0.4);
    s.rotation.y = Math.PI / 2;
    g.add(h, m, s);
    g.position.set(...b.pos);
    g.rotation.y = b.yaw;
    ctx.scene.add(g);
    return { g, sailMat, project: PROJECTS[i] };
  });

  let active = -1, video: HTMLVideoElement | null = null, videoTex: THREE.VideoTexture | null = null;
  const stopVideo = () => {
    video?.pause();
    videoTex?.dispose();
    video = null;
    videoTex = null;
  };

  return {
    setActive(i) {
      if (i === active) return;
      if (active >= 0) {
        const prev = boats[active];
        prev.sailMat.emissiveMap = prev.sailMat.map;
        prev.sailMat.needsUpdate = true;
      }
      stopVideo();
      active = i;
      const b = boats[i];
      if (!b?.project?.video) return;
      video = document.createElement("video");
      Object.assign(video, { src: b.project.video, muted: true, loop: true, playsInline: true, crossOrigin: "anonymous" });
      video.play().catch(() => {});
      videoTex = new THREE.VideoTexture(video);
      videoTex.colorSpace = THREE.SRGBColorSpace;
      b.sailMat.emissiveMap = videoTex;
      b.sailMat.needsUpdate = true;
    },
    update(f) {
      // Sail images load once the fleet is close (the second station on the homepage).
      if (!loaded && f.u > 0.05) {
        loaded = true;
        boats.forEach((b) => {
          if (!b.project) return;
          loader.load(b.project.image, (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            b.sailMat.map = t;
            b.sailMat.emissiveMap ??= t;
            b.sailMat.needsUpdate = true;
          });
        });
      }
      boats.forEach((b, i) => {
        b.g.position.y = Math.sin(f.time * 0.8 + i) * 0.12;
        b.g.rotation.z = Math.sin(f.time * 0.6 + i * 2) * 0.04;
        b.g.rotation.x = Math.sin(f.time * 0.5 + i) * 0.02;
        const target = i === active ? 1.1 : 0.35;
        b.sailMat.emissiveIntensity += (target - b.sailMat.emissiveIntensity) * (1 - Math.exp(-f.dt * 3));
      });
    },
    dispose() {
      stopVideo();
      boats.forEach((b) => { ctx.scene.remove(b.g); b.sailMat.map?.dispose(); b.sailMat.dispose(); });
      [hull, mast, sailGeo].forEach((g) => g.dispose());
      hullMat.dispose(); mastMat.dispose();
    },
  };
}
```

- [ ] **Step 3: Register and wire `named`** in `engine/world.ts`:

```ts
const lanterns = createLanterns(ctx), boats = createBoats(ctx);
named.lantern = lanterns;
named.boat = boats;
const modules: Module[] = [createSky(ctx), createOcean(ctx), createPier(ctx), createLighthouse(ctx), lanterns, boats, createFog(ctx)];
```

- [ ] **Step 4: Verify in a browser.** Temporarily change `/world-test`'s station to `<div data-station="fleet" />`. Rendering a specific station needs the pose wiring from Task 11, so for now set `const pose` in `world.ts` to `STATIONS.fleet` by hand, check, then revert.
Expected:
- Ten boats bob at anchor, their sails showing project images that glow softly.
- The six colored paper lanterns float and reflect in the water.
- Calling `setActive("boat", 0)` from the console (`window.__world = api` during the check only) starts the video on that sail.

---

### Task 10: Mountain and clouds

**Files:**
- Create: `app/world/scene/terrain.ts`, `app/world/scene/clouds.ts`
- Modify: `app/world/engine/world.ts` (register)

**Interfaces:**
- Consumes: `terrainHeight`, `CLOUD_Y` (Task 4), `NOISE`, `FOG` (Task 6).
- Produces: `createTerrain(ctx): Module`, `createClouds(ctx): Module`.

- [ ] **Step 1: `terrain.ts`**

```ts
// app/world/scene/terrain.ts
import * as THREE from "three";
import { FOG, NOISE } from "../engine/glsl.ts";
import { terrainHeight } from "../lib/terrainShape.ts";
import type { Ctx, Module } from "./types.ts";

export function createTerrain(ctx: Ctx): Module {
  const seg = ctx.tier.terrainSeg;
  const geo = new THREE.PlaneGeometry(2600, 2400, seg, seg);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -1350);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, terrainHeight(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uLightDir: { value: ctx.light.dir }, uLightColor: { value: ctx.light.color }, uAmbient: { value: ctx.light.ambient },
      uKey: { value: 1 }, uFogColor: { value: ctx.fog.color }, uFogDensity: { value: 0 },
    },
    vertexShader: /* glsl */ `varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normal; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${NOISE}
      ${FOG}
      uniform vec3 uLightDir, uLightColor, uAmbient; uniform float uKey;
      varying vec3 vW; varying vec3 vN;
      void main(){
        vec3 N = normalize(vN);
        float n = fbm3(vW * 0.02), d = fbm3(vW * 0.18);
        // Micro relief: bend the normal with detail noise so slopes don't look smooth.
        N = normalize(N + vec3(d - 0.5, 0.0, fbm3(vW * 0.18 + 9.0) - 0.5) * 0.35);
        float slope = 1.0 - clamp(N.y, 0.0, 1.0);
        vec3 rock = mix(vec3(0.11, 0.105, 0.1), vec3(0.3, 0.28, 0.26), fbm3(vW * 0.05));
        vec3 grass = mix(vec3(0.06, 0.08, 0.045), vec3(0.16, 0.18, 0.1), n);
        vec3 snow = vec3(0.9, 0.93, 0.98);
        float snowLine = 290.0 + n * 50.0 - slope * 110.0;
        float snowAmt = smoothstep(snowLine - 14.0, snowLine + 14.0, vW.y) * (1.0 - smoothstep(0.6, 0.78, slope));
        float grassAmt = (1.0 - smoothstep(0.22, 0.42, slope)) * (1.0 - smoothstep(150.0, 230.0, vW.y + n * 30.0));
        vec3 albedo = mix(mix(rock, grass, grassAmt), snow, snowAmt);
        float diff = max(dot(N, uLightDir), 0.0);
        vec3 col = albedo * (uLightColor * diff * uKey + uAmbient * (0.55 + 0.45 * N.y) * 3.0);
        col += snowAmt * pow(max(dot(reflect(-uLightDir, N), normalize(cameraPosition - vW)), 0.0), 24.0) * uLightColor * 0.4 * uKey;
        gl_FragColor = vec4(applyFog(col, length(vW - cameraPosition)), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  ctx.scene.add(mesh);
  return {
    update(f) {
      mat.uniforms.uKey.value = f.sky.keyIntensity * 2.2;
      mat.uniforms.uFogDensity.value = ctx.fog.density;
      // The terrain is hidden behind dense fog at the harbor; skip drawing it until it can matter.
      mesh.visible = f.tod > 0.2;
    },
    dispose() { ctx.scene.remove(mesh); geo.dispose(); mat.dispose(); },
  };
}
```

- [ ] **Step 2: `clouds.ts`**

```ts
// app/world/scene/clouds.ts
import * as THREE from "three";
import { FOG, NOISE } from "../engine/glsl.ts";
import { CLOUD_Y } from "../lib/terrainShape.ts";
import type { Ctx, Module } from "./types.ts";

export function createClouds(ctx: Ctx): Module {
  const geo = new THREE.PlaneGeometry(9000, 9000);
  geo.rotateX(-Math.PI / 2);
  const mats = [0, 1].map((layer) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uOpacity: { value: 0 }, uLightDir: { value: ctx.light.dir }, uLightColor: { value: ctx.light.color },
      uAmbient: { value: ctx.light.ambient }, uFogColor: { value: ctx.fog.color }, uFogDensity: { value: 0 }, uLayer: { value: layer },
    },
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${NOISE}
      ${FOG}
      uniform float uTime, uOpacity, uLayer; uniform vec3 uLightDir, uLightColor, uAmbient; varying vec3 vW;
      float density(vec2 p){ return fbm3(vec3(p * 0.0016 + vec2(uTime * 0.003, uLayer * 3.1), uTime * 0.008 + uLayer)); }
      void main(){
        float d = density(vW.xz);
        float a = smoothstep(0.4, 0.68, d);
        // Fake self-shadowing: denser cloud toward the light means a darker top.
        float toward = density(vW.xz + normalize(uLightDir.xz + 1e-4) * 60.0);
        float lit = clamp(1.0 - (toward - d) * 4.0, 0.25, 1.0);
        float rim = smoothstep(0.55, 0.42, d) * a;
        vec3 col = uAmbient * 4.0 + uLightColor * (lit * 1.5 + rim * 1.2);
        col = applyFog(col, length(vW - cameraPosition) * 0.6);
        gl_FragColor = vec4(col, a * uOpacity * (uLayer > 0.5 ? 0.6 : 1.0));
      }`,
  }));
  const meshes = mats.map((m, i) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.y = CLOUD_Y + i * 25;
    mesh.renderOrder = 2;
    ctx.scene.add(mesh);
    return mesh;
  });
  return {
    update(f) {
      const o = THREE.MathUtils.smoothstep(f.tod, 0.6, 0.8);
      meshes.forEach((mesh, i) => {
        mesh.visible = o > 0.001;
        mesh.position.x = ctx.camera.position.x;
        mesh.position.z = ctx.camera.position.z;
        mats[i].uniforms.uTime.value = f.time;
        mats[i].uniforms.uOpacity.value = o;
        mats[i].uniforms.uFogDensity.value = ctx.fog.density;
      });
    },
    dispose() { meshes.forEach((m) => ctx.scene.remove(m)); geo.dispose(); mats.forEach((m) => m.dispose()); },
  };
}
```

- [ ] **Step 3: Register.** Add `createTerrain(ctx)` after the ocean and `createClouds(ctx)` before the fog:
`[sky, ocean, terrain, pier, lighthouse, lanterns, boats, clouds, fog]`.

- [ ] **Step 4: Verify in a browser.** Hand-set the pose to `STATIONS["ridge-dawn"]` (tod 0.7) and then `STATIONS.summit` (tod 0.92). Revert afterwards.
Expected:
- A craggy ridged massif with rock on the steep faces, grass low down and snow above ~290 with a sparkle, fading into warm haze.
- At the summit: a sea of clouds lit from the sunrise side, with a bright silver lining.
Professionalism checks:
- No visible triangle faceting at summit range (raise `terrainSeg` or the detail strength if needed).
- No hard plane edge on the clouds at the horizon (the fog multiplier must hide it).

---

### Task 11: Camera rig, scroll binding, HUD

**Files:**
- Create: `app/world/engine/rig.ts`, `app/world/engine/scroll.ts`, `app/world/Readout.tsx`
- Modify: `app/world/engine/world.ts` (rig + readout + lens projection), `app/world/World.tsx` (scroll binding, stations per page)

**Interfaces:**
- Consumes: `samplePath`, `scrollToParam` (Task 4), `STATIONS`, `STATION_LABELS`, `LIGHTHOUSE` (Task 4), `readout`, `formatReadout` (Task 5), `store`, `frameBus` (Task 6).
- Produces:
  ```ts
  createRig(camera): { update(target: Pose, dt: number): void; snap(): void; dispose(): void }
  bindScroll(els: HTMLElement[], onU: (u: number) => void): { lenis: Lenis; refresh(): void; dispose(): void }
  WorldApi.setPose now feeds the rig (damped) instead of applying directly; WorldApi gains `follow(stations: Station[])` and `setU(u)` drives samplePath.
  ```

- [ ] **Step 1: `rig.ts`**

```ts
// app/world/engine/rig.ts
import * as THREE from "three";
import type { Pose } from "../lib/path.ts";

/** Critically-damped follow of a target pose, with pointer and device-tilt parallax on top. */
export function createRig(camera: THREE.PerspectiveCamera) {
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), tmp = new THREE.Vector3();
  let fov = camera.fov, first = true;
  const aim = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    aim.x = (e.clientX / innerWidth) * 2 - 1;
    aim.y = (e.clientY / innerHeight) * 2 - 1;
  };
  let base: { b: number; g: number } | null = null;
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;
    base ??= { b: e.beta, g: e.gamma };
    base.b += (e.beta - base.b) * 0.004;
    base.g += (e.gamma - base.g) * 0.004;
    aim.x = THREE.MathUtils.clamp((e.gamma - base.g) / 25, -1, 1);
    aim.y = THREE.MathUtils.clamp((e.beta - base.b) / 25, -1, 1);
  };
  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("deviceorientation", onTilt, { passive: true });

  return {
    update(target: Pose, dt: number) {
      const a = first ? 1 : 1 - Math.exp(-dt * 3.2);
      first = false;
      pos.lerp(tmp.set(...target.pos), a);
      look.lerp(tmp.set(...target.look), a);
      fov += (target.fov - fov) * a;
      const b = 1 - Math.exp(-dt * 2);
      cur.x += (aim.x - cur.x) * b;
      cur.y += (aim.y - cur.y) * b;
      camera.position.copy(pos);
      camera.lookAt(look);
      camera.translateX(cur.x * 0.45);
      camera.translateY(-cur.y * 0.28);
      camera.rotateY(-cur.x * 0.012);
      camera.fov = fov;
      camera.updateProjectionMatrix();
    },
    snap() { first = true; },
    dispose() {
      removeEventListener("pointermove", onPointer);
      removeEventListener("deviceorientation", onTilt);
    },
  };
}
```

- [ ] **Step 2: `scroll.ts`**

```ts
// app/world/engine/scroll.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { scrollToParam } from "../lib/path.ts";

gsap.registerPlugin(ScrollTrigger);

/** Smooth scroll for world pages + maps scroll position to the camera path parameter. */
export function bindScroll(els: HTMLElement[], onU: (u: number) => void) {
  const lenis = new Lenis({ duration: 1.15, touchMultiplier: 1.4, smoothWheel: true });
  const tick = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  lenis.on("scroll", ScrollTrigger.update);

  let anchors: number[] = [];
  const measure = () => {
    anchors = els.map((el) => {
      const r = el.getBoundingClientRect();
      return r.top + scrollY + r.height / 2;
    });
  };
  const update = () => onU(scrollToParam(anchors, scrollY + innerHeight / 2));
  const refresh = () => { measure(); update(); };
  lenis.on("scroll", update);
  ScrollTrigger.addEventListener("refresh", refresh);
  addEventListener("resize", refresh);
  const ro = new ResizeObserver(refresh);
  ro.observe(document.body);
  refresh();

  return {
    lenis,
    refresh,
    dispose() {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", refresh);
      removeEventListener("resize", refresh);
      ro.disconnect();
      lenis.destroy();
    },
  };
}
```

- [ ] **Step 3: Update `engine/world.ts`.**

Replace the `applyPose` block and `pose` handling with the rig, and add `follow`, readout and lens projection. The full replacement for the section from `const pose` up to the `return {` object:

```ts
const rig = createRig(camera);
let path: Station[] = [STATIONS["harbor-fog"]];
let override: Pose | null = null; // used by the loader's launch flight
let tod = 0, ignition = 0, u = 0;
const prevPos: Vec3 = [0, 0, 0];
const fwd = new THREE.Vector3();
const lamp = new THREE.Vector3(...LIGHTHOUSE.lamp), edge = new THREE.Vector3(), right = new THREE.Vector3();
let hudAt = 0;
```

Inside `frame()`, replace `applyPose(); const f: Frame = {...}` with:

```ts
const target = override ?? samplePath(path, u);
tod = target.tod;
rig.update(target, dt);
const f: Frame = { time, dt, tod, sky: skyAt(tod), ignition, u };
```

After `post.render(time);` add:

```ts
// HUD at 8 Hz: React only re-renders when the strings change.
if (time - hudAt > 0.125) {
  const p = camera.position;
  camera.getWorldDirection(fwd);
  const r = readout([p.x, p.y, p.z], prevPos, time - hudAt, [fwd.x, fwd.y, fwd.z], time, tod >= 0.5);
  prevPos[0] = p.x; prevPos[1] = p.y; prevPos[2] = p.z;
  hudAt = time;
  const lines = formatReadout(r);
  if (lines.join() !== store.get().lines.join()) store.set({ lines });
}
// Lighthouse lens in screen space, for the porthole video.
edge.copy(lamp);
right.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(2.2);
const c = lamp.clone().project(camera), e = edge.add(right).project(camera);
const vis = c.z < 1 && Math.abs(c.x) < 1.2 && Math.abs(c.y) < 1.2;
frameBus.emit({
  lens: vis ? { x: (c.x * 0.5 + 0.5) * innerWidth, y: (-c.y * 0.5 + 0.5) * innerHeight, r: Math.abs(e.x - c.x) * 0.5 * innerWidth } : null,
});
```

Replace the returned API's pose methods with:

```ts
setPose(p) { override = p; },
follow(stations) { path = stations; override = null; },
snap() { rig.snap(); },
```

Remove `setTod` (tod now comes from the pose). Add `rig.dispose()` to `dispose()`. Update the `WorldApi` type to:

```ts
export type WorldApi = {
  setPose(p: Pose | null): void;
  follow(stations: Station[]): void;
  snap(): void;
  setIgnition(x: number): void;
  setU(u: number): void;
  setActive(kind: "lantern" | "boat", i: number): void;
  dispose(): void;
};
```

and `setPose(p) { override = p; }` accepts `null` to hand control back to the path. Add these imports: `createRig` from `./rig.ts`; `samplePath`, `Station`, `Vec3` from `../lib/path.ts`; `STATIONS`, `LIGHTHOUSE` from `../lib/stations.ts`; `readout`, `formatReadout` from `../lib/readout.ts`; `store`, `frameBus` from `../store.ts`.

- [ ] **Step 4: Bind stations in `World.tsx`.** After the world is created (and again on every pathname change while it exists), collect stations and bind scroll:

```tsx
// inside World(), add:
const scrollRef = useRef<{ dispose(): void } | null>(null);

const attach = async (api: import("./engine/world.ts").WorldApi) => {
  const { bindScroll } = await import("./engine/scroll.ts");
  const { STATIONS, STATION_LABELS } = await import("./lib/stations.ts");
  scrollRef.current?.dispose();
  const els = [...document.querySelectorAll<HTMLElement>("[data-station]")];
  const names = els.map((el) => el.dataset.station as keyof typeof STATIONS);
  api.follow(names.map((n) => STATIONS[n]));
  let last = "";
  scrollRef.current = bindScroll(els, (u) => {
    api.setU(u);
    const name = names[Math.round(u * (names.length - 1))];
    if (name !== last) {
      last = name;
      store.set({ activeStation: name, label: STATION_LABELS[name] });
    }
  });
};
```

Call `attach(apiRef.current)` right after `createWorld` resolves. In the effect, when `apiRef.current` already exists, call `apiRef.current.setRunning(true); attach(apiRef.current)` instead of returning early. When a page has no stations, call `scrollRef.current?.dispose(); scrollRef.current = null; apiRef.current?.setRunning(false);` so the loop stops drawing behind non-world pages.

In `engine/world.ts`, split the pause flag so tab visibility and page opt-in don't fight:

```ts
let visible = !document.hidden, enabled = true;
// in frame(): replace `if (!running) return;` with
if (!visible || !enabled) return;
// onVis:
const onVis = () => { visible = !document.hidden; clock.getDelta(); };
// in the returned API, and add `setRunning(on: boolean): void` to the WorldApi type:
setRunning(on) { enabled = on; clock.getDelta(); },
```

Delete the old `running` variable.

- [ ] **Step 5: `Readout.tsx`**

```tsx
// app/world/Readout.tsx
"use client";

import { useSyncExternalStore } from "react";
import { store } from "./store.ts";

export function Readout() {
  const s = useSyncExternalStore(store.subscribe, store.get, store.get);
  if (s.phase !== "flying" && s.phase !== "ready") return null;
  return (
    <div className="world-readout" aria-hidden="true">
      <p className="world-readout-label">
        <span className="world-readout-dot" />
        {s.label}
      </p>
      <p className="world-readout-lines">
        {s.lines.map((l) => <span key={l.slice(0, 4)}>{l}</span>)}
      </p>
    </div>
  );
}
```

Append to `world.css`:

```css
.world-readout {
  position: fixed; left: clamp(1rem, 2.5vw, 2rem); bottom: clamp(1rem, 2.5vw, 2rem); z-index: 40;
  font: 400 0.6875rem/1.5 var(--font-fragment), ui-monospace, monospace; letter-spacing: 0.12em;
  color: rgba(238, 241, 246, 0.72); text-transform: uppercase; pointer-events: none;
}
.world-readout-label { margin: 0 0 0.35rem; color: #fff; display: flex; align-items: center; gap: 0.5rem; }
.world-readout-dot { width: 6px; height: 6px; border-radius: 50%; background: #ffb36b; box-shadow: 0 0 10px #ffb36b; animation: world-blink 2.4s ease-in-out infinite; }
.world-readout-lines { margin: 0; display: flex; flex-wrap: wrap; gap: 0 1.1rem; max-width: 22rem; }
.world-readout-lines span { font-variant-numeric: tabular-nums; }
@keyframes world-blink { 50% { opacity: 0.3; } }
@media (max-width: 640px) { .world-readout-lines span:nth-child(n + 3) { display: none; } }
```

- [ ] **Step 6: Verify with a longer test page.** Replace `/world-test` with sections in `HOME_ORDER`, each `100vh` tall with a `data-station`. Then scroll the whole way.
Expected:
- A smooth flight from the pier past the lighthouse, through the fleet and along the lanterns, lifting at landfall, climbing the ridge and cresting at the summit at sunrise.
- No snapping, and the camera never clips terrain.
- The HUD changes from sea units to `ALT … M` at landfall.

Run `npm test && npx tsc --noEmit && npm run lint`. Expected: all pass.

---

### Task 12: Signature logo, loader, launch sequence

**Files:**
- Create: `scripts/trace-signature.py`, `app/world/signature-data.ts` (generated), `app/world/Signature.tsx`, `app/world/Loader.tsx`
- Modify: `app/world/engine/world.ts` (remove the `?lit` hack), `app/world/world.css`

**Interfaces:**
- Consumes: `store` (Task 6), `WorldApi.setPose/setIgnition/follow/snap` (Task 11), `STATIONS` (Task 4).
- Produces:
  ```ts
  SIGNATURE: { viewBox: string; outline: string; strokes: { d: string; len: number }[] }
  <Signature progress={0..1} className? />   // writes the logo left to right as progress goes 0→1
  <Loader onLaunch(sound: boolean) />        // world pages only
  launchFlight(api, onDone): starts the 4.2 s ignition + push-out, skippable
  ```

- [ ] **Step 1: Write the tracer.** It outlines the PNG with potrace, skeletonizes it for the pen strokes, and orders the strokes by x.

```python
# scripts/trace-signature.py
# Usage: python -I scripts/trace-signature.py public/MainLogo.png app/world/signature-data.ts
import json, sys
import numpy as np
from PIL import Image
import potrace
from skimage.morphology import skeletonize
from skimage.measure import label

src, out = sys.argv[1], sys.argv[2]
img = np.array(Image.open(src).convert("LA"))
ink = (img[..., 1] > 128) & (img[..., 0] < 128)
# Keep only the script word: drop "STUDIOS" and the ™ (small components / the lower band).
lab = label(ink, connectivity=2)
keep = np.zeros_like(ink)
h = ink.shape[0]
for i in range(1, lab.max() + 1):
    ys, xs = np.nonzero(lab == i)
    if len(ys) < 120 or (ys.min() > h * 0.62 and ys.max() - ys.min() < h * 0.2):
        continue
    keep |= lab == i

bmp = potrace.Bitmap(keep)
path = bmp.trace(turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.2)
def fmt(p): return f"{p[0]:.1f} {p[1]:.1f}"
outline = []
for curve in path:
    d = f"M{fmt(curve.start_point)}"
    for seg in curve:
        if seg.is_corner:
            d += f"L{fmt(seg.c)}L{fmt(seg.end_point)}"
        else:
            d += f"C{fmt(seg.c1)} {fmt(seg.c2)} {fmt(seg.end_point)}"
    outline.append(d + "Z")

# Pen strokes: skeleton pixels grouped into connected chains, each walked greedily from its leftmost pixel.
sk = skeletonize(keep)
pts = set(zip(*np.nonzero(sk)))
strokes = []
while pts:
    start = min(pts, key=lambda p: (p[1], p[0]))
    chain, cur = [start], start
    pts.discard(start)
    while True:
        nb = [(cur[0] + dy, cur[1] + dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy or dx)]
        nb = [p for p in nb if p in pts]
        if not nb:
            break
        cur = max(nb, key=lambda p: p[1])  # prefer moving right, like a pen
        chain.append(cur)
        pts.discard(cur)
    if len(chain) < 6:
        continue
    chain = chain[::3] + [chain[-1]]
    d = "M" + " L".join(f"{x} {y}" for y, x in chain)
    length = sum(((chain[i][0] - chain[i - 1][0]) ** 2 + (chain[i][1] - chain[i - 1][1]) ** 2) ** 0.5 for i in range(1, len(chain)))
    strokes.append({"d": d, "len": round(length, 1), "x": chain[0][1]})
strokes.sort(key=lambda s: s["x"])
for s in strokes:
    del s["x"]

data = {"viewBox": f"0 0 {keep.shape[1]} {keep.shape[0]}", "outline": "".join(outline), "strokes": strokes}
with open(out, "w", encoding="utf8") as f:
    f.write("// Generated by scripts/trace-signature.py from public/MainLogo.png. Do not edit by hand.\n")
    f.write("export const SIGNATURE = " + json.dumps(data) + " as const;\n")
print(len(outline), "outline paths,", len(strokes), "strokes")
```

- [ ] **Step 2: Run it**

```bash
python -m pip install --user potracer pillow scikit-image numpy
python -I scripts/trace-signature.py public/MainLogo.png app/world/signature-data.ts
```

Expected: something like `9 outline paths, 14 strokes`, and `app/world/signature-data.ts` exists. If `potracer` exposes `potrace.Bitmap` under a different API, use `import potrace; help(potrace.Bitmap.trace)` and adjust only the tracing call.

- [ ] **Step 3: `Signature.tsx`**

```tsx
// app/world/Signature.tsx
import { useId } from "react";
import { SIGNATURE } from "./signature-data";

/** The script logo, revealed along its pen strokes as `progress` goes 0 → 1. */
export function Signature({ progress, className }: { progress: number; className?: string }) {
  const id = useId();
  const total = SIGNATURE.strokes.reduce((s, k) => s + k.len, 0);
  let before = 0;
  return (
    <svg viewBox={SIGNATURE.viewBox} className={className} role="img" aria-label="Piermont">
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse">
          {SIGNATURE.strokes.map((s, i) => {
            const start = before / total, end = (before + s.len) / total;
            before += s.len;
            const k = Math.min(1, Math.max(0, (progress - start) / (end - start)));
            return (
              <path key={i} d={s.d} fill="none" stroke="#fff" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={s.len} strokeDashoffset={s.len * (1 - k)} />
            );
          })}
        </mask>
      </defs>
      <path d={SIGNATURE.outline} fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}
```

`strokeWidth={28}` must cover the thickest letter stem in source pixels. Check visually in Step 7 and raise it if parts of letters stay hidden at `progress=1`.

- [ ] **Step 4: `Loader.tsx`**

```tsx
// app/world/Loader.tsx
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Signature } from "./Signature";
import { store } from "./store.ts";

const SEEN = "piermont:launched";

/** Night-harbor launch screen for world pages. Shown once per session; skipped for reduced motion. */
export function Loader({ onLaunch }: { onLaunch: (sound: boolean, instant?: boolean) => Promise<void> }) {
  const s = useSyncExternalStore(store.subscribe, store.get, store.get);
  const [write, setWrite] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [launching, setLaunching] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN) === "1"; } catch {}
    if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHidden(true);
      void onLaunch(false, true);
      return;
    }
    const t0 = performance.now();
    const loop = (t: number) => {
      setWrite(Math.min(1, (t - t0) / 2600));
      if (t - t0 < 2600) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [onLaunch]);

  if (hidden) return null;
  const ready = write >= 1 && (s.phase === "ready" || s.phase === "fallback");

  const go = async (sound: boolean) => {
    setLaunching(true);
    try { sessionStorage.setItem(SEEN, "1"); } catch {}
    await onLaunch(sound);
    setHidden(true);
  };

  return (
    <div className={`world-loader ${launching ? "is-launching" : ""}`} role="dialog" aria-label="Welcome to Piermont Studios">
      <Signature progress={write} className="world-loader-logo" />
      <p className="world-loader-status" aria-live="polite">{ready ? "Ready to set sail" : "Lighting the harbor"}</p>
      <div className={`world-loader-actions ${ready ? "is-ready" : ""}`}>
        <button type="button" className="world-btn world-btn--primary" disabled={!ready || launching} onClick={() => go(true)}>
          Set sail with sound
        </button>
        <button type="button" className="world-btn" disabled={!ready || launching} onClick={() => go(false)}>
          Set sail silently
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Launch flight in `World.tsx`.** Add a `launch` function and render `<Loader>` and `<Readout>` next to the canvas (only when the page has stations, tracked in a `hasStations` state set in the effect):

```tsx
const launch = useCallback(async (sound: boolean, instant = false) => {
  const api = apiRef.current;
  // No world yet (fallback, or a returning visitor whose world is still loading): content goes live now.
  // The createWorld .then() calls api.setIgnition(1) when it finds phase === "flying".
  if (!api) { store.set({ phase: "flying" }); return; }
  const { STATIONS } = await import("./lib/stations.ts");
  const from = STATIONS["harbor-fog"], to = STATIONS["pier-end"];
  const t0 = performance.now(), DUR = 4200;
  let skip = instant;
  const onSkip = () => (skip = true);
  const evs = ["wheel", "touchstart", "keydown"] as const;
  setTimeout(() => evs.forEach((e) => addEventListener(e, onSkip, { passive: true })), 400);
  store.set({ phase: "launching" });
  await new Promise<void>((done) => {
    const step = (t: number) => {
      const k = skip ? 1 : Math.min(1, (t - t0) / DUR);
      api.setIgnition(Math.min(1, k / 0.25));               // lighthouse ignites in the first second
      const m = k < 0.3 ? 0 : (k - 0.3) / 0.7, e = 1 - Math.pow(1 - m, 4); // then push out along the pier
      const mix = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] - v) * e) as [number, number, number];
      api.setPose({ pos: mix(from.pos, to.pos), look: mix(from.look, to.look), fov: from.fov + (to.fov - from.fov) * e, tod: to.tod * e });
      if (k < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });
  evs.forEach((e) => removeEventListener(e, onSkip));
  api.setPose(null);
  scrollTo(0, 0);
  store.set({ phase: "flying" });
}, []);
```

Sound is wired in Task 13. `sound` is unused until then; that's expected.

In the `createWorld(...).then` of `World.tsx`, after `apiRef.current = ...`, add:

```ts
if (store.get().phase === "flying") apiRef.current.setIgnition(1); // visitor already launched while the world loaded
else store.set({ phase: "ready" });
```

(and delete the unconditional `store.set({ phase: "ready" })`).

Remove the `?lit` line from `engine/world.ts`. `ignition` starts at 0 and only `launch` sets it. Returning visitors get `launch(false, true)`: `skip` starts true, so the first frame jumps to full ignition at the pier end.

- [ ] **Step 6: Loader styles.** Append to `world.css`:

```css
.world-loader {
  position: fixed; inset: 0; z-index: 100; display: grid; place-content: center; justify-items: center; gap: 1.5rem;
  background: radial-gradient(ellipse at 50% 60%, rgba(4, 6, 11, 0.2), rgba(4, 6, 11, 0.85) 70%);
  color: #f4ead8; transition: opacity 1.2s cubic-bezier(.16, 1, .3, 1), backdrop-filter 1.2s;
}
.world-loader.is-launching { opacity: 0; pointer-events: none; transition-delay: 0.6s; }
.world-loader-logo { width: min(68vw, 30rem); height: auto; filter: drop-shadow(0 0 18px rgba(255, 196, 120, 0.55)); }
.world-loader-status { margin: 0; font: 400 0.75rem/1 var(--font-fragment), monospace; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(244, 234, 216, 0.6); }
.world-loader-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; opacity: 0; transform: translateY(14px); filter: blur(6px); transition: all 1.1s cubic-bezier(.16, 1, .3, 1); }
.world-loader-actions.is-ready { opacity: 1; transform: none; filter: none; }
.world-btn {
  height: 3.25rem; padding: 0 1.6rem; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.06); color: #f4ead8; backdrop-filter: blur(10px);
  font: 600 0.8125rem/1 var(--font-figtree), sans-serif; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
  transition: background 0.3s, border-color 0.3s, transform 0.3s cubic-bezier(.16, 1, .3, 1);
}
.world-btn:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.4); }
.world-btn:focus-visible { outline: 2px solid #ffb36b; outline-offset: 3px; }
.world-btn--primary { background: #f4ead8; color: #0b0d12; border-color: transparent; }
.world-btn--primary:hover { background: #fff; }
.world-btn:disabled { opacity: 0.5; cursor: default; }
html.world-on .loading-screen { display: none !important; }
```

The last rule hides the old `LoadingScreen` on world pages. Confirm its root class name in `components/LoadingScreen.tsx` and use that exact selector.

- [ ] **Step 7: Verify in a browser.** Clear `sessionStorage`, then open the test page.
Expected:
- The signature writes itself left to right in warm light over the dark harbor, then "Ready to set sail" appears and the buttons fade up.
- "Set sail silently": the lighthouse ignites, the beam sweeps, the camera glides down the pier to the pier end, and the loader fades.
- Scroll during the flight skips to the end. Reloading skips the loader.

Professionalism checks:
- Every letter of the signature is fully filled at the end.
- No stroke is revealed out of order (if one is, reorder or merge strokes in the generated data via the script).

---

### Task 13: Sound

**Files:**
- Create: `app/world/sound/audio.ts`, `app/world/SoundToggle.tsx`
- Modify: `app/world/World.tsx` (play the fog horn on launch, drive brightness with `u`)

**Interfaces:**
- Consumes: `store` (Task 6).
- Produces: `enableSound(on: boolean)`, `toggleSound()`, `setBrightness(u: number)`, `horn()`, `whoosh()`, `isSoundOn(): boolean`.

- [ ] **Step 1: `audio.ts`**

```ts
// app/world/sound/audio.ts
import { store } from "../store.ts";

const KEY = "piermont:sound";
let ac: AudioContext | null = null;
let master: GainNode, tone: BiquadFilterNode, reverb: ConvolverNode, wet: GainNode;
let started = false;

function noiseBuffer(c: AudioContext, seconds: number, brown: boolean) {
  const b = c.createBuffer(2, Math.floor(c.sampleRate * seconds), c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      last = brown ? (last + 0.02 * w) / 1.02 : w;
      d[i] = brown ? last * 3.5 : w;
    }
  }
  return b;
}

function impulse(c: AudioContext, seconds = 3.4, decay = 2.8) {
  const b = c.createBuffer(2, Math.floor(c.sampleRate * seconds), c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, decay);
  }
  return b;
}

function loop(buffer: AudioBuffer, filter: BiquadFilterType, freq: number, gain: number, lfoRate: number, lfoDepth: number) {
  const c = ac!;
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = gain;
  const lfo = c.createOscillator(), lg = c.createGain();
  lfo.frequency.value = lfoRate;
  lg.gain.value = lfoDepth;
  lfo.connect(lg).connect(g.gain);
  src.connect(f).connect(g).connect(tone);
  src.start();
  lfo.start();
}

function build() {
  ac = new AudioContext();
  master = ac.createGain();
  master.gain.value = 0;
  tone = ac.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 900;
  reverb = ac.createConvolver();
  reverb.buffer = impulse(ac);
  wet = ac.createGain();
  wet.gain.value = 0.35;
  tone.connect(master);
  tone.connect(reverb).connect(wet).connect(master);
  master.connect(ac.destination);

  const brown = noiseBuffer(ac, 6, true), white = noiseBuffer(ac, 4, false);
  loop(brown, "lowpass", 420, 0.5, 0.11, 0.22); // harbor swell
  loop(white, "bandpass", 700, 0.05, 0.07, 0.03); // wind
  const hum = ac.createOscillator(), hg = ac.createGain();
  hum.frequency.value = 55;
  hg.gain.value = 0.015;
  hum.connect(hg).connect(tone);
  hum.start();

  addEventListener("visibilitychange", () => {
    if (!ac) return;
    master.gain.setTargetAtTime(document.hidden || !store.get().sound ? 0 : 0.8, ac.currentTime, 0.3);
  });
}

export async function enableSound(on: boolean) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
  store.set({ sound: on });
  if (on && !ac) build();
  if (!ac) return;
  await ac.resume();
  master.gain.setTargetAtTime(on ? 0.8 : 0, ac.currentTime, on ? 0.8 : 0.3);
  started = true;
}

export const isSoundOn = () => store.get().sound;
export const toggleSound = () => enableSound(!store.get().sound);

/** 0 = muffled night harbor, 1 = open, bright summit air. */
export function setBrightness(u: number) {
  if (!ac || !started) return;
  tone.frequency.setTargetAtTime(900 * Math.pow(10, u * 1.1), ac.currentTime, 0.4);
  wet.gain.setTargetAtTime(0.35 - u * 0.2, ac.currentTime, 0.4);
}

/** Two detuned saw voices through a closing lowpass: a distant fog horn. */
export function horn() {
  if (!ac || !store.get().sound) return;
  const t = ac.currentTime, g = ac.createGain(), f = ac.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(380, t);
  f.frequency.linearRampToValueAtTime(220, t + 3.2);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.16, t + 0.35);
  g.gain.setTargetAtTime(0, t + 2.6, 0.5);
  f.connect(g).connect(tone);
  for (const [hz, det] of [[98, -6], [147, 5]] as const) {
    const o = ac.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = hz;
    o.detune.value = det;
    o.connect(f);
    o.start(t);
    o.stop(t + 4.5);
  }
}

/** Short filtered-noise sweep for big camera moves. */
export function whoosh(strength = 0.5) {
  if (!ac || !store.get().sound) return;
  const t = ac.currentTime, src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 1.6, false);
  const f = ac.createBiquadFilter(), g = ac.createGain();
  f.type = "bandpass";
  f.Q.value = 1.1;
  f.frequency.setValueAtTime(260, t);
  f.frequency.exponentialRampToValueAtTime(1600 + strength * 1400, t + 0.7);
  f.frequency.exponentialRampToValueAtTime(300, t + 1.5);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.12 * strength, t + 0.5);
  g.gain.linearRampToValueAtTime(0, t + 1.5);
  src.connect(f).connect(g).connect(tone);
  src.start(t);
}
```

- [ ] **Step 2: `SoundToggle.tsx`**

```tsx
// app/world/SoundToggle.tsx
"use client";

import { useSyncExternalStore } from "react";
import { store } from "./store.ts";

export function SoundToggle() {
  const s = useSyncExternalStore(store.subscribe, store.get, store.get);
  if (s.phase !== "flying") return null;
  return (
    <button
      type="button"
      className={`world-sound ${s.sound ? "is-on" : ""}`}
      aria-pressed={s.sound}
      aria-label={s.sound ? "Sound on. Mute" : "Sound off. Turn sound on"}
      onClick={async () => (await import("./sound/audio.ts")).toggleSound()}
    >
      {[0, 1, 2, 3].map((i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
    </button>
  );
}
```

Append to `world.css`:

```css
.world-sound { position: fixed; right: clamp(1rem, 2.5vw, 2rem); bottom: clamp(1rem, 2.5vw, 2rem); z-index: 40; display: flex; align-items: center; gap: 3px; height: 2.5rem; padding: 0 0.9rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.18); background: rgba(8,10,16,.4); backdrop-filter: blur(10px); cursor: pointer; }
.world-sound span { width: 2px; height: 4px; background: #f4ead8; border-radius: 1px; }
.world-sound.is-on span { animation: world-eq 0.9s ease-in-out infinite; }
@keyframes world-eq { 50% { height: 14px; } }
.world-sound:focus-visible { outline: 2px solid #ffb36b; outline-offset: 3px; }
```

- [ ] **Step 3: Wire the sound into `World.tsx`.**
  - Add a module-level `let audio: typeof import("./sound/audio.ts") | null = null;` in `World.tsx`.
  - At the top of `launch` (it runs inside the button's click, so `AudioContext` may start):
    ```ts
    if (sound) {
      audio = await import("./sound/audio.ts");
      await audio.enableSound(true);
      audio.horn();
      setTimeout(() => audio?.whoosh(0.7), 1300);
    }
    ```
  - In the `bindScroll` callback: `audio?.setBrightness(u);`.
  - `SoundToggle`'s click also sets `audio` (assign the imported module to it via a tiny exported setter, or import `audio.ts` statically in `SoundToggle` since that component only renders after launch).
  - Returning visitors: on mount, read `localStorage["piermont:sound"]` and `store.set({ sound: saved === "on" })` so the toggle shows the saved state. Audio itself starts on the first toggle click (autoplay rules).
  - Render `<SoundToggle />` next to `<Readout />`.
  - Music score slot (spec): in `audio.ts` add `export const SCORE_URL: string | null = null;`, and at the end of `build()`:
    ```ts
    if (SCORE_URL) {
      const el = new Audio(SCORE_URL);
      el.loop = true;
      el.crossOrigin = "anonymous";
      const g = ac.createGain();
      g.gain.value = 0.5;
      ac.createMediaElementSource(el).connect(g).connect(master);
      void el.play();
    }
    ```

- [ ] **Step 4: Verify in a browser.** Choose "Set sail with sound".
Expected:
- Soft harbor swell and wind, the fog horn on ignition, then a whoosh as the camera moves.
- Scrolling down opens the sound up gradually.
- The toggle mutes with a 0.3 s fade, and hiding the tab silences it.
- Choosing silent makes no sound until the toggle is pressed.
- Reload: the toggle state is restored, but audio only starts after a click (browser autoplay rules).

---

### Task 14: Homepage

**Files:**
- Create: `app/components/HomeHero.tsx`
- Modify: `app/page.tsx`, `app/components/HomeVideo.tsx`, `app/components/ServicesSection.tsx`, `app/components/ProjectsSection.tsx`, `app/world/world.css`

**Interfaces:**
- Consumes: `store`, `frameBus` (Task 6). For the active lantern and boat, a tiny event the World listens to:
  ```ts
  // app/world/store.ts (add)
  export const activeBus = { emit(kind: "lantern" | "boat", i: number) {...}, on(fn) {...} };
  ```
  `World.tsx` subscribes after creating the world: `activeBus.on((k, i) => api.setActive(k, i))`.
- Produces: the homepage DOM, with stations in `HOME_ORDER`.

- [ ] **Step 1: Add `activeBus` to `store.ts`**

```ts
type ActiveFn = (kind: "lantern" | "boat", i: number) => void;
const activeSubs = new Set<ActiveFn>();
export const activeBus = {
  emit: (kind: "lantern" | "boat", i: number) => activeSubs.forEach((f) => f(kind, i)),
  on(fn: ActiveFn) {
    activeSubs.add(fn);
    return () => void activeSubs.delete(fn);
  },
};
```

- [ ] **Step 2: `HomeHero.tsx`**

```tsx
// app/components/HomeHero.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { store } from "../world/store";
import { HeroHeader } from "./HeroHeader";

export function HomeHero() {
  const s = useSyncExternalStore(store.subscribe, store.get, store.get);
  const title = useRef<HTMLHeadingElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (played.current || !title.current) return;
    if (s.phase !== "flying" && s.phase !== "fallback") return;
    played.current = true;
    let revert: (() => void) | undefined;
    (async () => {
      const [{ default: gsap }, { SplitText }] = await Promise.all([import("gsap"), import("gsap/SplitText")]);
      gsap.registerPlugin(SplitText);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const split = SplitText.create(title.current!, { type: "words", wordsClass: "hero-word", aria: "auto" });
      gsap.fromTo(split.words, { yPercent: 110, opacity: 0, filter: "blur(6px)" },
        { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 1.1, ease: "expo.out", stagger: 0.05 });
      gsap.fromTo(".home-hero-sub, .home-hero-cue", { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, delay: 0.45 });
      revert = () => split.revert();
    })();
    return () => revert?.();
  }, [s.phase]);

  return (
    <section className="home-hero" data-station="pier-end" aria-labelledby="home-hero-title">
      <HeroHeader tone="dark" />
      <div className="home-hero-inner">
        <p className="home-hero-sub">We strategize, build and promote.</p>
        <h1 id="home-hero-title" ref={title} className="home-hero-title">
          Brands, websites &amp; ads built to grow.
        </h1>
        <p className="home-hero-cue" aria-hidden="true">Scroll to set out</p>
      </div>
      <nav className="anim-bar hero-cta-bar home-hero-bar" aria-label="Primary">
        <Link href="/" className="hero-cta-logo" aria-label="Home">
          <Image src="/LogoW.png" alt="Piermont Studios" width={140} height={58} priority className="hero-cta-logo-img" />
        </Link>
        <Link href="/contact" className="hero-cta-btn">Start Project</Link>
      </nav>
    </section>
  );
}
```

Check that `public/LogoW.png` is the white variant of the script logo (open it). If it isn't, use `MainLogo.png` with `className` adding `filter: invert(1)`.

- [ ] **Step 3: Porthole `HomeVideo.tsx`.** Make the section 240vh tall with a sticky stage and drive `clip-path` from the lens position:

```tsx
// app/components/HomeVideo.tsx
"use client";

import { useEffect, useRef } from "react";
import { frameBus } from "../world/store";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

export function HomeVideo() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = section.current, v = video.current;
    if (!el || !v) return;
    v.defaultMuted = v.muted = true;
    v.playsInline = true;
    let lens: { x: number; y: number; r: number } | null = null;
    const off = frameBus.on((f) => { lens = f.lens; });
    let raf = 0, playing = false;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
      const inView = r.top < innerHeight && r.bottom > 0;
      if (inView !== playing) { playing = inView; if (inView) void v.play().catch(() => {}); else v.pause(); }
      if (!inView) return;
      const open = smooth(0.12, 0.62, p);
      const full = Math.hypot(innerWidth, innerHeight) / 2;
      const start = lens ?? { x: innerWidth / 2, y: innerHeight / 2, r: Math.min(innerWidth, innerHeight) * 0.06 };
      const cx = start.x + (innerWidth / 2 - start.x) * open;
      const cy = start.y + (innerHeight / 2 - start.y) * open;
      const rad = start.r + (full - start.r) * open;
      v.style.clipPath = `circle(${rad.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
      v.style.opacity = String(smooth(0, 0.08, p) * (1 - smooth(0.9, 1, p)));
    };
    tick();
    return () => { cancelAnimationFrame(raf); off(); };
  }, []);

  return (
    <section ref={section} className="home-porthole" data-station="lighthouse-lens" aria-label="Showreel">
      <div className="home-porthole-stage">
        <video ref={video} className="home-porthole-video" muted loop playsInline preload="metadata" poster="/video-poster.jpg"
          disablePictureInPicture disableRemotePlayback tabIndex={-1} aria-hidden="true">
          <source src="/video.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `ServicesSection.tsx`.** Add an optional `world` prop. When `world` is true, render a station marker before each card and emit the active lantern when a card becomes the top card:

```tsx
export function ServicesSection({ world = false }: { world?: boolean }) {
```

Inside the map, before `<article`:

```tsx
{world && <span aria-hidden="true" className="station-marker" data-station={`lantern-${index}`} />}
```

Add an effect:

```tsx
useEffect(() => {
  if (!world) return;
  const section = sectionRef.current!;
  const markers = [...section.querySelectorAll<HTMLElement>(".station-marker")];
  let last = -1;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const i = markers.indexOf(e.target as HTMLElement);
      if (i !== last) { last = i; void import("../world/store").then(({ activeBus }) => activeBus.emit("lantern", i)); }
    }
  }, { rootMargin: "-50% 0px -50% 0px" });
  markers.forEach((m) => io.observe(m));
  return () => io.disconnect();
}, [world]);
```

`.station-marker` needs a real height so the scroll anchors are spaced like the cards. Append to `world.css`: `.station-marker { display: block; height: 0; }`. The anchor is its document position. Because the markers sit in normal flow between sticky cards, they follow the cards' 40vh spacing.

- [ ] **Step 5: `ProjectsSection.tsx`.** Add an optional `world` prop. When it's true, add `data-station="fleet"` to the `<section>` and emit the active boat on change:

```tsx
export function ProjectsSection({ world = false }: { world?: boolean }) {
  ...
  useEffect(() => {
    if (!world) return;
    void import("../world/store").then(({ activeBus }) => activeBus.emit("boat", activeIndex));
  }, [world, activeIndex]);
  ...
  <section ref={sectionRef} id="projects" data-station={world ? "fleet" : undefined} className={`relative ${world ? "projects-world text-white" : "bg-[#101010] text-white"}`}>
```

Its header block uses `bg-[#101010]`. Gate that the same way (`world ? "" : "bg-[#101010]"`).

- [ ] **Step 6: `app/page.tsx`.** Wrap the content and assign stations:

```tsx
<main id="main" className="world-home">
  <HomeHero />
  <HomeVideo />
  <ProjectsSection world />
  <ServicesSection world />
  <div data-station="landfall"><TestimonialsSection /></div>
  <div data-station="ridge-dawn"><StoriesSection /></div>
  <div data-station="summit"><ContactSection /></div>
</main>
<div className="world-home" data-station="cloud-sea"><SiteFooter /></div>
```

Remove the now-unused imports (`GlitchHeadline`, `HeroComputer`, `HeroHeader`, `Image`, `Link`) and the old hero `<section>`. Keep the JSON-LD script.

- [ ] **Step 7: Dark world styles.** Append to `world.css`. Every rule is scoped to `.world-home` so other pages, which reuse these components, don't change.

```css
/* Hero */
.home-hero { position: relative; min-height: 100svh; display: grid; align-content: end; padding: 0 clamp(1.25rem, 5vw, 4rem) clamp(7rem, 14vh, 9rem); }
.home-hero-inner { max-width: 70rem; }
.home-hero-sub { margin: 0 0 1.25rem; font: 400 0.75rem/1 var(--font-fragment), monospace; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(244, 234, 216, 0.7); }
.home-hero-title { margin: 0; font-weight: 500; font-size: clamp(2.75rem, 1rem + 6.4vw, 7.5rem); line-height: 0.95; letter-spacing: -0.045em; color: #f7f3ec; text-wrap: balance; text-shadow: 0 2px 40px rgba(0, 0, 0, 0.45); }
.hero-word { display: inline-block; will-change: transform, filter; }
.home-hero-cue { margin: 2rem 0 0; font: 400 0.6875rem/1 var(--font-fragment), monospace; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(244, 234, 216, 0.5); }
.home-hero-bar { position: absolute; left: 50%; bottom: 1.5rem; transform: translateX(-50%); background: rgba(8, 10, 16, 0.38) !important; border-color: rgba(255, 255, 255, 0.16) !important; }

/* Porthole */
.home-porthole { position: relative; height: 240vh; }
.home-porthole-stage { position: sticky; top: 0; height: 100svh; overflow: hidden; }
.home-porthole-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; will-change: clip-path, opacity; }

/* Shared glass treatment for content over the world */
.world-home .services-section,
.world-home .testimonials-section,
.world-home .blog-section,
.world-home .contact-section,
.world-home .site-footer,
.world-home .projects-world { background: transparent !important; color: #eef1f6; }
.world-home .services-title,
.world-home .blog-title { color: #f7f3ec; }
.world-home .service-card,
.world-home .service-card-body,
.world-home .testimonial-card {
  background: rgba(10, 13, 20, 0.55) !important; color: #eef1f6;
  border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(18px) saturate(130%); -webkit-backdrop-filter: blur(18px) saturate(130%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}
.world-home .service-card-frost { background: linear-gradient(to bottom, rgba(10, 13, 20, 0.7), rgba(10, 13, 20, 0)) !important; }
.world-home .blog-row { border-color: rgba(255, 255, 255, 0.12); }
.world-home .projects-world article[data-project-card] > div:first-child { background: rgba(14, 18, 26, 0.72) !important; backdrop-filter: blur(16px); }
```

Then, in the browser, look for remaining light-theme leftovers section by section: dark text on dark, white panels, `#f2f1ed` blocks. Fix each with a scoped rule in this same block, using the class names from `globals.css` (search them with Grep).

- [ ] **Step 7b: Gold signature at the summit** (spec: "the signature signs itself in gold across the sky"). Create `app/world/SummitSignature.tsx`:

```tsx
// app/world/SummitSignature.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Signature } from "./Signature";

/** Writes the logo in gold as its block scrolls from the bottom of the viewport to the middle. */
export function SummitSignature() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setP(1); return; }
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const r = ref.current!.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.6)));
      setP((prev) => (Math.abs(prev - k) > 0.002 ? k : prev));
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} className="summit-signature" aria-hidden="true">
      <Signature progress={p} className="summit-signature-svg" />
    </div>
  );
}
```

In `app/page.tsx`, render it as the first child of the summit wrapper: `<div data-station="summit"><SummitSignature /><ContactSection /></div>`. Append to `world.css`:

```css
.summit-signature { display: grid; place-items: center; padding: clamp(6rem, 18vh, 12rem) 1.5rem 2rem; }
.summit-signature-svg { width: min(80vw, 46rem); height: auto; color: #f3c879; filter: drop-shadow(0 0 24px rgba(255, 190, 110, 0.55)); }
```

- [ ] **Step 7c: Magnetic buttons** (spec: pointer devices only). Create `app/world/magnetic.ts`:

```ts
// app/world/magnetic.ts
/** Elements with [data-magnetic] lean toward the cursor (fine pointers only). Returns a cleanup. */
export function bindMagnetic(root: ParentNode = document) {
  if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const els = [...root.querySelectorAll<HTMLElement>("[data-magnetic]")];
  const offs = els.map((el) => {
    el.style.transition = "transform 0.6s cubic-bezier(.16,1,.3,1)";
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.25, y = (e.clientY - (r.top + r.height / 2)) * 0.35;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const leave = () => { el.style.transform = ""; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); leave(); };
  });
  return () => offs.forEach((f) => f());
}
```

Add `data-magnetic` to the hero "Start Project" link, both loader buttons, and the contact form submit button. In `World.tsx`, inside the station effect after `attach`, call `const unmag = bindMagnetic();` and return `unmag` from that effect's cleanup (re-binds per page).

- [ ] **Step 8: Verify in a browser** at `/`.
Expected:
- The loader leads into the hero over the pier.
- The video opens out of the lighthouse lens into full screen.
- Each project card makes its boat's sail play, and each service card lights its lantern while the camera glides to it.
- Testimonials sit over the shore, stories on the ridge at dawn, the contact form at the summit at sunrise, and the footer above the clouds.
- All text has at least WCAG AA contrast against the scene behind it. Check the hardest spot of each section, and add a local scrim (a `::before` gradient on the section) where it fails.

Run `npm test && npx tsc --noEmit && npm run lint`. Expected: all pass.

- [ ] **Step 9: Delete the temporary `app/world-test` page.**

---

### Task 15: Fallbacks and stills

**Files:**
- Create: `app/world/Stills.tsx`, `public/world/stills/<station>.webp` (13 files)
- Modify: `app/world/World.tsx` (render `<Stills/>` when phase is `fallback`), `app/world/engine/world.ts` (`?still=<station>` capture mode)

**Interfaces:**
- Consumes: `store.phase`, `store.activeStation` (Task 6, Task 11), `HOME_ORDER`, `STATIONS` (Task 4).
- Produces: a background image crossfade that tracks the active station when WebGL is off.

- [ ] **Step 1: Capture mode.** In `World.tsx`, if `new URLSearchParams(location.search).get("still")` names a station, skip the loader, call `api.setIgnition(1)` and `api.setPose(STATIONS[name])`, and add `html.world-capture` (CSS: `html.world-capture .world-home, html.world-capture .world-readout, html.world-capture .world-sound { visibility: hidden; }`).

- [ ] **Step 2: Capture all 13 stills.** Use the built-in browser at 1920×1080 (load the `anthropic-skills:built-in-browser` skill for its tools). For each `name` in `HOME_ORDER`, open `/?still=<name>`, wait 3 s for the environment bake, and save a screenshot to `scratchpad/stills/<name>.png`. Then convert:

```bash
mkdir -p public/world/stills
for f in "$SCRATCH"/stills/*.png; do ffmpeg -y -loglevel error -i "$f" -vf scale=1920:-2 -c:v libwebp -quality 78 "public/world/stills/$(basename "${f%.png}").webp"; done
ls -la public/world/stills
```

Expected: 13 files, each ≤ 200 KB.

- [ ] **Step 3: `Stills.tsx`**

```tsx
// app/world/Stills.tsx
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { store } from "./store.ts";

/** No-WebGL / reduced-motion backdrop: the prerendered frame of whichever station is on screen. */
export function Stills() {
  const s = useSyncExternalStore(store.subscribe, store.get, store.get);
  const [names, setNames] = useState<string[]>([]);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-station]")];
    setNames([...new Set(els.map((e) => e.dataset.station!))]);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setCurrent((e.target as HTMLElement).dataset.station!);
    }, { rootMargin: "-50% 0px -50% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  if (s.phase !== "fallback") return null;
  return (
    <div className="world-stills" aria-hidden="true">
      {names.map((n) => (
        <img key={n} src={`/world/stills/${n}.webp`} alt="" loading={n === names[0] ? "eager" : "lazy"} className={n === (current || names[0]) ? "is-on" : ""} />
      ))}
    </div>
  );
}
```

Append to `world.css`:

```css
.world-stills { position: fixed; inset: 0; z-index: 0; }
.world-stills img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1.4s ease; }
.world-stills img.is-on { opacity: 1; }
html.world-on .world-stills ~ * { position: relative; }
```

When the phase is `fallback`, `World.tsx` must still add `html.world-on` (so the dark theme applies) and render `<Stills />` instead of showing the canvas. Set `canvas.style.display = "none"`.

- [ ] **Step 4: Verify.** Check each of these:
  - `/?gl=off` → dark homepage over crossfading stills, loader skipped, all content readable.
  - Emulate `prefers-reduced-motion: reduce` in DevTools → same, plus no SplitText animation.
  - Simulate a context loss twice (`canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()` in the console, then reload) → stills on the next load. Clear it via `localStorage.removeItem("piermont:gl-lost")`.

---

### Task 16: Professionalism gate

**Files:** none new. This task fixes whatever it finds, in place.

- [ ] **Step 1: Static checks**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all succeed, with no new warnings.

- [ ] **Step 2: Bundle budget**

Run: `npm run build` and read the route table, then inspect the world chunk:
`find .next/static/chunks -name "*.js" -size +100k -exec sh -c 'printf "%s " "$1"; gzip -c "$1" | wc -c' _ {} \;`
Expected: the world chunk(s) (three + world code) total ≤ 220 KB gzipped. If they're over, check that only `three` core plus the five addons are imported (no `three/addons` barrel imports).

- [ ] **Step 3: Screenshots.** Use the built-in browser and capture each homepage section at 1440×900 and 390×844, with the loader, hero, porthole mid-open, and each section's station. Save them to the scratchpad and send the set to the user with SendUserFile.

- [ ] **Step 4: Frame rate.** In DevTools' Performance panel (or `requestAnimationFrame` sampling in the console for 5 s per section), record FPS per section at 1440×900. Then repeat with CPU 4× slowdown plus `?gl=force` on the low tier.
Expected: ≥ 58 fps median on the high tier; ≥ 45 on low. Log the numbers in the final report.

- [ ] **Step 5: Critique pass.** For each screenshot, compare against nuuke.us and list concrete defects in these categories:
  - Banding in gradients/fog (fix: grain amount).
  - Aliasing on thin geometry such as railings and masts (fix: thicken them or fade them with distance).
  - Flat lighting (fix: key/ambient balance in `timeOfDay` keys).
  - Popping: terrain `visible` switch, cloud fade, sail texture load.
  - Hard edges: fog planes, cloud planes, the water horizon.
  - Text contrast.
  - Motion that starts or stops abruptly.

  Fix each defect, re-screenshot, and repeat until the list is empty. Report the before/after pairs to the user.

- [ ] **Step 6: Accessibility.** Run these checks:
  - Tab through the page: the loader buttons, header, project links and contact form are all reachable with visible focus.
  - Screen-reader names: the loader dialog is labelled, the sound toggle state is announced, and the canvas is `aria-hidden`.
  - The skip link still works.
- [ ] **Step 7: Report to the user** with the screenshots, FPS table, bundle size, any deviations, and what's next (sub-project #2: Services).
