# Piermont World — Foundation + Home (sub-projects #0 and #1)

Date: 2026-10-14
Status: approved 2026-10-14 (no git, per the user). Plan: docs/superpowers/plans/2026-10-14-world-foundation-and-home.md

## Goal

Turn piermontstudios.com into one continuous, cinematic 3D world, harbor to
summit, that every page lives inside. This spec covers the shared engine
(#0) and the homepage journey (#1). Every other page gets its own spec later
(see "Roadmap").

Quality bar: reads as film-grade, art-directed work at the level of nuuke.us.
All 3D is generated in code (no GLB models, no prerendered video of the world).

## Decisions already made

| Topic | Decision |
|---|---|
| Theme | "Pier → Ascent": night harbor → blue hour → dawn → sunrise summit |
| Scope of home | Full journey: one fixed canvas behind the whole page; existing sections float over it |
| Sound | Opt-in on the loader ("Set sail with sound / silently"), mute toggle in header |
| 3D assets | 100% procedural code, aiming for cinematic realism |
| Architecture | Vanilla Three.js + GSAP (ScrollTrigger, SplitText) + Lenis, mounted once from the root layout (approach A) |

## Architecture

### Dependencies added
`three`, `gsap`, `lenis`. Nothing else. No React Three Fiber, no drei.

### File layout
```
app/world/
  World.tsx            client component, mounted once in app/layout.tsx; owns the <canvas>
  useStation.ts        hook pages use to declare where the camera should be
  Readout.tsx          HUD (heading / knots / tide → altitude / temp)
  Loader.tsx           replaces components/LoadingScreen.tsx
  engine/
    renderer.ts        WebGLRenderer, ACES tone mapping, sRGB, DPR cap, resize
    quality.ts         capability detection + quality tier + auto-downgrade
    post.ts            RenderPass → UnrealBloom → grade pass (grain, vignette, slight CA) → OutputPass
    loop.ts            single rAF loop, pauses when tab hidden or canvas off-screen
  scene/
    sky.ts             physical atmosphere (Preetham-based) + night stars + moon; driven by time of day
    ocean.ts           Gerstner wave water: Fresnel sky reflection, sun/moon glitter path, foam at pylons
    pier.ts            procedural planks, pylons, rope, lamp posts (canvas-painted wood textures)
    lighthouse.ts      tower, lamp room, rotating volumetric beam through noise fog
    lanterns.ts        six floating service lanterns (one color each), bob on the waves
    boats.ts           project vessels, project video shown on the sail as a VideoTexture
    terrain.ts         ridged-fBm mountain, slope/height material (rock, grass, snow), aerial perspective
    clouds.ts          cloud sea below the summit + low drifting clouds (noise-shaded layers)
    fog.ts             height fog shared by all scene modules
  camera/
    path.ts            pure: station list → smooth CatmullRom path of {position, target, fov, time}
    rig.ts             follows the path with spring damping; pointer/device-tilt parallax
  timeOfDay.ts         pure: t ∈ [0,1] → sun elevation, fog color, exposure, star opacity
  sound/
    audio.ts           Web Audio graph: master, lowpass that opens with progress, convolver reverb
    sfx.ts             procedural: harbor waves, wind, fog horn, lighthouse hum, whoosh
  stills/              prerendered frames for the no-WebGL / reduced-motion fallback
```

Each scene module exports the same shape: `create(ctx) → { update(frame), setQuality(tier), dispose() }`.
`World` owns them; nothing outside `app/world/` touches Three.js.

### How pages talk to the world
- The canvas lives in the root layout, so it survives navigation (App Router layouts don't remount).
- A section declares a station: `<section data-station="harbor-lanterns">`. `useStation` collects the
  stations on the page. ScrollTrigger maps scroll position to a path parameter.
- Pages without stations (not yet rebuilt) hide the canvas and keep their current look.
- Navigating between two world pages flies the camera between their places (the page-transition system
  is built here; it's first used by sub-project #2).

### Quality and fallbacks
- Tiers: `high` (desktop GPUs), `medium`, `low` (phones). Detection: WebGL2 support, renderer string,
  device memory, then a 2-second FPS sample that drops a tier if the median stays under 50fps.
- Software renderers (SwiftShader, llvmpipe), 2+ WebGL context losses in 3 days, or `?gl=off`:
  no canvas, and the page shows prerendered stills of each station behind the content.
- `prefers-reduced-motion`: no camera flight, no loader sequence, stills with a slow crossfade.
- The HTML content never waits on the 3D. Text is server-rendered and readable before the scene loads.

## Home journey (sub-project #1)

| # | Section (existing component, restyled) | Station | What happens |
|---|---|---|---|
| 0 | Loader (new) | `harbor-fog` | Night fog. The Piermont signature draws itself in light. "Set sail with sound / silently". Lighthouse ignites, beam sweeps, fog horn, camera pushes out |
| 1 | Hero (replaces GlitchHeadline + HeroComputer) | `pier-end` | "Brands, websites & ads built to grow." rises word by word out of the water reflection |
| 2 | HomeVideo | `lighthouse-lens` | Porthole: the video starts inside the lighthouse lens and grows to full screen, clip-path + scale driven by the camera |
| 3 | ServicesSection | `harbor-lanterns` | Pinned. Camera glides lantern to lantern; panel text swaps per service; clicking a lantern flies to it |
| 4 | ProjectsSection | `fleet` | Pinned horizontal track; cards tilt in 3D cover-flow while project boats drift past in the scene |
| 5 | StoriesSection | `landfall` | Camera lifts off the water; the mountain appears through haze |
| 6 | TestimonialsSection | `ridge-dawn` | Quotes as trail lanterns on the ridge; low clouds below |
| 7 | ContactSection | `summit` | Clouds part, sun clears the horizon, the signature signs itself in gold across the sky |
| 8 | SiteFooter | `cloud-sea` | Camera settles above the cloud tops |

Time of day runs from night (0) to sunrise (1) across the page. The HUD switches from sea units to
altitude at `landfall`.

### Signature logo
The script logo only exists as `MainLogo.png`. It gets traced to an SVG outline, plus a hand-authored
centerline stroke that follows the pen order. The centerline animates (`stroke-dashoffset`) and is
used as a mask over the outline, so the letters appear as if being written. The same asset is used
in the loader and the finale.

### Motion language
- Ease: `expo.out` for entrances; scrubbed motion is linear on scroll with the camera rig doing the smoothing.
- Text: SplitText words rise from below with a slight blur clearing (blur 6px → 0, 1.1s, 0.05s stagger).
- Lenis: duration 1.15, touchMultiplier 1.4.
- Buttons: magnetic pull on pointer devices only.

### Visual direction
The homepage becomes dark (night palette) and warms toward gold at the summit. Figtree stays the body
font, and Fragment Mono is used for the HUD. Lantern colors come from the service list. Exact palette
tokens are set during the build and reviewed with screenshots.

### Sound
Procedural ambience built in code (waves, wind, fog horn, beam hum, whoosh), so no licensing is needed
to ship. There's an optional slot for a music score file that the studio can supply later. Choosing
silent on the loader is remembered, and the header toggle mutes or unmutes at any time.

## Performance budgets
- World JS: ≤ 220 KB gzipped (three is tree-shaken), loaded after the HTML is interactive.
- High tier: 60fps on a 2020+ laptop at 1440×900. Low tier: ≥ 45fps on a mid-range 2022 Android.
- LCP is unaffected by the world (the hero text is the LCP element).
- The canvas DPR is capped at 1.75 (high) / 1.25 (low).

## Testing and the professionalism gate
- Pure logic (`camera/path.ts`, `timeOfDay.ts`, `engine/quality.ts`) gets small `*.test.ts` files run
  with Node's built-in test runner (`node --test`). No new test framework.
- `npm run build` and `npm run lint` pass.
- Visual gate per section, in a real browser:
  - Screenshots at 1440×900 and 390×844.
  - Measured FPS on each tier.
  - `?gl=off` and reduced-motion runs.
  - A side-by-side critique against nuuke.us.
  
  Anything that reads as amateur (banding, aliasing, flat lighting, pops, jank) gets fixed before
  the next section.

## Out of scope for this spec
The other pages (#2–#10). Fully custom scenes per dynamic entry. A licensed music score.

## Roadmap (each one is its own spec → plan → build → review)
2 Services (boathouse) · 3 Projects + work/[slug] (fleet) · 4 Case studies (harbor districts) ·
5 Process (topographic route) · 6 About (lighthouse interior) · 7 Solutions (chart table) ·
8 Testimonials (sky lanterns) · 9 Blog (logbook) · 10 Contact (signal fire)

## Risks
- **Realism vs. performance:** realistic water and clouds are expensive. Mitigation: quality tiers,
  and clouds as shaded layers rather than raymarched volumes.
- **Dark homepage vs. light inner pages** until those pages are rebuilt. Accepted as a temporary
  state; the transition will hide or crossfade the canvas.
- **Not a git repository:** a full homepage rewrite with no version history is risky.
  Recommendation: `git init` and commit the current state before building.
