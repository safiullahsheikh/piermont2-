# Piermont Kunsthalle: ground-up rebuild

Date: 2026-10-14. Supersedes `2026-10-14-world-foundation-and-home-design.md` (harbor/ascent world), which is discarded entirely.

## Goal

Rebuild piermontstudios.com from zero as one continuous 3D gallery building in which **Piermont's own projects are the art**. Quality bar: on par with nuuke.us in craft, motion and polish, but a look that is unmistakably Piermont's own and shares nothing with NUUKE's space/pink-neon look (NUUKE lists Piermont as a partner).

## Global constraints

- Next.js 16.3.4 (Turbopack), React 19.2.8, Tailwind 4. Read `node_modules/next/dist/docs/` before writing Next code (AGENTS.md).
- npm only. Node 24. Deploy target unchanged: Cloudflare via `@opennextjs/cloudflare` (`wrangler.jsonc`, `open-next.config.ts`, `public/_headers`).
- **No git**: no init, no commits.
- Never run shell commands with cwd inside `.next`.
- ESLint React-compiler rules apply (no synchronous setState in effect bodies).
- Reference machine GPU: Intel UHD 620. Must hold ≥45 fps there; 60 fps on any discrete GPU.
- Every page is unique, animated and 3D. Opt-in sound only.
- The old site is replaced in place. Everything not listed under "Carried forward" is deleted.

## Carried forward (must survive unchanged in substance)

| Item | Source today |
|---|---|
| 25 projects: copy, images, videos, sections, 6 discipline groups | `app/work/projects.ts`, `public/projects/*` |
| Contact form behaviour, service options, budgets, Turnstile, `/api/contact` route | `app/components/ContactSection.tsx`, `app/api/contact/route.ts` |
| Business constants: phone 307-655-6848, harris@piermontstudios.com, `SITE_URL`, `pageMeta()` | `app/site.ts` |
| Socials: Instagram, LinkedIn | `SOCIALS` in `app/site.ts` |
| Review profiles: Bark, Trustpilot, Google Reviews, Clutch (icons + optional links) | `REVIEWS` in `app/site.ts`, `public/reviews/*` |
| Achievement badges: Clutch Top 1000 + Google 5★, Trustpilot | `public/OtherAssets/ClutchandGoogle.png`, `Trustpilot.png` |
| Addresses: USA 30 N Gould St, Ste R, Sheridan, WY 82801; UK 66 Paul Street, London EC2A 4NA | `LOCATIONS` in `SiteFooter.tsx` |
| Client brand logos | `public/brands/*` |
| 8 blog posts, migrated to the Journal | `app/blog/posts.ts` |
| SEO: root metadata, per-page `pageMeta`, sitemap, robots, JSON-LD, OG image, icons | `app/layout.tsx`, `sitemap.ts`, `robots.ts` |
| Cookie consent banner (key `piermont-cookie-consent`) | `app/components/CookieBanner.tsx` |
| Fonts on disk: Fragment Mono (labels) | `public/Font/fragment-mono` |

Old URLs (`/projects`, `/case-studies/*`, `/solutions/*`, `/about`, `/process`, `/testimonials`, `/blog/*`) get permanent redirects to their new homes in `next.config.ts`, so search rankings carry over.

## Concept

**The Kunsthalle.** A neobrutalist concrete gallery: board-formed concrete, raw plaster, steel, skylights, deep shadow, generous emptiness. Every route is a room in the same building, and navigation is a camera walk between rooms on one persistent canvas. The house colour is **International Klein Blue `#002FA7`**: one monochrome IKB wall per room, IKB light strips, and IKB interface accents.

**The art is the work.** Each project is exhibited in its native medium:
- Websites and apps: the project video plays on a real device model (laptop or phone on a plinth) or a large wall-screen.
- Branding: large framed prints and light boxes.
- Video editing: a dark projection room.
- Performance marketing: a wall of vertical screens.

**The Atrium centrepiece is the Monochrome Void:** a monumental Klein-blue volume set into the atrium wall, pigment so matte and deep it reads as a flat hole with no depth (an Anish Kapoor-style effect). Scroll draws the camera toward it, and the featured projects emerge out of the blue one by one, then sink back. Technically it is an unlit pure-IKB surface with no shading, edge falloff or AO inside, plus a subtle velvet grain. Exhibits rise out of it through a depth fade, and the hard rim of the surrounding concrete sells the illusion.

Real `.glb` models are used only for gallery furniture: frames, plinths, laptop, phone, benches, track spotlights. They are licensed CC0 (Poly Haven, Kenney or equivalent) and credited on `/credits` where a licence asks for it. **Satin ridges** are the building's signature finish: fluted, ribbed panels with a satin sheen (low roughness ~0.35, soft anisotropic-looking highlights that run along each ridge). They appear on feature walls behind exhibits, the plinth sides, the front desk and the door reveals, in concrete-grey and a deep Klein-blue variant. The ridges are real geometry where the camera gets close and a procedural normal map elsewhere. They make the spotlights rake across the surface in lines, which gives the rooms their richness against the raw concrete. Surfaces use CC0 photoscanned PBR textures (ambientCG / Poly Haven), compressed to KTX2.

