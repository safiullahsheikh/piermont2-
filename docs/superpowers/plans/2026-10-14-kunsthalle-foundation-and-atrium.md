# Kunsthalle: Foundation + Atrium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old site with the Kunsthalle foundation (content layer, floor plan, camera, persistent R3F canvas, materials incl. satin ridges, Dock, footer, Collection) and ship the Atrium (`/`) at final quality.

**Architecture:** Pure TS modules (`app/gallery/plan.ts`, `camera.ts`) define the building and camera maths and are unit-tested with `node --test`. A tiny external store bridges DOM scroll and the R3F scene. One client `<Gallery>` in the root layout lazy-loads the R3F scene after first paint; pages are server components that mark sections with `data-station`.

**Tech Stack:** Next 16.3.4, React 19.2.8, Tailwind 4, three 0.186, @react-three/fiber 9.8, @react-three/drei 10.7, @react-three/postprocessing 3.2 (+ postprocessing 6), n8ao 2, GSAP 3, Lenis 1.

**Spec:** `docs/superpowers/specs/2026-10-14-piermont-gallery-design.md`

## Global Constraints

- Read `node_modules/next/dist/docs/` before Next code. `ssr: false` dynamic imports only inside client components.
- npm only. No git (no init, no commits). Never run commands with cwd inside `.next`.
- ESLint React-compiler rules: no synchronous setState inside effect bodies.
- Palette: bone `#F2EFE8`, concrete `#BDB8AE`, ink `#0A0A0A`, Klein blue `#002FA7`. Interface: 3px ink outlines, hard shadow `6px 6px 0 #0A0A0A`, square corners.
- Type: Archivo (Google, variable `wdth`+`wght`, via `next/font/google`) for display/body; Fragment Mono (local) for labels.
- ≥45 fps on Intel UHD 620; text is LCP; canvas loads after first paint.
- Carry-forward data stays exactly as in the spec table (site.ts constants, REVIEWS, SOCIALS, badges, addresses, brands, projects, contact API).
- Memory is tight on this machine (~1.6 GB free): one dev server at a time, headless captures in small batches.

---

### Task 1: Clean slate + dependencies

**Files:**
- Delete: `app/world/`, `app/about/`, `app/process/`, `app/testimonials/`, `app/solutions/`, `app/case-studies/`, `app/projects/`, `app/services/`, `app/template.tsx`, `public/world/`, all of `app/components/` except `ContactSection.tsx`, `CookieBanner.tsx`, `LazyVideo.tsx`.
- Move: `app/work/projects.ts` → `app/content/projects.ts`; `app/blog/posts.ts` → `app/content/posts.ts` (blog routes deleted; Journal rebuilt in a later plan).
- Delete: `app/work/` (rebuilt in plan 2), `app/blog/`.
- Modify: `package.json` (deps, `test` script → `node --test "app/**/*.test.ts"`), `app/sitemap.ts` (only `/` and `/contact` for now… plus later routes as they ship).

- [ ] Step 1: Delete/move the files above. Keep `app/api/contact/route.ts`, `app/site.ts`, `app/robots.ts`, icons.
- [ ] Step 2: `npm i @react-three/fiber@9 @react-three/drei@10 @react-three/postprocessing@3 postprocessing@6 n8ao@2` (three, gsap, lenis already present).
- [ ] Step 3: Write a placeholder `app/page.tsx` (`<main><h1>Piermont</h1></main>`) and strip `app/layout.tsx` of World/Loader/LoadingScreen imports.
- [ ] Step 4: `npx tsc --noEmit` → fix every dangling import until clean.

### Task 2: Content layer

**Files:** Modify `app/site.ts`; Create `app/content/wings.ts`, `app/content/content.test.ts`.

**Interfaces — Produces:**
- `site.ts`: `LOCATIONS: { country: "USA" | "UK"; city: string; address: string }[]`, `BRANDS: { slug: string; name: string }[]` (12 entries, `public/brands/<slug>.png`), plus unchanged `PHONE, EMAIL, SOCIALS, REVIEWS, pageMeta, SITE_URL`.
- `wings.ts`: `WINGS: Wing[]` where `Wing = { slug: string; group: string; title: string; punch: string; lede: string; medium: "screen" | "device" | "print" | "projection" | "vertical" }` (6 entries, slugs = the old `CATEGORIES` slugs), and `projectsIn(wing: Wing): Project[]`.

