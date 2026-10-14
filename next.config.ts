import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The old site's URLs, pointed at their rooms in the Kunsthalle so links and rankings carry over.
  async redirects() {
    return [
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/case-studies/:wing", destination: "/services/:wing", permanent: true },
      { source: "/solutions/:slug", destination: "/services", permanent: true },
      { source: "/about", destination: "/studio", permanent: true },
      { source: "/process", destination: "/studio", permanent: true },
      { source: "/testimonials", destination: "/studio", permanent: true },
      { source: "/blog", destination: "/journal", permanent: true },
      { source: "/blog/:slug", destination: "/journal/:slug", permanent: true },
    ];
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
