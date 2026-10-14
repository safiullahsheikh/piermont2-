import { PROJECTS, type Project } from "./projects.ts";

/** The six service wings of the gallery, one per project discipline. */
export type Wing = {
  slug: string;
  group: string;
  title: string;
  punch: string;
  lede: string;
  medium: "screen" | "device" | "print" | "projection" | "vertical";
};

export const WINGS: Wing[] = [
  {
    slug: "website-design", group: "WEBSITE DESIGN", title: "Website Design", medium: "screen",
    punch: "Built to be walked through.",
    lede: "Sites with a point of view: clear structure, motion with a reason, and code that stays fast as you grow.",
  },
  {
    slug: "ui-ux-design", group: "UI/UX DESIGN", title: "UI/UX Design", medium: "device",
    punch: "Every pixel, on purpose.",
    lede: "Products people understand on first touch. We map the moments that matter, then design each one until it feels inevitable.",
  },
  {
    slug: "product-development", group: "PRODUCT DEVELOPMENT", title: "Product Development", medium: "device",
    punch: "From sketch to shipped.",
    lede: "One team from first wireframe to app store: architecture, interface and the engineering that holds it together.",
  },
  {
    slug: "branding", group: "BRANDING", title: "Branding", medium: "print",
    punch: "Identity, hung in good light.",
    lede: "Names, marks and systems with the nerve to be remembered, built to work everywhere from a favicon to a facade.",
  },
  {
    slug: "digital-marketing", group: "PERFORMANCE MARKETING", title: "Performance Marketing", medium: "vertical",
    punch: "Attention, measured.",
    lede: "Campaigns made for the feed and judged by the numbers. Creative that stops the thumb, media that pays its way.",
  },
  {
    slug: "video-editing", group: "VIDEO EDITING", title: "Video Editing", medium: "projection",
    punch: "Cut to the feeling.",
    lede: "Edits with rhythm and restraint, from launch films to vertical cuts, finished in colour and sound.",
  },
];

export const projectsIn = (w: Wing): Project[] => PROJECTS.filter((p) => p.group === w.group);
export const getWing = (slug: string) => WINGS.find((w) => w.slug === slug);