- [ ] Step 1: Failing test `app/content/content.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { PROJECTS } from "./projects.ts";
import { WINGS, projectsIn } from "./wings.ts";
import { BRANDS, LOCATIONS, REVIEWS, SOCIALS } from "../site.ts";
import { existsSync } from "node:fs";

test("every project belongs to exactly one wing", () => {
  const total = WINGS.reduce((n, w) => n + projectsIn(w).length, 0);
  assert.equal(total, PROJECTS.length);
});
test("carry-forward data is intact", () => {
  assert.deepEqual(REVIEWS.map((r) => r.label), ["Bark", "Trustpilot", "Google Reviews", "Clutch"]);
  assert.deepEqual(SOCIALS.map((s) => s.label), ["Instagram", "LinkedIn"]);
  assert.equal(LOCATIONS.length, 2);
  assert.equal(BRANDS.length, 12);
  for (const b of BRANDS) assert.ok(existsSync(`public/brands/${b.slug}.png`), b.slug);
});
```

- [ ] Step 2: Run `npm test` → FAIL (wings/BRANDS missing).
- [ ] Step 3: Implement `LOCATIONS`, `BRANDS` in `site.ts`; `wings.ts` with punch lines (Website Design "Built to be walked through.", UI/UX Design "Every pixel, on purpose.", Product Development "From sketch to shipped.", Branding "Identity, hung in good light.", Performance Marketing "Attention, measured.", Video Editing "Cut to the feeling.") and `projectsIn = (w) => PROJECTS.filter((p) => p.group === w.group)`.
- [ ] Step 4: `npm test` → PASS.

### Task 3: Floor plan + camera maths

**Files:** Create `app/gallery/plan.ts`, `app/gallery/camera.ts`, `app/gallery/plan.test.ts`.

**Interfaces — Produces:**

```ts
export type Vec3 = [number, number, number];
export type Pose = { pos: Vec3; look: Vec3; fov: number };
export type RoomId = "atrium" | "gallery" | "exhibit" | "wings" | "studio" | "reading" | "desk";
export type Room = { id: RoomId; label: string; punch: string; href: string; x0: number; z0: number; x1: number; z1: number; h: number; stations: Pose[] };
export type Door = { a: RoomId; b: RoomId; at: Vec3; w: number; h: number }; // centre of the opening, on the shared wall
export const ROOMS: Record<RoomId, Room>;
export const DOORS: Door[];
export function roomForPath(pathname: string): RoomId;
export function route(from: RoomId, to: RoomId): RoomId[];            // BFS over DOORS
// camera.ts
export function poseAt(stations: Pose[], u: number): Pose;            // u in [0, stations.length-1], Catmull-Rom on pos/look, linear fov
export function walk(from: Pose, rooms: RoomId[], to: Pose): Pose[];   // from → each door (approach + exit pose) → to
```

- [ ] Step 1: Failing tests:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { DOORS, ROOMS, roomForPath, route } from "./plan.ts";
import { poseAt, walk } from "./camera.ts";

