import { BRAND } from "./brand";

/** Datos generales del sitio (se arman a partir de brand.ts) */
export const SITE = {
  name: BRAND.name,
  shortName: BRAND.shortName,
  tagline: BRAND.tagline,
  description: BRAND.description,
  /** Definí NEXT_PUBLIC_SITE_URL cuando el sitio tenga dominio propio */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  region: BRAND.region,
  instagram: {
    handle: BRAND.instagram.handle,
    url: BRAND.instagram.url,
  },
  linktree: BRAND.linktree,
};
