/** Single source for business details used by the footer, contact page and SEO data. */
export const SITE_URL = "https://piermontstudios.com";

export const PHONE = { display: "307-655-6848", href: "tel:+13076556848", e164: "+13076556848" };

export const EMAIL = "harris@piermontstudios.com";

/** Paste the final profile URLs here; they feed the footer and search-engine data. */
export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/piermontstudios" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/piermont-studios/" },
] as const;

/**
 * Per page metadata. Next merges `openGraph` shallowly, so a page that sets
 * only `title` would inherit the home page's og:title and og:url.
 */
export function pageMeta({
  title,
  description,
  path,
  image = "/og.png",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): import("next").Metadata {
  // Google shows ~60 title chars and ~160 description chars; long titles drop the brand suffix.
  const full = title.length > 42 ? title : `${title} | Piermont Studios`;
  description = clip(description, 158);
  return {
    title: { absolute: full },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "Piermont Studios",
      locale: "en_US",
      title: full,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      images: [image],
    },
  };
}

function clip(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max - 1)).replace(/[,.;:]$/, "")}…`;
}

/** Review profiles shown as icons in the footer. Set `href` to the profile URL; null renders the icon without a link. */
export const REVIEWS: { label: string; icon: string; href: string | null }[] = [
  { label: "Bark", icon: "/reviews/bark.png", href: null },
  { label: "Trustpilot", icon: "/reviews/trustpilot.png", href: null },
  { label: "Google Reviews", icon: "/reviews/google.png", href: null },
  { label: "Clutch", icon: "/reviews/clutch.png", href: null },
];

/** The two branches, shown in the footer, the menu, the contact room and the Organization JSON-LD. */
export const LOCATIONS = [
  { country: "USA", city: "Sheridan, WY", street: "30 N Gould St, Ste R", locality: "Sheridan", region: "WY", postalCode: "82801", iso: "US", address: "30 N Gould St, Ste R, Sheridan, WY 82801, United States" },
  { country: "UK", city: "London", street: "66 Paul Street", locality: "London", region: undefined, postalCode: "EC2A 4NA", iso: "GB", address: "66 Paul Street, London EC2A 4NA, United Kingdom" },
] as const;

/** Client logos in `public/brands/<slug>.png`: the Collection. */
export const BRANDS = [
  { slug: "alo", name: "Alo" },
  { slug: "bacardi", name: "Bacardi" },
  { slug: "baileys", name: "Baileys" },
  { slug: "burberry", name: "Burberry" },
  { slug: "columbia", name: "Columbia" },
  { slug: "diesel", name: "Diesel" },
  { slug: "heineken", name: "Heineken" },
  { slug: "louis-vuitton", name: "Louis Vuitton" },
  { slug: "on", name: "On" },
  { slug: "qatar-airways", name: "Qatar Airways" },
  { slug: "reebok", name: "Reebok" },
  { slug: "the-north-face", name: "The North Face" },
] as const;

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Piermont Studios",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/og.png`,
  email: EMAIL,
  telephone: PHONE.e164,
  sameAs: SOCIALS.map((s) => s.href),
  address: LOCATIONS.map((l) => ({
    "@type": "PostalAddress",
    streetAddress: l.street,
    addressLocality: l.locality,
    ...(l.region ? { addressRegion: l.region } : {}),
    postalCode: l.postalCode,
    addressCountry: l.iso,
  })),
};
