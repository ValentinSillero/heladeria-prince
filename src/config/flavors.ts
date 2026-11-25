/**
 * SABORES — Helados Prince
 * ---------------------------------------------------------------
 * Los 34 sabores de la carta, confirmados por la heladería (noviembre 2026).
 * - Para sumar un sabor: agregalo al array, dentro de su categoría.
 * - Para ocultarlo temporalmente (p. ej. si se agotó): `available: false`.
 * - `photo`: foto de la bocha que se muestra (ver src/lib/flavor-photos.ts).
 *   Son imágenes ILUSTRATIVAS por tipo de sabor (varias se repiten). Cuando haya fotos
 *   reales de la heladería, agregalas a `src/assets/flavors` y registralas en flavor-photos.ts.
 *   Si un sabor queda sin foto (`photo: null`), se muestra un diseño tipográfico.
 * - `color`: tono de respaldo para el diseño tipográfico.
 * - El `id` sale del nombre: dos sabores no pueden llamarse igual.
 * - Los sabores de la carta "Granizado", "Super", etc. de dulce de leche se nombran
 *   completos ("Dulce de leche granizado") para que el pedido de WhatsApp sea claro.
 */

import type { PhotoKey } from "@/lib/flavor-photos";

/** Identificador de categoría (definido en CATEGORIES) */
export type CategoryId = string;

export interface Flavor {
  id: string;
  name: string;
  category: CategoryId;
  color: string;
  photo: PhotoKey | null;
  available?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
}

export const CATEGORIES: Category[] = [
  { id: "chocolates", name: "Chocolates", short: "Chocolates" },
  { id: "al-agua", name: "De agua", short: "De agua" },
  { id: "cremas", name: "Cremas", short: "Cremas" },
  { id: "dulce-de-leche", name: "Dulces de leche", short: "Dulces de leche" },
];

const f = (name: string, category: CategoryId, color: string, photo: PhotoKey | null): Flavor => ({
  id: slug(name),
  name,
  category,
  color,
  photo,
});

export function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const FLAVORS: Flavor[] = [
  // CHOCOLATES
  f("Chocolate", "chocolates", "#6b3a24", "chocolate"),
  f("Bombón", "chocolates", "#3b1f14", "amargo"),
  f("Chocolate con almendras", "chocolates", "#7c4a2f", "chocolate-almendras"),
  f("Chocolate suizo", "chocolates", "#5a3220", "avellanas"),
  f("Bon o Bon", "chocolates", "#a87a4f", "dulce-granizado"),
  f("Chocolate blanco", "chocolates", "#efe6d2", "vainilla"),
  f("Kinder", "chocolates", "#c9a27a", "tiramisu"),
  // DE AGUA
  f("Limón", "al-agua", "#ece27a", "sorbete-limon"),
  f("Frutilla", "al-agua", "#d63a55", "sorbete-frutilla"),
  f("Naranja", "al-agua", "#f29a3a", "sorbete-naranja"),
  f("Mandarina", "al-agua", "#f5a54a", "sorbete-naranja"),
  f("Durazno", "al-agua", "#f4b968", "sambayon"),
  // CREMAS
  f("Oreo", "cremas", "#4a4040", "oreo"),
  f("Flan con dulce de leche", "cremas", "#e3b35c", "crema-ddl"),
  f("Americana", "cremas", "#f7ecd2", "vainilla"),
  f("Granizado", "cremas", "#e9dcc4", "granizado"),
  f("Tramontana", "cremas", "#c79a6a", "chocotorta"),
  f("Frutilla a la crema", "cremas", "#f2a4ae", "frutilla-crema"),
  f("Higos a la crema", "cremas", "#a8707a", "frutos-rojos"),
  f("Crema cielo", "cremas", "#b9d6ec", "crema-cielo"),
  f("Maracuyá", "cremas", "#f0bd45", "sambayon"),
  f("Banana split", "cremas", "#f1df9e", "limon-crema"),
  f("Frutos del bosque", "cremas", "#9c2c4f", "frutos-rojos"),
  f("Mascarpone con frutos rojos", "cremas", "#c8435c", "frutos-rojos"),
  f("Menta granizada", "cremas", "#b9dfc3", "menta"),
  f("Chocotorta", "cremas", "#7a4a2e", "chocotorta"),
  f("San José Pecán", "cremas", "#b98a55", "dulce-nuez"),
  f("Coco con dulce de leche", "cremas", "#efe3cf", "crema-ddl"),
  f("Popcorn", "cremas", "#e8c48a", "dulce"),
  f("Vainilla", "cremas", "#f6e7b8", "vainilla"),
  // DULCES DE LECHE
  f("Dulce de leche", "dulce-de-leche", "#c48a4f", "dulce"),
  f("Dulce de leche granizado", "dulce-de-leche", "#b77f48", "dulce-granizado"),
  f("Dulce de leche con nuez", "dulce-de-leche", "#a8743f", "dulce-nuez"),
  f("Dulce de leche super", "dulce-de-leche", "#9e6a38", "crema-ddl"),
];

if (process.env.NODE_ENV !== "production" && new Set(FLAVORS.map((x) => x.id)).size !== FLAVORS.length) {
  throw new Error("flavors.ts: hay dos sabores con el mismo nombre");
}

const BY_ID = new Map(FLAVORS.map((x) => [x.id, x]));

export function getFlavor(id: string): Flavor | undefined {
  return BY_ID.get(id);
}

export function availableFlavors() {
  return FLAVORS.filter((x) => x.available !== false);
}
