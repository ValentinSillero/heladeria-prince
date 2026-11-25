import { getFlavor } from "@/config/flavors";
import { getProduct, MAX_QTY_PER_ITEM, type SizeId } from "@/config/products";

export interface CartItem {
  id: string;
  sizeId: SizeId;
  flavors: string[];
  qty: number;
}

export function cartTotals(items: CartItem[]) {
  let subtotal = 0;
  let count = 0;
  for (const it of items) {
    const p = getProduct(it.sizeId);
    if (!p) continue;
    subtotal += p.price * it.qty;
    count += it.qty;
  }
  return { subtotal, count };
}

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Limpia datos guardados: descarta tamaños/sabores inexistentes y ajusta límites. */
export function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const product = getProduct(String(o.sizeId));
    if (!product) continue;
    const flavors = Array.isArray(o.flavors)
      ? [...new Set(o.flavors.map(String))].filter((id) => getFlavor(id)?.available !== false && getFlavor(id)).slice(0, product.maxFlavors)
      : [];
    if (flavors.length < product.minFlavors) continue;
    const qty = Math.min(MAX_QTY_PER_ITEM, Math.max(1, Math.floor(Number(o.qty) || 1)));
    out.push({ id: typeof o.id === "string" && o.id ? o.id : newId(), sizeId: product.id, flavors, qty });
  }
  return out;
}
