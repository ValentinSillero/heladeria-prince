import { getLocality, getStore, type Locality, type LocalityId } from "@/config/branches";
import { BRAND } from "@/config/brand";
import { getFlavor } from "@/config/flavors";
import { getProduct } from "@/config/products";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/cart";
import { cartTotals } from "@/lib/cart";

export type DeliveryMethod = "delivery" | "retiro";

export interface CheckoutData {
  name: string;
  localityId: LocalityId | null;
  method: DeliveryMethod;
  address: string;
  storeId: string | null;
  notes: string;
}

/** Número válido para wa.me: solo dígitos, formato internacional argentino (54…) */
export function isValidWhatsappNumber(n: string | null | undefined): n is string {
  return !!n && /^54\d{10,11}$/.test(n);
}

export type OrderChannel =
  | { kind: "direct"; number: string }
  | { kind: "chat"; url: string }
  | { kind: "none" };

/**
 * Determina a dónde se puede enviar el pedido de una localidad.
 * Nunca usa el contacto de otra localidad.
 */
export function getOrderChannel(locality: Locality | undefined): OrderChannel {
  if (!locality) return { kind: "none" };
  if (isValidWhatsappNumber(locality.whatsappNumber)) return { kind: "direct", number: locality.whatsappNumber };
  if (locality.whatsappChatUrl && /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(locality.whatsappChatUrl)) {
    return { kind: "chat", url: locality.whatsappChatUrl };
  }
  return { kind: "none" };
}

/**
 * Mensaje del pedido, escrito como lo mandaría un cliente. No nombra la localidad:
 * el número de destino ya corresponde a la localidad elegida (ver getOrderChannel).
 * Formato de WhatsApp: *negrita* para cada helado y el total; sin campos vacíos.
 */
export function buildOrderMessage(items: CartItem[], data: CheckoutData): string {
  const locality = getLocality(data.localityId);
  // si la localidad tiene un único local, ese es el de retiro aunque no se haya elegido
  const store = getStore(locality, data.storeId) ?? (locality?.stores.length === 1 ? locality.stores[0] : undefined);
  const lines: string[] = [`Hola ${BRAND.name}! Quería hacer un pedido.`];

  for (const item of items) {
    const product = getProduct(item.sizeId);
    if (!product) continue;
    const flavors = item.flavors.map((id) => getFlavor(id)?.name).filter((n): n is string => !!n);
    const what = item.qty > 1 ? `${item.qty} x ${product.orderLabel}` : product.orderLabel;
    lines.push("");
    lines.push(`*${what}* (${formatPrice(product.price * item.qty)})`);
    if (flavors.length) {
      lines.push("Sabores:");
      for (const name of flavors) lines.push(`- ${name}`);
    }
  }

  const { subtotal } = cartTotals(items);
  const name = data.name.trim();
  const address = data.address.trim();
  const notes = data.notes.trim();

  lines.push("");
  lines.push(`*Total: ${formatPrice(subtotal)}*`);
  if (name) lines.push(`Nombre: ${name}`);
  if (data.method === "delivery") {
    lines.push("Envío a domicilio");
    if (address) lines.push(`Dirección: ${address}`);
  } else {
    lines.push(store?.address ? `Retiro en el local de ${store.address}` : "Retiro en el local");
  }
  if (notes) lines.push(`Aclaración: ${notes}`);
  lines.push("Gracias!");
  return lines.join("\n");
}

export function buildDirectUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export interface CheckoutErrors {
  name?: string;
  localityId?: string;
  address?: string;
  storeId?: string;
  items?: string;
}

export function validateCheckout(items: CartItem[], data: CheckoutData): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!items.length) errors.items = "Tu pedido está vacío.";
  if (data.name.trim().length < 2) errors.name = "Contanos tu nombre.";
  const locality = getLocality(data.localityId);
  if (!locality) errors.localityId = `Elegí tu ${BRAND.place.singular}.`;
  if (data.method === "delivery" && data.address.trim().length < 4) errors.address = "Necesitamos la dirección de entrega.";
  if (data.method === "retiro" && locality && locality.stores.length > 1 && !getStore(locality, data.storeId)) {
    errors.storeId = "Elegí en qué sucursal retirás.";
  }
  return errors;
}