const inside = (id: keyof typeof ROOMS, [x, y, z]: number[]) => {
  const r = ROOMS[id];
  return x > r.x0 + 0.5 && x < r.x1 - 0.5 && z > r.z0 + 0.5 && z < r.z1 - 0.5 && y > 0.3 && y < r.h - 0.3;
};
test("every station sits inside its room", () => {
  for (const r of Object.values(ROOMS)) for (const s of r.stations) assert.ok(inside(r.id, s.pos), `${r.id} ${s.pos}`);
});
test("every door sits on a wall shared by its two rooms", () => {
  for (const d of DOORS) {
    const a = ROOMS[d.a], b = ROOMS[d.b], [x, , z] = d.at;
    const onX = (a.x1 === b.x0 || a.x0 === b.x1) && (x === a.x1 || x === a.x0);
    const onZ = (a.z1 === b.z0 || a.z0 === b.z1) && (z === a.z1 || z === a.z0);
    assert.ok(onX || onZ, `${d.a}-${d.b}`);
  }
});
test("the building is connected", () => {
  for (const id of Object.keys(ROOMS) as (keyof typeof ROOMS)[]) assert.equal(route("atrium", id).at(-1), id);
});
test("routes map to rooms", () => {
  assert.equal(roomForPath("/"), "atrium");
  assert.equal(roomForPath("/work"), "gallery");
  assert.equal(roomForPath("/work/augen-pro"), "exhibit");
  assert.equal(roomForPath("/services/branding"), "wings");
  assert.equal(roomForPath("/contact"), "desk");
});
test("poseAt hits stations exactly and clamps", () => {
  const s = ROOMS.atrium.stations;
  assert.deepEqual(poseAt(s, 0).pos, s[0].pos);
  assert.deepEqual(poseAt(s, s.length - 1).pos, s.at(-1)!.pos);
  assert.deepEqual(poseAt(s, 99).pos, s.at(-1)!.pos);
});
test("walks between rooms pass through each door opening", () => {
  const rooms = route("atrium", "desk");
  const path = walk(ROOMS.atrium.stations[0], rooms, ROOMS.desk.stations[0]);
  for (let i = 0; i + 1 < rooms.length; i++) {
    const d = DOORS.find((x) => (x.a === rooms[i] && x.b === rooms[i + 1]) || (x.b === rooms[i] && x.a === rooms[i + 1]))!;
    assert.ok(path.some((p) => Math.hypot(p.pos[0] - d.at[0], p.pos[2] - d.at[2]) < 0.01 && p.pos[1] < d.h), "door " + d.a + d.b);
  }
});
```

- [ ] Step 2: `npm test` → FAIL.
- [ ] Step 3: Implement. Layout (metres, y up, −z is north): atrium `x −15..15, z −15..15, h 18`; desk (lobby) south `x −8..8, z 15..30, h 6`; gallery east `x 15..75, z −6..6, h 8`; exhibit `x 75..95, z −10..10, h 9`; wings west `x −51..−15, z −9..9, h 8`; studio `x 15..35, z 6..26, h 6` (south of the gallery; the atrium's north wall holds the Void, so nothing is built north); reading room `x −35..−15, z 9..29` (south of wings, shared wall z = 9). Doors: atrium–desk at `[0,0,15]` w 5 h 4.5; atrium–gallery `[15,0,0]` w 6 h 6; gallery–exhibit `[75,0,0]` w 5 h 6; atrium–wings `[−15,0,0]` w 6 h 6; gallery–studio `[25,0,6]` w 4 h 4; wings–reading `[−25,0,9]` w 4 h 4. `walk` emits, per door, a pose 3 m before the opening, the opening itself at y = 1.7, and 3 m past it, each looking ahead along the travel direction.
- [ ] Step 4: `npm test` → PASS.

### Task 4: Store, scroll and the persistent canvas

**Files:** Create `app/gallery/store.ts`, `app/gallery/Gallery.tsx` (client), `app/gallery/three/Scene.tsx`, `app/gallery/three/Rig.tsx`, `app/gallery/three/tier.ts`, `app/gallery/Stills.tsx`; Modify `app/layout.tsx`.

**Interfaces — Produces:**
- `store`: `{ get(): GalleryState; set(p: Partial<GalleryState>): void; subscribe(fn): () => void }`, `GalleryState = { phase: "idle" | "loading" | "ready" | "fallback"; entered: boolean; sound: boolean; menu: boolean; room: RoomId; u: number; tier: "high" | "low" }`.
- `<Gallery />` mounted once in `layout.tsx`, `aria-hidden`, fixed full-bleed behind content (`z-index: 0`; content `z-index: 1`).
- Pages tag sections `data-station="<index>"`; Gallery maps scroll to `u` = station index + fractional progress (IntersectionObserver for the active index, scroll position within it for the fraction) and to `room` via `roomForPath(usePathname())`.

- [ ] Step 1: `tier.ts`: `detectTier(gl)`: reads `WEBGL_debug_renderer_info`; `/Intel|Mali|Adreno|Apple GPU/i` or `devicePixelRatio > 2 && innerWidth < 900` → `"low"`; no WebGL2, `?gl=off`, or `prefers-reduced-motion` → fallback.
- [ ] Step 2: `Scene.tsx`: `<Canvas dpr={tier === "high" ? [1, 2] : 1} gl={{ antialias: false, powerPreference: "high-performance" }} camera={{ fov: 45, near: 0.1, far: 400 }} flat={false}>` + `<Environment files="/gallery/hdri/studio_1k.hdr" />` + `<Building />` + `<Rig />` + `<EffectComposer>` (`N8AO` high only, `Bloom` luminanceThreshold 0.9, `ToneMapping` AgX, `SMAA`). Context loss → `store.set({ phase: "fallback" })`.
- [ ] Step 3: `Rig.tsx`: each frame, target pose = route change ? next pose on the `walk()` path (advance at 6 m/s, ease in/out) : `poseAt(room.stations, u)`; damp camera toward target with `1 - exp(-dt * 4)`; pointer parallax ±0.15 m (high tier only).
- [ ] Step 4: `Gallery.tsx`: `dynamic(() => import("./three/Scene"), { ssr: false })`, rendered after `requestIdleCallback`; canvas fades in on `phase === "ready"`; `Stills` shown on fallback.
- [ ] Step 5: Verify: dev server, `/` shows the canvas behind the placeholder heading; `?gl=off` shows no canvas. `npx tsc --noEmit` clean.

### Task 5: Building + materials (incl. satin ridges)

**Files:** Create `app/gallery/three/materials.ts`, `app/gallery/three/Building.tsx`, `app/gallery/three/Ridges.tsx`; Add `public/gallery/tex/*` (ambientCG CC0, 1K JPG → resized; `Concrete034`, `Plaster001`, `Concrete044C` floor) and `public/gallery/hdri/studio_1k.hdr` (Poly Haven CC0 `studio_small_09`).

**Interfaces — Produces:** `useMaterials(): { concrete, plaster, floor, satin, satinBlue, ink, ikbVoid }` (memoised `MeshStandardMaterial`/`MeshPhysicalMaterial`); `<Ridges width height depth pitch color />` (instanced half-cylinder flutes with satin material, ~0.35 roughness, `anisotropy 0.6` on MeshPhysicalMaterial); `<Building />` renders every room: floor slab (polished concrete, `roughness 0.25`, faint reflections via `MeshReflectorMaterial` in the atrium only, high tier), walls with door openings cut (wall split into segments around `DOORS`), ceiling slabs with skylight in the atrium, 4 cm shadow gap at wall bases (black strip — classic gallery detail).

- [ ] Step 1: Download textures/HDRI with curl into `public/gallery/…`; record sources in `app/credits-data.ts` (`{ asset, author, licence, url }[]`).
- [ ] Step 2: Implement materials + Ridges + Building.
- [ ] Step 3: Visual check: `/` with a temporary debug station looking at the atrium; screenshot; walls/ridges/doors read correctly, no z-fighting, ridges catch the key light in lines.

### Task 6: UI kit — tokens, Dock, floor-plan menu, footer, Collection, Reveal, Bento

**Files:** Create `app/ui/ui.css` (imported by `app/globals.css`, which is rewritten), `app/ui/Dock.tsx`, `app/ui/FloorPlan.tsx`, `app/ui/Footer.tsx`, `app/ui/Collection.tsx`, `app/ui/Reveal.tsx`, `app/ui/Bento.tsx`, `app/ui/Button.tsx`; Modify `app/layout.tsx` (fonts, Dock, Footer stays per-page).

- [ ] Step 1: Tokens in `ui.css`: CSS vars for palette, `--shadow: 6px 6px 0 var(--ink)`, `--border: 3px solid var(--ink)`, type scale (`clamp()` display sizes up to 14vw for hero), Archivo `font-stretch` 112–125% for display.
- [ ] Step 2: `Button` (`variant: "ink" | "blue" | "bone"`, press collapses shadow with `translate(6px,6px)`; magnetic on fine pointers).
- [ ] Step 3: `Dock`: states `entry | nav | menu`; FLIP morph of width/height via the Web Animations API with a spring-like `cubic-bezier(.2,1.4,.3,1)`; nav shows `NN / Room label`, progress rule bound to store `u`, Menu, sound toggle, CTA → `/contact`; hide on fast downward scroll. Entry buttons set `store.entered` (+ `sound`).
- [ ] Step 4: `FloorPlan`: SVG drawn from `ROOMS`/`DOORS` (same data as the 3D — single source of truth), rooms as `<a>` with IKB hover fill, punch line + still preview; side column: phone, email, socials, both addresses. Focus trap + Esc.
- [ ] Step 5: `Footer`: Achievements (`ClutchandGoogle.png`, `Trustpilot.png`, REVIEWS icons with links when `href`), nav (all rooms), LOCATIONS, PHONE, EMAIL, SOCIALS, copyright; giant outlined PIERMONT wordmark across the bottom; bento layout.
- [ ] Step 6: `Collection`: two rows, opposite directions, duplicated track, CSS `@keyframes` translate; each piece = passe-partout + ink frame + hard shadow + monochrome logo (`filter: grayscale(1) contrast(1.2)`), Fragment Mono label `No. 01 · Alo`; hover: row `animation-play-state: paused`, piece lifts, logo full colour, IKB spotlight (radial-gradient pseudo-element); edge mask fade; reduced motion → static wrap grid.
- [ ] Step 7: `Reveal` (masked line reveal + fade on enter/leave via IntersectionObserver + CSS; reduced motion → plain fade) and `Bento` (CSS grid with span props; tile hover lift).

### Task 7: The Atrium (3D)

**Files:** Create `app/gallery/three/rooms/Atrium.tsx`, `app/gallery/three/Void.tsx`, `app/gallery/three/Screen.tsx`.

- [ ] Step 1: `Void`: a recessed 14 m × 10 m opening in the atrium's north wall, 2 m deep; inner surfaces `MeshBasicMaterial` pure IKB (`#002FA7` in linear space, `toneMapped: false`) — no shading at all, so it reads as a flat hole; 3 cm crisp concrete rim; velvet grain via a tiny animated noise in an `onBeforeCompile` patch (±1.5% value).
- [ ] Step 2: `Screen`: 16:9 or native-aspect panel with a video texture (`useVideoTexture`, muted, loop, `start: false`), plays only while `active`; thin ink bezel; emissive so it glows lightly under bloom.
- [ ] Step 3: Featured emergence: six featured projects (first project of each wing). For station `k` (k = 2…7 on the home page) the active screen rises out of the void: z from −2.2 (inside, hidden by depth-fade to IKB: material `opacity` & `color` lerp to IKB) to +1.2 in front of the wall, with a 4° tilt settle; others sink back. Driven by store `u`.
- [ ] Step 4: Lighting: skylight key (`RectAreaLight` 12×12 m, warm 4800K, high tier; `DirectionalLight` + soft shadow on low), raking spots on the ridge walls either side of the void, low IKB light strip along the floor of the void rim (emissive → bloom).
- [ ] Step 5: Atrium stations (8): hero wide from the lobby door looking at the void; manifesto drift; 6 featured close-ups (one per exhibit); collection/achievements pull-back up to the mezzanine; CTA looking back toward the lobby (desk) door.

### Task 8: The Atrium (page)

**Files:** Rewrite `app/page.tsx`, Create `app/atrium.css` (scoped `.atr-*`).

Sections (each `data-station`):
0. Hero: `PIERMONT` at 14vw, Archivo expanded black, ink on bone with a hard IKB offset duplicate; punch *"Look closer. It's all ours."*; kicker `Kunsthalle · est. Sheridan / London`.
1. Manifesto: three Reveal lines.
2–7. Featured exhibits: wall label card (client, discipline, medium, tagline, link to `/work/<slug>`) beside the emerging screen; carousel controls (prev/next jump to station) + keyboard.
8. Bento "Every discipline, framed.": 6 wing tiles (links `/services/<slug>`), 1 studio tile, 1 journal tile.
9. Collection (logos) + achievements strip.
10. CTA "Your piece goes here." → `/contact`. Then `<Footer />`.

- [ ] Step 1: Build page; metadata via `pageMeta`; JSON-LD Organization (addresses, phone, email, sameAs SOCIALS).
- [ ] Step 2: Desktop 1440×900 + mobile 390×844 screenshots of every station; fix until: text legible on every frame (AA), void reads as a flat colour field, exhibits fully visible, no overlap with the Dock.
- [ ] Step 3: Gates: `npm test`, `npx tsc --noEmit`, `npx eslint .` (0 errors), FPS ≥45 headless on dev.

### Task 9: Redirects + interim routes

**Files:** Modify `next.config.ts`, `app/sitemap.ts`.

- [ ] Step 1: Permanent redirects: `/projects` → `/work`, `/case-studies/:c` → `/services/:c`, `/solutions/:s` → `/services`, `/about` `/process` `/testimonials` → `/studio`, `/blog` → `/journal`, `/blog/:slug` → `/journal/:slug`.
- [ ] Step 2: Contact keeps working at `/contact` with the existing `ContactSection` until its room ships (plan 5) — wrap in a minimal page with the Footer so no footer link 404s except rooms not yet built (listed in the hand-off).
