import type { StaticImageData } from "next/image";
import amargo from "@/assets/flavors/amargo.webp";
import avellanas from "@/assets/flavors/avellanas.webp";
import chocolateAlmendras from "@/assets/flavors/chocolate-almendras.webp";
import chocolate from "@/assets/flavors/chocolate.webp";
import chocotorta from "@/assets/flavors/chocotorta.webp";
import cremaCielo from "@/assets/flavors/crema-cielo.webp";
import cremaDdl from "@/assets/flavors/crema-ddl.webp";
import dulceGranizado from "@/assets/flavors/dulce-granizado.webp";
import dulceNuez from "@/assets/flavors/dulce-nuez.webp";
import dulce from "@/assets/flavors/dulce.webp";
import frutillaCrema from "@/assets/flavors/frutilla-crema.webp";
import frutosRojos from "@/assets/flavors/frutos-rojos.webp";
import granizado from "@/assets/flavors/granizado.webp";
import limonCrema from "@/assets/flavors/limon-crema.webp";
import menta from "@/assets/flavors/menta.webp";
import oreo from "@/assets/flavors/oreo.webp";
import pistacho from "@/assets/flavors/pistacho.webp";
import sambayon from "@/assets/flavors/sambayon.webp";
import sorbeteFrutilla from "@/assets/flavors/sorbete-frutilla.webp";
import sorbeteLimon from "@/assets/flavors/sorbete-limon.webp";
import sorbeteNaranja from "@/assets/flavors/sorbete-naranja.webp";
import tiramisu from "@/assets/flavors/tiramisu.webp";
import vainilla from "@/assets/flavors/vainilla.webp";

/**
 * Fotos de bochas (fondo blanco puro, 640×640, WebP).
 * Imágenes fotorrealistas ORIGINALES generadas para este sitio, ilustrativas
 * del tipo de sabor. Para usar fotos reales: reemplazá el archivo manteniendo
 * el nombre, o agregá una clave nueva acá y asignala en src/config/flavors.ts.
 */
export const FLAVOR_PHOTOS = {
  amargo,
  avellanas,
  "chocolate-almendras": chocolateAlmendras,
  chocolate,
  chocotorta,
  "crema-cielo": cremaCielo,
  "crema-ddl": cremaDdl,
  "dulce-granizado": dulceGranizado,
  "dulce-nuez": dulceNuez,
  dulce,
  "frutilla-crema": frutillaCrema,
  "frutos-rojos": frutosRojos,
  granizado,
  "limon-crema": limonCrema,
  menta,
  oreo,
  pistacho,
  sambayon,
  "sorbete-frutilla": sorbeteFrutilla,
  "sorbete-limon": sorbeteLimon,
  "sorbete-naranja": sorbeteNaranja,
  tiramisu,
  vainilla,
} satisfies Record<string, StaticImageData>;

export type PhotoKey = keyof typeof FLAVOR_PHOTOS;

export function photoFor(key: PhotoKey | null | undefined): StaticImageData | null {
  return key ? (FLAVOR_PHOTOS[key] ?? null) : null;
}
