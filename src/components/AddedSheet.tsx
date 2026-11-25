"use client";

import { AnimatePresence, m } from "motion/react";
import { ArrowRight, Check, Plus, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { getFlavor } from "@/config/flavors";
import { getProduct } from "@/config/products";
import { formatPrice } from "@/lib/format";
import { scrollToId, useMediaQuery, useScrollLock } from "@/lib/hooks";
import { useOrder } from "@/lib/order-store";
import { isTopOverlay, pushOverlay, trapTab } from "@/lib/overlay-stack";
import { FlavorPhoto } from "./FlavorPhoto";

/**
 * Confirmación después de agregar un helado: muestra lo agregado y el subtotal,
 * y ofrece los dos próximos pasos — finalizar el pedido o agregar otro helado.
 * Celular: hoja inferior compacta. Escritorio: tarjeta chica centrada.
 */
export function AddedSheet() {
  const { lastAdded, dismissAdded, openCart, subtotal, count } = useOrder();
  const open = !!lastAdded;
  const desktop = useMediaQuery("(min-width: 768px)");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const dismissRef = useRef(dismissAdded);
  dismissRef.current = dismissAdded;
  useScrollLock(open);

  // conserva el contenido mientras la hoja se cierra
  const last = useRef(lastAdded);
  if (lastAdded) last.current = lastAdded;
  const item = lastAdded ?? last.current;

  useEffect(() => {
    if (!open) return;
    const token = {};
    const release = pushOverlay(token);
    const t = setTimeout(() => primaryRef.current?.focus({ preventScroll: true }), 60);
    const onKey = (e: KeyboardEvent) => {
      if (!isTopOverlay(token)) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        dismissRef.current();
      }
      trapTab(e, panelRef.current);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      release();
    };
  }, [open, lastAdded?.key]);

  const product = item ? getProduct(item.sizeId) : undefined;
  const flavors = item ? item.flavors.map((id) => getFlavor(id)).filter((f) => !!f) : [];

  const finish = () => {
    dismissAdded();
    openCart("checkout");
  };

  const addAnother = () => {
    dismissAdded();
    // se espera a que se libere el bloqueo de scroll de la hoja
    setTimeout(() => {
      scrollToId("pedido");
      setTimeout(() => document.querySelector<HTMLElement>('#tamanos [aria-checked="true"]')?.focus({ preventScroll: true }), 450);
    }, 60);
  };

  return (
    <AnimatePresence>
      {open && product && item && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6" role="presentation">
          <m.div
            className="absolute inset-0 bg-carbon/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismissAdded}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full rounded-t-[28px] bg-cream px-4 pt-2.5 pb-[max(18px,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_-20px_rgb(28_25_23/0.45)] sm:px-6 md:max-w-[440px] md:rounded-[28px] md:px-6 md:pt-6 md:pb-6 md:shadow-[0_40px_90px_-30px_rgb(28_25_23/0.6)]"
            initial={desktop ? { opacity: 0, y: 12, scale: 0.97 } : { y: "100%" }}
            animate={desktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
            exit={desktop ? { opacity: 0, y: 8, scale: 0.98 } : { y: "100%" }}
            transition={desktop ? { duration: 0.24, ease: [0.22, 1, 0.36, 1] } : { type: "spring", stiffness: 420, damping: 40 }}
          >
            <div className="mb-2 flex justify-center md:hidden" aria-hidden>
              <span className="h-1.5 w-10 rounded-full bg-ink/15" />
            </div>

            <div className="flex items-center gap-3">
              <m.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 26, delay: 0.08 }}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1f8f4e] text-white"
                aria-hidden
              >
                <Check className="size-5" strokeWidth={3} />
              </m.span>
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="font-display text-[1.2rem] leading-tight font-bold tracking-[-0.02em] max-[359px]:text-[1.05rem]">
                  Agregado a tu pedido
                </h2>
                <p className="text-[13px] text-muted">
                  {count} {count === 1 ? "producto" : "productos"} en el carrito
                </p>
              </div>
              <button
                type="button"
                onClick={dismissAdded}
                className="grid size-10 shrink-0 place-items-center rounded-full text-ink/60 transition hover:bg-black/5 hover:text-ink"
                aria-label="Cerrar y seguir mirando"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* lo que se agregó */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/60 p-3 shadow-[inset_0_0_0_1px_var(--color-hairline)]">
              <div
                className={`grid size-[60px] shrink-0 gap-0.5 overflow-hidden rounded-xl bg-surface p-1 shadow-[inset_0_0_0_1px_var(--color-hairline)] ${flavors.length > 1 ? "grid-cols-2" : ""}`}
                aria-hidden
              >
                {flavors.slice(0, 4).map((f) => (
                  <FlavorPhoto key={f.id} flavor={f} sizes="60px" className="h-full w-full" />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[1.05rem] leading-tight font-bold tracking-[-0.01em]">
                  {item.qty > 1 ? `${item.qty} × ` : ""}
                  {product.name}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-ink/70">{flavors.map((f) => f.name).join(" · ")}</p>
              </div>
              <p className="shrink-0 self-start font-display text-[1.05rem] font-bold tabular-nums">{formatPrice(product.price * item.qty)}</p>
            </div>

            <div className="mt-3 flex items-baseline justify-between px-1">
              <span className="text-[14px] text-muted">Subtotal del pedido</span>
              <span className="font-display text-[1.3rem] font-bold tracking-[-0.02em] tabular-nums">{formatPrice(subtotal)}</span>
            </div>

            <div className="mt-4 grid gap-2.5">
              <button ref={primaryRef} type="button" onClick={finish} className="btn btn-dark group h-[52px] justify-between pr-2 pl-5 text-[16px]">
                Finalizar pedido
                <span className="grid size-9 place-items-center rounded-full bg-orange text-white">
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </button>
              <button type="button" onClick={addAnother} className="btn btn-ghost h-12 text-[15px]">
                <Plus className="size-4" aria-hidden /> Agregar otro helado
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
