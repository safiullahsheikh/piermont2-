import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

// Rooms are added here as they open.
const ROUTES = [
  { path: "", priority: 1 },
  { path: "/contact", priority: 0.9 },
  { path: "/credits", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency: "monthly", priority }));
}
