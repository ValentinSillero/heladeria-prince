"use client";

import { AnimatePresence, m } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { getLocality, LOCALITIES, SINGLE_LOCALITY } from "@/config/branches";
import { BRAND } from "@/config/brand";
import { useOrder } from "@/lib/order-store";

/**
 * Localidad (o sucursal) como desplegable dentro de una frase: "Pedís en San José ▾".
 * Con una sola localidad no hay nada que elegir: se muestra el nombre fijo.
 */
export function LocalityPicker() {
  if (SINGLE_LOCALITY) {
    return (
      <span className="font-serif text-[1.45rem] leading-none text-ink italic sm:text-[1.7rem]">{SINGLE_LOCALITY.name}</span>
    );
  }
  return <LocalityDropdown />;
}

function LocalityDropdown() {
  const { localityId, requestLocality, hydrated } = useOrder();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = hydrated ? getLocality(localityId) : undefined;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const opts = [...(wrap.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ?? [])];
        const i = opts.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.key === "ArrowDown" ? Math.min(opts.length - 1, i + 1) : Math.max(0, i - 1);
        opts[next]?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => wrap.current?.querySelector<HTMLButtonElement>('[role=option][aria-selected="true"], [role=option]')?.focus(), 20);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-1.5 font-serif text-[1.45rem] leading-none text-ink italic underline decoration-ink/30 decoration-1 underline-offset-[7px] transition-[text-decoration-color] hover:decoration-ink sm:text-[1.7rem]"
      >
        {current ? current.name : `elegí tu ${BRAND.place.singular}`}
        {!current && <span className="ml-0.5 size-1.5 self-start rounded-full bg-orange" aria-hidden />}
        <ChevronDown className={`size-4 shrink-0 not-italic transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden />
        <span className="sr-only">. Cambiar {BRAND.place.singular}</span>
      </button>
      <AnimatePresence>
        {open && (
          <m.ul
            id={listId}
            role="listbox"
            aria-label={BRAND.place.singular}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 z-30 mt-3 w-[220px] origin-top-left rounded-2xl bg-cream p-1.5 shadow-[0_24px_50px_-22px_rgb(74_42_29/0.5),0_0_0_1px_var(--color-hairline)]"
          >
            {LOCALITIES.map((l) => {
              const on = current?.id === l.id;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      setOpen(false);
                      requestLocality(l.id);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[15px] outline-none transition-colors hover:bg-surface focus-visible:bg-surface ${
                      on ? "font-semibold text-ink" : "text-ink/80"
                    }`}
                  >
                    {l.name}
                    {on && <Check className="size-4 text-orange" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
