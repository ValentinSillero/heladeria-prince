/**
 * TAMAÑOS Y PRECIOS
 * ---------------------------------------------------------------
 * Precios de Helados Prince (noviembre 2026), en pesos argentinos.
 * Para actualizarlos, cambiá solo `price` (en pesos, sin puntos).
 *
 * `maxFlavors`: cantidad máxima de sabores por tamaño.
 *   Valores heredados de la plantilla (1/4 → 2, 1/2 → 3, 1 kg → 4): CONFIRMAR con Prince.
 *   Cambiá estos números y todo el sitio se ajusta solo.
 */

export type SizeId = "cuarto" | "medio" | "kilo";

export interface Product {
  id: SizeId;
  /** Cómo se muestra el tamaño */
  name: string;
  /** Texto para el mensaje de WhatsApp */
  orderLabel: string;
  price: number;
  minFlavors: number;
  maxFlavors: number;
  /** Etiqueta corta opcional (no es una promoción) */
  tag?: string;
  /** Bochitas ilustrativas que se muestran en la tarjeta */
  visual: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "cuarto",
    name: "1/4 kg",
    orderLabel: "1/4 kg de helado",
    price: 8000,
    minFlavors: 1,
    maxFlavors: 2,
    visual: ["frutilla", "vainilla"],
  },
  {
    id: "medio",
    name: "1/2 kg",
    orderLabel: "1/2 kg de helado",
    price: 14000,
    minFlavors: 1,
    maxFlavors: 3,
    visual: ["dulce", "chocolate", "granizado"],
  },
  {
    id: "kilo",
    name: "1 kg",
    orderLabel: "1 kg de helado",
    price: 23000,
    minFlavors: 1,
    maxFlavors: 4,
    tag: "Para compartir",
    visual: ["chocolate", "dulce", "frutilla", "vainilla"],
  },
];

export const MAX_QTY_PER_ITEM = 20;

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
