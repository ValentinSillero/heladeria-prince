"use client";

import { AnimatePresence, m } from "motion/react";
import { MapPin, Menu, ShoppingBag, X } from "lucide-react";
import { Instagram } from "./icons";
import { useEffect, useState } from "react";
import { getLocality, LOCALITIES, SINGLE_LOCALITY } from "@/config/branches";
import { BRAND } from "@/config/brand";
import { SITE } from "@/config/site";
import { useOrder } from "@/lib/order-store";
import { Logo } from "./Logo";

const placeLabel = BRAND.place.singular.charAt(0).toUpperCase() + BRAND.place.singular.slice(1);

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#pedido", label: "Pedir" },
  { href: "#sucursales", label: LOCALITIES.length > 1 ? "Sucursales" : "Ubicación" },
];

export function Header() {
  const { count, openCart, hydrated, localityId, bump } = useOrder();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const locality = getLocality(localityId);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled || menu ? "bg-cream/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center gap-3 md:h-[72px]">
        <a href="#inicio" className="shrink-0 rounded-lg" aria-label={`${BRAND.name}, ir al inicio`}>
          <Logo className="h-10 w-auto md:h-12" sizes="80px" loading="eager" />
        </a>

        <nav aria-label="Principal" className="ml-6 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[15px] font-semibold text-ink/80 transition hover:bg-ink/[0.06] hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <a
            href={SITE.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-semibold text-ink/80 transition hover:bg-ink/[0.06] hover:text-ink"
          >
            <Instagram className="size-4" aria-hidden /> Instagram
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!SINGLE_LOCALITY && (
            <a
              href="#pedido"
              className="hidden h-11 items-center gap-1.5 rounded-full bg-white/70 px-3.5 text-sm font-semibold whitespace-nowrap shadow-[inset_0_0_0_1.5px_var(--color-line)] transition hover:bg-white sm:inline-flex md:hidden lg:inline-flex"
              aria-label={locality ? `${placeLabel}: ${locality.name}. Cambiar` : `Elegir ${BRAND.place.singular}`}
            >
              <MapPin className="size-4 text-orange" aria-hidden />
              {hydrated && locality ? locality.name : `Elegí ${BRAND.place.singular}`}
            </a>
          )}

          <button
            type="button"
            onClick={() => openCart("cart")}
            className="relative inline-flex h-11 items-center gap-2 rounded-full bg-carbon pr-4 pl-3.5 text-sm font-bold text-cream shadow-[0_10px_22px_-12px_rgb(0_0_0/0.7)] transition active:scale-95"
            aria-label={`Ver carrito${count ? `, ${count} ${count === 1 ? "producto" : "productos"}` : ", vacío"}`}
          >
            <ShoppingBag className="size-[18px]" aria-hidden />
            <span className="hidden sm:inline">Carrito</span>
            <m.span
              key={bump}
              initial={bump ? { scale: 1.7 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
              className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs tabular-nums ${
                hydrated && count ? "bg-orange text-white" : "bg-white/15 text-cream/80"
              }`}
            >
              {hydrated ? count : 0}
            </m.span>
          </button>

          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-white/70 shadow-[inset_0_0_0_1.5px_var(--color-line)] md:hidden"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-controls="menu-movil"
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
          >
            {menu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <m.nav
            id="menu-movil"
            aria-label="Menú"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="container-x pb-4 md:hidden"
          >
            <ul className="grid gap-1.5 rounded-3xl bg-white p-2 shadow-xl shadow-carbon/10">
              {[...LINKS, ...(SINGLE_LOCALITY ? [] : [{ href: "#pedido", label: locality ? `${placeLabel}: ${locality.name}` : `Elegir ${BRAND.place.singular}` }])].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setMenu(false)}
                    className="flex min-h-12 items-center rounded-2xl px-4 font-display text-lg font-bold tracking-tight active:bg-vanilla"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={SITE.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenu(false)}
                  className="flex min-h-12 items-center gap-2 rounded-2xl px-4 font-display text-lg font-bold tracking-tight active:bg-vanilla"
                >
                  <Instagram className="size-5" aria-hidden /> @{SITE.instagram.handle}
                </a>
              </li>
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
