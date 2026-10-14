// Every page is a shot of the same machine. Units: the monitor is 4 wide; y is up; the screen faces +z.
// One source of truth for the camera, the nav and the menu.

export type Vec3 = [number, number, number];
export type Pose = { pos: Vec3; look: Vec3; fov: number };
export type SceneId = "home" | "work" | "project" | "services" | "studio" | "journal" | "contact";
export type Scene = {
  id: SceneId;
  label: string;
  href: string;
  /** Loop shown on the screen when no section asks for anything else. */
  screen: string;
  stations: Pose[];
};

const p = (pos: Vec3, look: Vec3, fov = 32): Pose => ({ pos, look, fov });

/** Where the CRT sits: centre, size and the plane of the glass. */
export const SCREEN = { x: 0, y: 3.02, w: 3.04, h: 2.3, z: 1.08 } as const;
export const KEYBOARD = { z: 3.15 } as const;

export const SCENES: Record<SceneId, Scene> = {
  home: {
    id: "home", label: "Home", href: "/", screen: "/OtherAssets/pcVideo.mp4",
    stations: [
      p([3.2, 3.8, 14], [-3.4, 2.5, 0], 30), // 0 hero: the machine on the right, the headline on the left
      p([0, SCREEN.y, 2.9], [0, SCREEN.y, 0], 46), // 1 showreel: through the glass
      ...[0, 1, 2, 3, 4, 5].map((i) => p([-3.4 - (i % 2) * 0.6, 3.0 + (i % 3) * 0.25, 10 + (i % 2) * 0.6], [2.4, 2.7, 0], 30)), // 2–7 selected work, on its screen
      p([-9, 9.5, 11], [0.5, 1.6, 0], 36), // 8 more work: high and wide
      p([0.6, 7.6, 8.2], [0, 0.4, 2.6], 34), // 9 services: over the keyboard
      p([8.6, 3.6, 3.2], [0, 2.4, 0.4], 30), // 10 voices: in profile
      p([-6.5, 6.5, -6.5], [0, 2.4, 0], 32), // 11 clients + journal: from behind, light spilling forward
      p([0, 2.8, 10.5], [0, 2.6, 0], 32), // 12 call: square on
    ],
  },
  work: {
    id: "work", label: "Work", href: "/work", screen: "/video.mp4",
    stations: [p([0, 4.2, 15], [0, 2.8, 0], 40), p([0, 9, 13], [0, 2, 0], 42)],
  },
  project: {
    id: "project", label: "Project", href: "/work", screen: "/video.mp4",
    stations: [p([0, SCREEN.y, 6.2], [0, SCREEN.y, 0], 34), p([-4.5, 3.4, 8], [0.8, 2.8, 0], 32), p([4.5, 3, 7.5], [-0.8, 2.6, 0], 32)],
  },
  services: {
    id: "services", label: "Services", href: "/services", screen: "/OtherAssets/BrandIdentityVideo.mp4",
    stations: [p([0, 3.6, 13], [0, 2.4, 2], 34), p([0, 6.5, 9], [0, 1, 3], 34)],
  },
  studio: {
    id: "studio", label: "Studio", href: "/studio", screen: "/video.mp4",
    stations: [p([0, 3, 9], [0, 3.4, 0], 52), p([0, 1.6, 6], [0, 5, -4], 58), p([6, 4, 6], [0, 3, 0], 46)],
  },
  journal: {
    id: "journal", label: "Journal", href: "/journal", screen: "/OtherAssets/DesignVideo.mp4",
    stations: [p([-3.2, 3.4, 11], [1.4, 2.6, 0], 32), p([0, 3.2, 10], [0, 2.6, 0], 34)],
  },
  contact: {
    id: "contact", label: "Contact", href: "/contact", screen: "/OtherAssets/contact.mp4",
    stations: [p([2.6, 6, 8.2], [-1.2, 1.6, 2], 34), p([0, 4.5, 7.5], [0, 2.2, 1.5], 36)],
  },
};

/** Menu and footer order. */
export const NAV: SceneId[] = ["work", "services", "studio", "journal", "contact"];

export function sceneForPath(path: string): SceneId {
  if (/^\/work\/.+/.test(path)) return "project";
  for (const id of NAV) if (path.startsWith(SCENES[id].href)) return id;
  return "home";
}
