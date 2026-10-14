// The six services from the original site, each with its own loop.

export const SERVICES = [
  {
    tag: "FOUNDATION",
    index: "/01",
    title: "Brand Identity",
    image: null,
    video: "/OtherAssets/BrandIdentityVideo.mp4",
    descriptionLines: [
      "Where every project starts:",
      "how your brand looks, sounds and feels.",
    ],
    items: [
      "Positioning and messaging frameworks",
      "Visual identity systems",
      "Brand guidelines for consistent use",
      "Digital-first brand systems",
      "Branded assets across campaigns and touchpoints",
    ],
  },
  {
    tag: "GROWTH",
    index: "/02",
    title: "Strategy",
    image: null,
    video: "/OtherAssets/StretgyVideo.mp4",
    descriptionLines: [
      "Clear direction backed by insight and planning",
      "to move from idea to execution.",
    ],
    items: [
      "Market and audience research",
      "Product and campaign strategy",
      "User journey mapping",
      "Go-to-market planning",
      "Measurement and iteration frameworks",
    ],
  },
  {
    tag: "CREATIVE",
    index: "/03",
    title: "Design & Innovation",
    image: null,
    video: "/OtherAssets/DesignVideo.mp4",
    descriptionLines: [
      "From first concepts to polished products that",
      "people want to use and share.",
    ],
    items: [
      "UX and UI design",
      "Prototyping and user testing",
      "Digital product and service design",
      "Iteration and validation",
      "Launch planning and support",
    ],
  },
  {
    tag: "SMART AI",
    index: "/04",
    title: "AI Systems",
    image: "/OtherAssets/Aisystemimage.jpg",
    video: null,
    descriptionLines: [
      "Practical uses of AI that make your",
      "products and daily work smarter.",
    ],
    items: [
      "AI plan and roadmap",
      "Designing AI features people trust",
      "Model selection and integration",
      "Automation and agent workflows",
      "Responsible AI guidelines",
    ],
  },
  {
    tag: "DISCOVERABLE",
    index: "/05",
    title: "SEO",
    image: null,
    video: "/OtherAssets/SEOVideo.mp4",
    descriptionLines: [
      "Help people find you on Google with the right",
      "structure, content and links.",
    ],
    items: [
      "Technical SEO audits",
      "Keyword and content strategy",
      "On-page optimisation",
      "Authority and link building",
      "Analytics and reporting",
    ],
  },
  {
    tag: "BUILD",
    index: "/06",
    title: "Development",
    image: null,
    video: "/OtherAssets/DevelopmentVideo.mp4",
    descriptionLines: [
      "Turning ideas and designs into websites",
      "and apps that work and grow with you.",
    ],
    items: [
      "Web and app development",
      "CMS integration and setup",
      "E-commerce builds and optimisation",
      "Custom feature development",
      "Ongoing technical support",
    ],
  },
] as const;

export type Service = (typeof SERVICES)[number];
