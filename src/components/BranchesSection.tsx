"use client";

import { ArrowRight, ArrowUpRight, Clock, MessageCircle, Phone } from "lucide-react";
import { useSyncExternalStore } from "react";
import { LOCALITIES, storeMapsUrl, telHref, type DayId, type LocalityId, type OpeningHours } from "@/config/branches";
import { useOrder } from "@/lib/order-store";
import { BRAND } from "@/config/brand";
import { getOrderChannel } from "@/lib/whatsapp";
import { scrollToId } from "@/lib/hooks";
import { SectionHeader } from "./SectionHeader";

/**
 * Sucursales en formato editorial: tres columnas separadas por filetes,
 * la dirección como protagonista y acciones discretas (enlaces + un botón fino).
 */
const DAY_IDS: DayId[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

/** Día de hoy en Argentina (solo en el navegador, para no desfasar el render del servidor) */
function todayInArgentina(): DayId | null {
  const wd = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
  const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  return idx >= 0 ? DAY_IDS[idx] : null;
}
const noSubscribe = () => () => {};

function useToday(): DayId | null {
  return useSyncExternalStore(noSubscribe, todayInArgentina, () => null);
}

function HoursTable({ hours, today, className = "mt-6" }: { hours: OpeningHours[]; today: DayId | null; className?: string }) {
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
        <Clock className="size-3.5 text-choco" aria-hidden /> Horarios
      </p>
      <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-6 text-[14px]">
        {hours.map((h) => {
          const isToday = h.day === today;
          return (
            <div key={h.day} className={`col-span-2 grid grid-cols-subgrid items-baseline rounded-lg px-2 py-1.5 -mx-2 ${isToday ? "bg-peach" : ""}`}>
              <dt className={`font-semibold ${isToday ? "text-[#c2236f]" : "text-ink"}`}>
                {h.label}
                {isToday && <span className="sr-only"> (hoy)</span>}
              </dt>
              <dd className={`text-right tabular-nums ${h.open ? "text-ink/80" : "font-semibold text-muted"}`}>
                {h.open && h.close ? `${h.open} a ${h.close}` : "Cerrado"}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

// clases completas para que Tailwind las detecte
const COLS: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" };

export function BranchesSection() {
  const { localityId, requestLocality, hydrated, items } = useOrder();
  const today = useToday();
  const single = LOCALITIES.length === 1;

  const orderHere = (id: LocalityId) => {
    const changing = localityId && localityId !== id && items.length > 0;
    requestLocality(id);
    if (!changing) scrollToId("pedido");
  };

  return (
    <section id="sucursales" className="relative bg-vanilla/40 py-14 sm:py-20" aria-labelledby="branches-title">
      <div className="container-x">
        <SectionHeader
          label={single ? "Ubicación y horarios" : "Sucursales"}
          id="branches-title"
          title={
            <>
              {BRAND.copy.branchesTitle.plain}{" "}
              <span className="font-serif font-normal tracking-[-0.01em] italic">{BRAND.copy.branchesTitle.italic}</span>
            </>
          }
          description={BRAND.copy.branchesDescription}
        />

        <ul className={`mt-8 grid divide-y divide-hairline sm:mt-12 md:divide-x md:divide-y-0 ${COLS[Math.min(LOCALITIES.length, 3)]}`}>
          {LOCALITIES.map((l) => {
            const channel = getOrderChannel(l);
            const chatUrl = channel.kind === "direct" ? `https://wa.me/${channel.number}` : channel.kind === "chat" ? channel.url : null;
            const active = hydrated && localityId === l.id;
            return (
              <li
                key={l.id}
                className={
                  single
                    ? "grid gap-y-8 md:grid-cols-2 md:items-start md:gap-x-16 lg:gap-x-24"
                    : "flex flex-col py-7 first:pt-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0"
                }
              >
                <div className={single ? "flex flex-col" : "contents"}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-[1.5rem] leading-tight font-bold tracking-[-0.025em] sm:text-[1.65rem]">{l.name}</h3>
                  {active && LOCALITIES.length > 1 && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-orange">
                      <span className="size-1.5 rounded-full bg-orange" aria-hidden />
                      Tu {BRAND.place.singular}
                    </span>
                  )}
                </div>

                <ul className="mt-4 grid gap-3">
                  {l.stores.length === 0 && <li className="text-[14px] text-muted">Retiro y entregas a coordinar por WhatsApp.</li>}
                  {l.stores.map((s) => {
                    const maps = storeMapsUrl(s, l);
                    return (
                      <li key={s.id} className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold text-ink">{s.address ?? s.name}</p>
                          {s.address && <p className="text-[13px] text-muted">{s.name}</p>}
                        </div>
                        {maps && (
                          <a
                            href={maps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-quiet shrink-0 text-[13px] text-ink/75"
                            aria-label={`Ver ${s.name} de ${l.name} en Google Maps`}
                          >
                            Mapa <ArrowUpRight className="size-3.5" aria-hidden />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {l.stores.map((s) =>
                  s.phone ? (
                    <a
                      key={`tel-${s.id}`}
                      href={telHref(s.phone)}
                      className="link-quiet mt-3 self-start text-[14px] tabular-nums"
                      aria-label={`Llamar a ${s.name} al ${s.phone}`}
                    >
                      <Phone className="size-3.5 text-choco" aria-hidden /> {s.phone}
                    </a>
                  ) : null,
                )}

                {!single && l.stores.map((s) => (s.hours?.length ? <HoursTable key={`h-${s.id}`} hours={s.hours} today={today} /> : null))}

                <div className={`mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 ${single ? "md:mt-8" : "md:mt-auto md:pt-8"}`}>
                  <button type="button" onClick={() => orderHere(l.id)} className="btn-sm btn-line group h-10 px-4">
                    {LOCALITIES.length > 1 ? `Pedir en ${l.name}` : "Pedir acá"}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </button>
                  {chatUrl && (
                    <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="link-quiet text-[13px] text-ink/75" aria-label={`WhatsApp de ${l.name}`}>
                      <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
                    </a>
                  )}
                </div>
                </div>

                {single &&
                  l.stores.map((s) =>
                    s.hours?.length ? (
                      <HoursTable
                        key={`h-${s.id}`}
                        hours={s.hours}
                        today={today}
                        className="rounded-[24px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--color-hairline)] sm:p-6"
                      />
                    ) : null,
                  )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
