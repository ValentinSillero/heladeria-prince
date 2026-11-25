"use client";

import { AnimatePresence, m } from "motion/react";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { BRAND } from "@/config/brand";
import { getLocality } from "@/config/branches";
import { formatPrice } from "@/lib/format";
import { useOrder } from "@/lib/order-store";
import { AddedSheet } from "./AddedSheet";
import { CartSheet } from "./CartSheet";
import { FlavorPicker } from "./FlavorPicker";
import { ConfirmDialog } from "./ui/ConfirmDialog";

/** Barra inferior compacta con subtotal y acceso al carrito. */
function CartBar() {
  const { count, subtotal, openCart, cartOpen, picker, hydrated, bump, localityId, lastAdded } = useOrder();
  const visible = hydrated && count > 0 && !cartOpen && !picker && !lastAdded;
  const loc = getLocality(localityId);
  return (
    <>
      {/* espacio reservado para que la barra no tape el final de la página */}
      {hydrated && count > 0 && <div aria-hidden className="h-24 bg-carbon" />}
      <AnimatePresence>
        {visible && (
          <m.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))]"
          >
            <button
              type="button"
              onClick={() => openCart("cart")}
              className="pointer-events-auto mx-auto flex h-16 w-full max-w-[520px] items-center gap-3 rounded-full bg-carbon pr-2 pl-2 text-left text-cream shadow-[0_20px_40px_-14px_rgb(0_0_0/0.7)] transition active:scale-[0.98]"
              aria-label={`Ver pedido: ${count} ${count === 1 ? "producto" : "productos"}, subtotal ${formatPrice(subtotal)}`}
            >
              <m.span
                key={bump}
                initial={{ scale: 1.25, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 12 }}
                className="relative grid size-12 shrink-0 place-items-center rounded-full bg-orange text-white"
              >
                <ShoppingBag className="size-5" aria-hidden />
                <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-cream px-1 text-[11px] font-extrabold text-carbon tabular-nums">
                  {count}
                </span>
              </m.span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-xs text-cream/60">{loc ? `Pedido · ${loc.name}` : "Tu pedido"}</span>
                <span className="block font-display text-xl font-extrabold tracking-tight tabular-nums">{formatPrice(subtotal)}</span>
              </span>
              <span className="inline-flex h-12 items-center gap-1.5 rounded-full bg-cream px-4 text-[15px] font-bold text-carbon">
                Ver pedido <ArrowRight className="size-4" aria-hidden />
              </span>
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Toast() {
  const { toast, openCart, cartOpen } = useOrder();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[76px] z-[90] flex justify-center px-3 md:top-[86px]">
      <AnimatePresence>
        {toast && (
          <m.div
            key={toast.key}
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.97 }}
            className="pointer-events-auto flex max-w-[min(460px,100%)] min-w-0 items-center gap-3 rounded-full bg-carbon py-2 pr-2 pl-2 text-cream shadow-2xl"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1f8f4e]">
              <Check className="size-5" strokeWidth={3} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[15px] font-bold">{toast.title}</span>
              {toast.detail && <span className="block truncate text-xs text-cream/65">{toast.detail}</span>}
            </span>
            {!cartOpen && (
              <button type="button" onClick={() => openCart("cart")} className="ml-1 h-9 shrink-0 rounded-full bg-cream px-3.5 text-sm font-bold text-carbon">
                Ver
              </button>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocalityConfirm() {
  const { localityPrompt, confirmLocality, cancelLocality, localityId } = useOrder();
  const from = getLocality(localityId);
  const to = getLocality(localityPrompt);
  return (
    <ConfirmDialog
      open={!!localityPrompt}
      title={`¿Cambiar a ${to?.name ?? ""}?`}
      description={
        <>
          Tenés productos en el carrito para <strong className="text-ink">{from?.name}</strong>. Si cambiás, tu pedido se va a enviar a{" "}
          <strong className="text-ink">{BRAND.name} · {to?.name}</strong>. Tus productos se mantienen.
        </>
      }
      confirmLabel={`Sí, pedir en ${to?.name ?? ""}`}
      cancelLabel={`Seguir en ${from?.name ?? ""}`}
      onCancel={cancelLocality}
      onConfirm={confirmLocality}
    />
  );
}

export function Overlays() {
  return (
    <>
      <CartBar />
      <CartSheet />
      <FlavorPicker />
      <AddedSheet />
      <LocalityConfirm />
      <Toast />
    </>
  );
}