## Sitemap and rooms

| Route | Room | Content and choreography |
|---|---|---|
| `/` | **The Atrium** | Hero: giant PIERMONT type over the hall, facing the Monochrome Void. Then a manifesto (fade-in lines), and featured exhibits (6 projects, one per discipline) emerging from the void in turn, with a carousel control to step through them, a neo-bento "what we do" grid linking to the 6 wings, the **Collection** (client logo marquee, see below), the achievements strip, and a CTA. |
| `/work` | **The Long Gallery** | A corridor with all 25 exhibits, each with a museum wall label (client, year, discipline, medium). Filter chips per discipline re-light the corridor, leaving the matching exhibits lit and the rest dimmed. |
| `/work/[slug]` | **Exhibit Room** | One room per project. The camera arrives at the exhibit, the video or print fills the room, case-study sections appear as wall texts one by one, and a "Next exhibit" doorway leads to the neighbouring project. |
| `/services` | **The Wings (index)** | A plan view of the 6 wings as a neo-bento map; each tile flies the camera into its wing. |
| `/services/[wing]` | **Wing** (×6: Website Design, UI/UX, Product Development, Branding, Performance Marketing, Video Editing) | Each wing is curated from that discipline's projects and has its own lighting and medium. New copy explains the service; the exhibits prove it. |
| `/studio` | **The Workshop** | Behind the gallery: worktables, pinned process boards. Covers who we are, how we work (process steps as a scroll sequence) and principles. |
| `/journal`, `/journal/[slug]` | **Reading Room** | A lectern and shelves. Posts appear as index cards in a bento grid; an article reads as a long wall text with its media. |
| `/contact` | **Front Desk** | The reception desk with street light through the entrance. The contact form is styled as a visitor slip; the two branches (Sheridan, WY and London EC2A) are on "branch plaques". |
| `/credits` | (no room) | Asset licences. |

Every page ends in the **neobrutalist footer**: achievements (both badges plus the four review icons), navigation, both addresses, phone, email, Instagram, LinkedIn, and copyright.

## The Collection (client logos as art pieces)

The 12 client logos from the old marquee (`public/brands/*`: Alo, Bacardi, Baileys, Burberry, Columbia, Diesel, Heineken, Louis Vuitton, On, Qatar Airways, Reebok, The North Face) are exhibited as a small permanent collection.

- **Base:** hand-built minimal logo marquee in two directions, modelled on React Bits Pro Social Proof 9. No React Bits dependency or licence. It uses a CSS keyframe marquee with a duplicated track; the speed and direction per row are props.
- **Adaptation, logos as art pieces:**
  - Each logo is mounted as a gallery piece: a bone-white passe-partout inside a 3 px ink frame with a hard offset shadow, the logo rendered monochrome ink.
  - Under each piece is a Fragment Mono museum label: `No. 07 · Heineken · Client since 20XX`. Labels show the brand name only where years are unknown; no invented dates.
  - Two rows travel in opposite directions.
  - On hover the marquee row slows to a stop, the piece lifts (the shadow grows), the logo floods to its true brand colour, and an IKB spotlight cone falls on it.
  - The edges fade into the wall, and the marquee is paused for reduced motion.
- **Placement:** the Atrium (full width, between the featured exhibits and the achievements) and a compact single-row variant on `/studio`.

## The Dock (navigation, bottom of the page)

There is no top toolbar. Navigation is a **bottom-centred dock**, inspired by NUUKE's morphing bottom pill but more capable and modern:

- **One element that morphs** (FLIP plus spring easing) between states:
  1. Entry: `Enter the gallery` / `Enter with sound`.
  2. Browsing: room index and name (`03 / Long Gallery`), a live scroll-progress rule, a `Menu` button, the sound toggle and a `Start a project` CTA.
  3. Menu open: the dock becomes `Close`.
- **Neobrutalist styling:** a bone fill, 3 px ink outline, hard offset shadow and an IKB active state. It hides on fast downward scroll and returns on upward scroll or a pause.
- **The menu is a live floor plan,** not a list: a full-screen overlay showing the gallery plan drawn in ink lines with every room as a hit area. Hovering a room highlights it in IKB and shows a preview still and its punch line; clicking closes the menu and flies the camera to that room. Contact details, socials and both addresses sit in a side column.
- **Mobile:** a full-width thumb-reach bar (room name, menu, CTA). The menu is a stacked floor plan.
- **Accessibility:** `nav` landmark, focus trap and Esc while the menu is open, focus returned to the menu button on close. Rooms are listed as real links, so the dock works without JavaScript.

## Copy voice: artistic punch lines

Every room and section leads with a short, artful punch line: gallery-wall aphorisms, 2 to 6 words, confident, a little witty, never generic agency-speak. Examples of the register:
- Atrium: *"Look closer. It's all ours."*
- Void: *"Out of the blue."*
- Long Gallery: *"Twenty-five rooms of proof."*
- Wings: *"Every discipline, framed."*
- Front Desk: *"Your piece goes here."*

