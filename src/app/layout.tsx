import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, Shrikhand } from "next/font/google";
import { SITE } from "@/config/site";
import { LOCALITIES, type DayId } from "@/config/branches";
import { BRAND, BRAND_CSS_VARS } from "@/config/brand";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});
// acento retro (palabras destacadas): una sola variante, ya inclinada
const accent = Shrikhand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-accent",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: BRAND.seo.title,
    template: `%s · ${BRAND.name}`,
  },
  description: SITE.description,
  keywords: BRAND.seo.keywords,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE.name,
    title: BRAND.seo.ogTitle,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: BRAND.theme.browserBar,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // en Android el teclado achica el área visible: la barra inferior del selector queda visible
  interactiveWidget: "resizes-content",
};

const DAY_SCHEMA: Record<DayId, string> = {
  lun: "Monday",
  mar: "Tuesday",
  mie: "Wednesday",
  jue: "Thursday",
  vie: "Friday",
  sab: "Saturday",
  dom: "Sunday",
};
const mainLocality = LOCALITIES[0];
const mainStore = mainLocality?.stores[0];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "IceCreamShop",
  name: SITE.name,
  slogan: SITE.tagline,
  url: SITE.url,
  image: new URL("/opengraph-image.jpg", SITE.url).toString(),
  sameAs: [SITE.instagram.url, ...(SITE.linktree ? [SITE.linktree] : [])],
  areaServed: BRAND.seo.areaServed.map((city) => ({ "@type": "City", name: `${city}, Entre Ríos` })),
  priceRange: "$$",
  currenciesAccepted: "ARS",
  ...(mainStore?.phone ? { telephone: mainStore.phone.replace(/\s/g, "") } : {}),
  ...(mainStore?.address
    ? {
        address: {
          "@type": "PostalAddress",
          streetAddress: mainStore.address,
          addressLocality: mainLocality.city ?? mainLocality.name,
          addressRegion: "Entre Ríos",
          addressCountry: "AR",
        },
      }
    : {}),
  ...(mainStore?.mapsUrl ? { hasMap: mainStore.mapsUrl } : {}),
  ...(mainStore?.hours
    ? {
        openingHoursSpecification: mainStore.hours
          .filter((h) => h.open && h.close)
          .map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: DAY_SCHEMA[h.day],
            opens: h.open,
            // schema.org: la medianoche se indica como 23:59
            closes: h.close === "00:00" ? "23:59" : h.close,
          })),
      }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-AR"
      className={`${bricolage.variable} ${figtree.variable} ${accent.variable}`}
      style={BRAND_CSS_VARS as React.CSSProperties}
    >
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
