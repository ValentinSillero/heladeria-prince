/**
 * IMÁGENES DE LA MARCA
 * ---------------------------------------------------------------
 * Logo: foto de perfil de @helados.prince. Fotos: publicaciones de su Instagram (septiembre a noviembre 2026).
 * Son imágenes de la propia heladería.
 * Para cambiarlas: reemplazá los archivos de src/assets/brand (mismo nombre)
 * o ajustá estos imports. Las bochas, potes y el cono son ilustraciones
 * genéricas, comunes a todas las heladerías.
 */

import type { StaticImageData } from "next/image";
import logo from "@/assets/brand/logo.webp";
import ig0 from "@/assets/brand/ig-bandeja-choco.webp";
import ig1 from "@/assets/brand/ig-vasito.webp";
import ig2 from "@/assets/brand/ig-bandeja-tres.webp";
import ig3 from "@/assets/brand/ig-cono.webp";

export const BRAND_ASSETS: {
  /** Logo para fondos claros */
  logoDark: StaticImageData;
  /** Logo para fondos oscuros (pie de página) */
  logoLight: StaticImageData;
  /** Cuatro fotos de la sección de Instagram */
  instagramTiles: StaticImageData[];
} = {
  // logo cuadrado (logoStyle: "badge" en brand.ts): el mismo sirve para fondo claro y oscuro
  logoDark: logo,
  logoLight: logo,
  instagramTiles: [ig0, ig1, ig2, ig3],
};