Body copy stays short and plain underneath.

## Visual system

- **Palette.** Bone `#F2EFE8` (page), concrete `#BDB8AE`, ink `#0A0A0A`, Klein blue `#002FA7`, plus white for text on IKB. No gradients in the interface.
- **Neobrutalist interface.** 3 px ink outlines, hard offset shadows (`6px 6px 0 #0A0A0A`) that collapse to `0 0` on press, square corners, flat fills.
- **Type.** A heavy grotesque display face for headlines (self-hosted woff2, OFL licence, chosen during the Atrium build from Space Grotesk / Archivo / Familjen Grotesk by screenshot comparison). Fragment Mono for labels, wall-label metadata and UI chrome. The display face doubles as body text at 400/500.
- **Layout.** Lots of empty space. Neo-bento grids: chunky outlined tiles of mixed spans.

## Motion system

- **Fade-ins and fade-outs:** masked line reveals, staggered entrances, fade-through between rooms.
- **Neo-bento:** tiles lift on hover (shadow grows), press on click, and the cursor spotlight brightens the tile's 3D counterpart.
- **Carousels:** used where content calls for them (featured exhibits, client logos, journal). Drag, keyboard and wheel input with inertia.
- **Hover:** magnetic buttons, tilt cards, a cursor-following gallery spotlight in 3D.
- **Scroll-driven 3D:** the camera walks per room; exhibits light up as they are reached; projects emerge from the void; videos start only when on screen.
- **Room-to-room transitions:** the canvas persists, the camera flies through doorways, and HTML fades out and back in.
- Everything respects `prefers-reduced-motion`: no camera flight and no parallax, only simple fades.

## Architecture

- **3D stack:** `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, three. GSAP and Lenis handle scroll. These replace the old vanilla engine (`app/world/**`, deleted).
- **One persistent `<Canvas>`** in the root layout (client component, dynamically imported after first paint). Pages declare their room and scroll stations; a small external store (`useSyncExternalStore`) maps route plus scroll progress to a camera pose and to the active/lit exhibits.
- **Building.** Rooms are generated in code from slabs and box primitives (brutalism is literally slabs), with PBR concrete and plaster materials. They are laid out on one floor plan so walks between rooms are real paths.
- **Lighting.** HDRI environment, spot and area lights per room, real-time soft shadows on the key light only, N8AO ambient occlusion, light bloom on IKB strips and screens, and tone mapping. No light baking (Blender is not available).
- **Exhibits.** Video textures load lazily and play only when visible. Images are KTX2/WebP. There is at most one active video per frame on low-tier GPUs.
- **Assets.** `.glb` files are processed with gltf-transform (meshopt and texture compression), lazy-loaded per room, and preloaded for the neighbouring room.
- **Quality tiers.**
  - High: full post-processing, DPR up to 2.
  - Low (iGPU or mobile): no AO, bloom only, DPR 1, fewer shadows.
  - Fallback (no WebGL, reduced motion or context loss): prerendered 1920×1080 WebP still per room station, ≤200 KB each.
- **HTML first.** All copy is server-rendered and readable before the 3D arrives. LCP is text. The canvas fades in when ready.
- **Sound (opt-in):** gallery room tone plus a soft step on room transitions. Off by default; the toggle lives in the Dock.

## Copy

New Services (6 wings) and Studio copy is written in a confident, spare gallery voice and drawn from the project case studies. The user reviews it afterwards. Project, contact and journal content migrates verbatim.

## Accessibility

- Semantic landmarks; one `h1` per page.
- All interactive elements are keyboard-reachable with visible IKB focus rings.
- The canvas is `aria-hidden`; the HTML holds all content.
- Contrast is AA or better, including on IKB (white on `#002FA7` passes).
- Reduced-motion is honoured. Videos are muted with controls exposed on exhibit pages.

## Quality gates (per room, then site-wide)

1. Desktop (1440×900) and mobile (390×844) screenshots of every station, reviewed and polished before moving on.
2. `npx tsc --noEmit`, `npx eslint .` with 0 errors, `npm test` (store and path logic, plus clearance and collision checks for camera paths), and `npm run build`.
3. Bundle: report first-load JS gzip per route honestly. Target ≤260 KB for the 3D route chunk, loaded after first paint.
4. FPS measured on the production build (headless and on the UHD 620 machine).
5. Fallback checks: `?gl=off`, reduced motion, forced context loss.
6. Lighthouse: accessibility ≥95, SEO 100.

## Build order

1. Foundation: clean out the old site, install the R3F stack, add the store, canvas, building shell, materials, quality tiers, interface tokens, the Dock and footer.
2. Atrium (`/`).
3. Long Gallery (`/work`) and Exhibit Room (`/work/[slug]`).
4. Wings (`/services`, `/services/[wing]`).
5. Workshop (`/studio`).
6. Reading Room (`/journal`, `/journal/[slug]`).
7. Front Desk (`/contact`), redirects, `/credits`.
8. Fallback stills, performance pass, final gates and report.
