import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import localFont from "next/font/local";
import { CookieBanner } from "./components/CookieBanner";
import { Gallery } from "./gallery/Gallery";
import { Dock } from "./ui/Dock";
import { Motion } from "./ui/Motion";
import "./globals.css";

// Display and body: Archivo, variable in width and weight, so headlines can go wide and heavy.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

const fragmentMono = localFont({
  src: [
    { path: "../public/Font/fragment-mono/FragmentMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/Font/fragment-mono/FragmentMono-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-mono",
  display: "swap",
});

const DESCRIPTION =
  "Piermont Studios is a creative agency for branding, website design, UI/UX, performance marketing and video editing, serving clients from the USA and UK.";

export const metadata: Metadata = {
  metadataBase: new URL("https://piermontstudios.com"),
  title: {
    default: "Piermont Studios | Branding, Web Design and Marketing Agency",
    template: "%s | Piermont Studios",
  },
  description: DESCRIPTION,
  applicationName: "Piermont Studios",
  keywords: [
    "Piermont Studios",
    "brand identity",
    "brand strategy",
    "web design",
    "website development",
    "UI/UX design",
    "AI systems",
    "SEO",
    "creative agency",
    "digital marketing agency",
    "video editing",
  ],
  authors: [{ name: "Piermont Studios", url: "https://piermontstudios.com" }],
  creator: "Piermont Studios",
  publisher: "Piermont Studios",
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://piermontstudios.com",
    siteName: "Piermont Studios",
    title: "Piermont Studios | Branding, Web Design and Marketing Agency",
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Piermont Studios, We Strategize Build and Promote",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Piermont Studios | Branding, Web Design and Marketing Agency",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#070605",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${fragmentMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <Gallery />
        {children}
        <Dock />
        <Motion />
        <CookieBanner />
      </body>
    </html>
  );
}
