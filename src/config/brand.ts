/**
 * MARCA DE LA HELADERÍA
 * ---------------------------------------------------------------
 * Todo lo que cambia de una heladería a otra (nombre, textos, colores,
 * funciones activas) está en este archivo. Las imágenes de la marca están
 * en `src/config/brand-assets.ts`, y los datos del negocio en:
 *   - branches.ts  → sucursales / localidades y WhatsApp
 *   - products.ts  → tamaños, precios y máximo de sabores
 *   - flavors.ts   → sabores y categorías
 * El resto del código es el mismo para todas las heladerías.
 */

export const BRAND = {
  id: "helados-prince",
  name: "Helados Prince",
  shortName: "Prince",
  tagline: "Sabores únicos para compartir momentos especiales",
  description:
    "Armá tu pedido de Helados Prince en San José, Entre Ríos. Elegí tamaño y sabores, y envialo directo por WhatsApp.",
  region: "Entre Ríos, Argentina",

  instagram: {
    handle: "helados.prince",
    url: "https://www.instagram.com/helados.prince/",
    displayName: "Heladería artesanal · Fabricación propia",
  },
  linktree: "https://linktr.ee/heladosprince" as string | null,

  /** Portada: título grande + segunda línea en cursiva */
  hero: {
    /** Texto de la etiqueta de arriba. `null` = nombres de las localidades */
    kicker: "San José · Entre Ríos" as string | null,
    title: "Prince",
    subtitle: "sabores únicos.",
    lead: "Helado artesanal de fabricación propia. Armá tu pedido y pasalo a buscar.",
  },

  seo: {
    title: "Helados Prince · Pedí tu helado artesanal en San José",
    ogTitle: "Helados Prince · Sabores únicos",
    keywords: ["helados", "heladería", "San José", "Entre Ríos", "helado artesanal", "Prince"],
    /** Ciudades que atiende (datos estructurados para Google) */
    areaServed: ["San José"],
  },

  /**
   * Qué elige el cliente: "localidad" (una ciudad, con uno o varios locales)
   * o "sucursal" (cada local con su propio WhatsApp dentro de la misma ciudad).
   */
  place: { singular: "localidad", plural: "localidades" },

  copy: {
    branchesTitle: { plain: "Dónde", italic: "estamos" },
    branchesDescription: "Hacé tu pedido online y pasá a retirarlo por el local.",
    instagramTitle: { plain: "Verdaderamente", italic: "artesanal" },
    instagramText: "Sabores nuevos, combinaciones y sorteos. Seguinos para no perderte nada.",
    footerNote: "Los pedidos se confirman por WhatsApp con la heladería.",
  },

  /** Funciones que se pueden prender o apagar para cada heladería */
  features: {
    /** Muestra la opción "Delivery" en el pedido */
    delivery: false, // sin delivery confirmado: solo retiro. Cambiá a true si hacen envíos
    /** Muestra la opción "Retiro en sucursal" en el pedido */
    pickup: true,
    /** Sección con fotos de Instagram */
    instagramSection: true,
  },

  /** Aviso de demostración (sabores o precios de ejemplo). `null` = sin aviso */
  demoNotice: null as string | null,

  /**
   * Estilo del logo:
   *  - "transparent": logo recortado sin fondo (versión oscura y clara).
   *  - "badge": imagen cuadrada (p. ej. la foto de perfil de Instagram), se muestra en círculo.
   */
  logoStyle: "badge" as "transparent" | "badge",

  /** Colores de la marca (el resto de la paleta es común a todas) */
  theme: {
    /** Rosa de la marca: botones, íconos y detalles */
    accent: "#ec4296",
    /** Turquesa de la marca (sobre fondo oscuro y relieve del título) */
    accentSoft: "#23c3cc",
    /** Turquesa profundo: textos e íconos secundarios sobre fondo claro (contraste AA) */
    deep: "#0b7780",
    /** Fondo suave rosado (sección de Instagram) */
    tint: "#fde1ee",
    /** Amarillo de acento, solo para detalles chicos */
    highlight: "#ffdb39",
    /** Color de la barra del navegador en celulares (igual al fondo de la portada) */
    browserBar: "#fff0d7",
  },

  /** Clave donde el navegador guarda el carrito (una por heladería) */
  storageKey: "helados-prince:pedido:v1",
};

/** Variables CSS que pisan la paleta base con los colores de la marca */
export const BRAND_CSS_VARS = {
  "--color-orange": BRAND.theme.accent,
  "--color-orange-soft": BRAND.theme.accentSoft,
  "--color-choco": BRAND.theme.deep,
  "--color-peach": BRAND.theme.tint,
  "--color-yellow": BRAND.theme.highlight,
} as Record<string, string>;
