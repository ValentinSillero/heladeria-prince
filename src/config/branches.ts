/**
 * LOCAL, WHATSAPP Y HORARIOS — Helados Prince
 * ---------------------------------------------------------------
 * Datos confirmados por la heladería (noviembre 2026).
 * Hay un solo local: no se muestra selector de localidad y queda elegido solo.
 *
 *  - `whatsappNumber`: número en formato internacional, solo dígitos (549 + característica + número).
 *    El pedido se abre en WhatsApp ya escrito, dirigido a este número.
 *  - `hours`: horario semanal del local (formato 24 h). `null` = cerrado ese día.
 *    "00:00" como cierre significa medianoche.
 */
export type LocalityId = string;

export type DayId = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

export interface OpeningHours {
  day: DayId;
  /** Nombre del día, como se muestra */
  label: string;
  /** `null` = cerrado */
  open: string | null;
  close: string | null;
}

export interface Store {
  id: string;
  name: string;
  address: string | null;
  mapsUrl: string | null;
  /** Teléfono para mostrar (el enlace usa los dígitos) */
  phone?: string | null;
  hours?: OpeningHours[];
}

export interface Locality {
  id: LocalityId;
  name: string;
  /** Ciudad, para las búsquedas de Google Maps (si no, se usa `name`) */
  city?: string;
  whatsappNumber: string | null;
  whatsappChatUrl: string | null;
  stores: Store[];
}

export const LOCALITIES: Locality[] = [
  {
    id: "san-jose",
    name: "San José",
    whatsappNumber: "5493442504602",
    whatsappChatUrl: null,
    stores: [
      {
        id: "san-jose-mitre",
        name: "Helados Prince",
        address: "Mitre 1354",
        mapsUrl: "https://maps.app.goo.gl/e435jJD8qJKmNs3e6",
        phone: "+54 9 3442 504602",
        hours: [
          { day: "lun", label: "Lunes", open: "16:00", close: "00:00" },
          { day: "mar", label: "Martes", open: null, close: null },
          { day: "mie", label: "Miércoles", open: "16:00", close: "00:00" },
          { day: "jue", label: "Jueves", open: "16:00", close: "00:00" },
          { day: "vie", label: "Viernes", open: "16:00", close: "00:00" },
          { day: "sab", label: "Sábado", open: "12:00", close: "00:00" },
          { day: "dom", label: "Domingo", open: "12:00", close: "00:00" },
        ],
      },
    ],
  },
];

/** Si hay una sola localidad, queda elegida sola y no se muestra el selector */
export const SINGLE_LOCALITY: Locality | null = LOCALITIES.length === 1 ? LOCALITIES[0] : null;

export function getLocality(id: string | null | undefined): Locality | undefined {
  return LOCALITIES.find((l) => l.id === id);
}

export function getStore(locality: Locality | undefined, storeId: string | null | undefined) {
  return locality?.stores.find((s) => s.id === storeId);
}

/** Enlace oficial de Maps o, si no hay, una búsqueda con la dirección confirmada. */
export function storeMapsUrl(store: Store, locality: Locality): string | null {
  if (store.mapsUrl) return store.mapsUrl;
  if (!store.address) return null;
  const q = `${store.address}, ${locality.city ?? locality.name}, Entre Ríos, Argentina`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** Enlace tel: a partir del teléfono que se muestra */
export function telHref(phone: string): string {
  return `tel:+${phone.replace(/\D/g, "")}`;
}

/** Agrupa días consecutivos con el mismo horario: "Miércoles a viernes · 16:00 a 00:00" */
export function groupHours(hours: OpeningHours[]): { days: string; time: string | null }[] {
  const out: { first: OpeningHours; last: OpeningHours; time: string | null }[] = [];
  for (const h of hours) {
    const time = h.open && h.close ? `${h.open} a ${h.close}` : null;
    const prev = out[out.length - 1];
    if (prev && prev.time === time) prev.last = h;
    else out.push({ first: h, last: h, time });
  }
  return out.map((g) => ({
    days: g.first === g.last ? g.first.label : `${g.first.label} a ${g.last.label.toLowerCase()}`,
    time: g.time,
  }));
}
