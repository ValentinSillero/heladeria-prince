"use client";

import { AnimatePresence, m } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  ClipboardCopy,
  Info,
  MessageCircle,
  Minus,
  Pencil,
  Plus,
  ShoppingBag,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { getLocality, LOCALITIES, SINGLE_LOCALITY } from "@/config/branches";
import { BRAND } from "@/config/brand";
import { getFlavor } from "@/config/flavors";
import { getProduct, MAX_QTY_PER_ITEM } from "@/config/products";
import { formatPrice } from "@/lib/format";
import { scrollToId } from "@/lib/hooks";
import { useOrder } from "@/lib/order-store";
import {
  buildDirectUrl,
  buildOrderMessage,
  getOrderChannel,
  validateCheckout,
  type CheckoutErrors,
} from "@/lib/whatsapp";
import { FlavorPhoto } from "./FlavorPhoto";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Sheet } from "./ui/Sheet";

interface SentInfo {
  kind: "direct" | "chat";
  url: string;
  message: string;
  copied: boolean;
  localityName: string;
}

const PLACE_LABEL = BRAND.place.singular.charAt(0).toUpperCase() + BRAND.place.singular.slice(1);

/** Formas de entrega activas para esta heladería (brand.ts → features) */
const METHODS = (
  [
    { id: "delivery", label: "Delivery", icon: Bike, on: BRAND.features.delivery },
    { id: "retiro", label: SINGLE_LOCALITY ? "Retiro en el local" : "Retiro en sucursal", icon: StoreIcon, on: BRAND.features.pickup },
  ] as const
).filter((opt) => opt.on);

/** "Marca · Localidad" (con una sola localidad, solo el nombre de la marca) */
function brandAt(placeName: string) {
  return SINGLE_LOCALITY ? BRAND.name : `${BRAND.name} · ${placeName}`;
}

function openExternal(url: string) {
  const w = window.open(url, "_blank");
  if (w) {
    try {
      w.opener = null;
    } catch {
      /* noop */
    }
  } else {
    window.location.href = url;
  }
}

export function CartSheet() {
  const o = useOrder();
  const { items, cartOpen, cartStep, closeCart, setCartStep, subtotal, count } = o;
  const [confirmClear, setConfirmClear] = useState(false);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [sent, setSent] = useState<SentInfo | null>(null);
  const [copiedAgain, setCopiedAgain] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const locality = getLocality(o.localityId);
  const channel = getOrderChannel(locality);
  const data = { ...o.draft, localityId: o.localityId };

  // "Intro" en un campo no envía el pedido: pasa al siguiente campo o cierra el teclado
  const nextField = (e: React.KeyboardEvent<HTMLInputElement>, next?: string) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    e.preventDefault();
    const el = next ? formRef.current?.querySelector<HTMLElement>(`#${next}`) : null;
    if (el) el.focus();
    else e.currentTarget.blur();
  };

  const goChoose = () => {
    closeCart();
    setTimeout(() => scrollToId("pedido"), 250);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCheckout(items, data);
    setErrors(errs);
    const firstKey = (["name", "localityId", "address", "storeId"] as const).find((k) => errs[k]);
    if (firstKey) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${firstKey}"]`)?.focus();
      return;
    }
    if (errs.items) return;
    if (!locality || channel.kind === "none") return;

    const message = buildOrderMessage(items, data);
    if (channel.kind === "direct") {
      const url = buildDirectUrl(channel.number, message);
      openExternal(url);
      setSent({ kind: "direct", url, message, copied: false, localityName: locality.name });
    } else {
      // el enlace oficial no admite texto precargado: copiamos el pedido y abrimos ese chat
      const copied = false;
      const info: SentInfo = { kind: "chat", url: channel.url, message, copied, localityName: locality.name };
      navigator.clipboard
        ?.writeText(message)
        .then(() => setSent((s) => (s ? { ...s, copied: true } : s)))
        .catch(() => undefined);
      openExternal(channel.url);
      setSent(info);
    }
    setCopiedAgain(false);
    setCartStep("sent");
  };

  const copyAgain = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent.message);
      setCopiedAgain(true);
    } catch {
      setCopiedAgain(false);
    }
  };

  const title = cartStep === "cart" ? "Tu pedido" : cartStep === "checkout" ? "Datos de entrega" : "¡Pedido listo!";

  return (
    <>
      <Sheet
        open={cartOpen}
        onClose={closeCart}
        title={title}
        subtitle={
          cartStep === "cart" && count > 0
            ? `${count} ${count === 1 ? "producto" : "productos"}${locality ? ` · ${locality.name}` : ""}`
            : cartStep === "checkout"
              ? "Último paso"
              : undefined
        }
        headerLeft={
          cartStep === "checkout" ? (
            <button
              type="button"
              onClick={() => setCartStep("cart")}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white shadow-[inset_0_0_0_1.5px_var(--color-line)]"
              aria-label="Volver al carrito"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : null
        }
        footer={
          cartStep === "cart" && items.length > 0 ? (
            <div className="grid gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-muted">Subtotal</span>
                <span className="font-display text-[1.9rem] leading-none font-extrabold tracking-tight tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <button type="button" onClick={() => setCartStep("checkout")} className="btn btn-dark h-14 justify-between px-6 text-[16px]">
                Continuar
                <ArrowRight className="size-5" aria-hidden />
              </button>
            </div>
          ) : cartStep === "checkout" ? (
            <div className="grid gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-muted">Subtotal{o.draft.method === "delivery" ? " (sin envío)" : ""}</span>
                <span className="font-display text-[1.7rem] leading-none font-extrabold tracking-tight tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={!!locality && channel.kind === "none"}
                className="btn h-14 bg-[#1f8f4e] px-6 text-[16px] text-white shadow-[0_14px_28px_-14px_rgb(31_143_78/0.9)] hover:bg-[#187a41]"
              >
                <MessageCircle className="size-5" aria-hidden />
                {channel.kind === "chat" ? "Copiar pedido y abrir WhatsApp" : "Enviar pedido por WhatsApp"}
              </button>
            </div>
          ) : undefined
        }
      >
        {cartStep === "cart" && (
          <>
            {items.length === 0 ? (
              <div className="grid place-items-center py-10 text-center">
                <span className="grid size-20 place-items-center rounded-full bg-vanilla text-choco">
                  <ShoppingBag className="size-8" aria-hidden />
                </span>
                <p className="mt-4 font-display text-2xl font-extrabold tracking-tight">Tu pedido está vacío</p>
                <p className="mt-1 text-muted">Elegí un tamaño y armalo con tus sabores favoritos.</p>
                <button type="button" onClick={goChoose} className="btn btn-dark mt-6">
                  Elegir tamaño
                </button>
              </div>
            ) : (
              <>
                <ul className="grid gap-3 pt-1">
                  <AnimatePresence initial={false}>
                    {items.map((it) => {
                      const p = getProduct(it.sizeId);
                      if (!p) return null;
                      const fl = it.flavors.map((id) => getFlavor(id)).filter(Boolean);
                      return (
                        <m.li
                          key={it.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                          className="rounded-[22px] bg-white p-3.5 shadow-[inset_0_0_0_1.5px_var(--color-line)]"
                        >
                          <div className="flex gap-3">
                            <div
                              className={`grid size-[76px] shrink-0 gap-0.5 overflow-hidden rounded-2xl bg-surface p-1 shadow-[inset_0_0_0_1px_var(--color-hairline)] ${fl.length > 1 ? "grid-cols-2" : ""}`}
                              aria-hidden
                            >
                              {fl.slice(0, 4).map((f) => (
                                <FlavorPhoto key={f!.id} flavor={f!} sizes="72px" className="h-full w-full" />
                              ))}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-display text-xl leading-tight font-extrabold tracking-tight">{p.name}</p>
                                <p className="font-display text-lg font-extrabold tabular-nums">{formatPrice(p.price * it.qty)}</p>
                              </div>
                              <p className="mt-0.5 text-sm leading-snug text-ink/75">{fl.map((f) => f!.name).join(" · ")}</p>
                              {it.qty > 1 && <p className="mt-0.5 text-xs text-muted">{formatPrice(p.price)} c/u</p>}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex h-11 items-center rounded-full bg-cream shadow-[inset_0_0_0_1.5px_var(--color-line)]" role="group" aria-label={`Cantidad de ${p.name}`}>
                              <button
                                type="button"
                                onClick={() => o.setQty(it.id, it.qty - 1)}
                                disabled={it.qty <= 1}
                                className="grid size-11 place-items-center rounded-full disabled:opacity-30"
                                aria-label="Restar uno"
                              >
                                <Minus className="size-4" />
                              </button>
                              <span className="w-6 text-center font-bold tabular-nums">{it.qty}</span>
                              <button
                                type="button"
                                onClick={() => o.setQty(it.id, it.qty + 1)}
                                disabled={it.qty >= MAX_QTY_PER_ITEM}
                                className="grid size-11 place-items-center rounded-full disabled:opacity-30"
                                aria-label="Sumar uno"
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => o.openPicker(it.sizeId, it.id)}
                              className="ml-auto inline-flex h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold hover:bg-vanilla"
                            >
                              <Pencil className="size-4" aria-hidden /> Sabores
                            </button>
                            <button
                              type="button"
                              onClick={() => o.removeItem(it.id)}
                              className="grid size-11 place-items-center rounded-full text-[#b3401f] hover:bg-[#fbe6de]"
                              aria-label={`Eliminar ${p.name}`}
                            >
                              <Trash2 className="size-[18px]" />
                            </button>
                          </div>
                        </m.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button type="button" onClick={goChoose} className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold hover:bg-vanilla">
                    <Plus className="size-4" aria-hidden /> Sumar otro pote
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="h-11 rounded-full px-3 text-sm font-semibold text-muted hover:text-[#b3401f]"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {cartStep === "checkout" && (
          <form id="checkout-form" ref={formRef} onSubmit={submit} noValidate className="grid gap-6 pt-1 pb-4">
            {/* nombre */}
            <div data-kb-reveal>
              <label htmlFor="ck-name" className="mb-1.5 block text-sm font-bold">
                Tu nombre
              </label>
              <input
                id="ck-name"
                data-field="name"
                className="field"
                value={o.draft.name}
                onChange={(e) => {
                  o.setDraft({ name: e.target.value });
                  if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
                }}
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint={o.draft.method === "delivery" ? "next" : "done"}
                onKeyDown={(e) => nextField(e, o.draft.method === "delivery" ? "ck-address" : undefined)}
                maxLength={80}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "err-name" : undefined}
                placeholder="Nombre y apellido"
              />
              {errors.name && <p id="err-name" className="mt-1.5 text-sm font-semibold text-[#c8401f]">{errors.name}</p>}
            </div>

            {/* localidad (no se muestra si hay una sola) */}
            {!SINGLE_LOCALITY && (
            <fieldset>
              <legend className="mb-1.5 text-sm font-bold">{PLACE_LABEL}</legend>
              <div className={`grid gap-2 ${LOCALITIES.length === 2 ? "grid-cols-2" : "grid-cols-3"}`} role="radiogroup" aria-describedby={errors.localityId ? "err-loc" : undefined}>
                {LOCALITIES.map((l, i) => {
                  const on = o.localityId === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      data-field={i === 0 ? "localityId" : undefined}
                      onClick={() => {
                        o.requestLocality(l.id);
                        if (errors.localityId) setErrors((er) => ({ ...er, localityId: undefined }));
                      }}
                      className={`min-h-12 rounded-2xl px-2 text-[14px] leading-tight font-bold transition ${
                        on ? "bg-carbon text-cream" : "bg-white shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
                      }`}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
              {errors.localityId && <p id="err-loc" className="mt-1.5 text-sm font-semibold text-[#c8401f]">{errors.localityId}</p>}
            </fieldset>
            )}

            {/* entrega */}
            <fieldset>
              <legend className="mb-1.5 text-sm font-bold">¿Cómo lo recibís?</legend>
              <div className={`grid gap-2 ${METHODS.length > 1 ? "grid-cols-2" : "grid-cols-1"}`} role="radiogroup">
                {METHODS.map((opt) => {
                  const on = o.draft.method === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => o.setDraft({ method: opt.id })}
                      className={`flex min-h-[60px] items-center gap-2.5 rounded-2xl px-3.5 text-left text-[15px] leading-tight font-bold transition ${
                        on ? "bg-carbon text-cream" : "bg-white shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
                      }`}
                    >
                      <Icon className={`size-5 shrink-0 ${on ? "text-orange-soft" : "text-choco"}`} aria-hidden />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {o.draft.method === "delivery" ? (
                  <m.div key="d" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="pt-4" data-kb-reveal>
                      <label htmlFor="ck-address" className="mb-1.5 block text-sm font-bold">
                        Dirección de entrega
                      </label>
                      <input
                        id="ck-address"
                        data-field="address"
                        className="field"
                        value={o.draft.address}
                        onChange={(e) => {
                          o.setDraft({ address: e.target.value });
                          if (errors.address) setErrors((er) => ({ ...er, address: undefined }));
                        }}
                        autoComplete="street-address"
                        enterKeyHint="done"
                        onKeyDown={(e) => nextField(e)}
                        maxLength={200}
                        aria-invalid={!!errors.address}
                        aria-describedby={`note-envio${errors.address ? " err-address" : ""}`}
                        placeholder="Calle, número, barrio"
                      />
                      {errors.address && <p id="err-address" className="mt-1.5 text-sm font-semibold text-[#c8401f]">{errors.address}</p>}
                      <p id="note-envio" className="mt-2.5 flex gap-2 rounded-xl bg-vanilla px-3 py-2.5 text-[13px] leading-snug text-ink/80">
                        <Info className="mt-px size-4 shrink-0 text-choco" aria-hidden />
                        El costo y la disponibilidad del envío se confirman por WhatsApp.
                      </p>
                    </div>
                  </m.div>
                ) : (
                  <m.div key="r" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="pt-4">
                      {!locality ? (
                        <p className="text-sm text-muted">Elegí tu {BRAND.place.singular} para ver dónde retirar.</p>
                      ) : locality.stores.length === 0 ? (
                        <p className="flex gap-2 rounded-xl bg-vanilla px-3 py-2.5 text-[13px] leading-snug text-ink/80">
                          <Info className="mt-px size-4 shrink-0 text-choco" aria-hidden />
                          En {locality.name} el punto de retiro se coordina por WhatsApp.
                        </p>
                      ) : (
                        <div role="radiogroup" aria-label={locality.stores.length > 1 ? "Sucursal de retiro" : "Local de retiro"} aria-describedby={errors.storeId ? "err-store" : undefined} className="grid gap-2">
                          <p className="text-sm font-bold">{locality.stores.length > 1 ? "¿En qué sucursal?" : "Retirás en"}</p>
                          {locality.stores.map((s, i) => {
                            const on = o.draft.storeId === s.id;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                data-field={i === 0 ? "storeId" : undefined}
                                onClick={() => {
                                  o.setDraft({ storeId: s.id });
                                  if (errors.storeId) setErrors((er) => ({ ...er, storeId: undefined }));
                                }}
                                className={`flex min-h-14 items-center gap-3 rounded-2xl px-4 text-left font-bold transition ${
                                  on ? "bg-carbon text-cream" : "bg-white shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
                                }`}
                              >
                                <span className={`grid size-6 place-items-center rounded-full border-2 ${on ? "border-orange bg-orange" : "border-ink/25"}`}>
                                  {on && <Check className="size-3.5 text-white" strokeWidth={3.5} />}
                                </span>
                                <span>
                                  {s.name}
                                  {s.address && <span className="block text-sm font-medium opacity-70">{s.address}</span>}
                                </span>
                              </button>
                            );
                          })}
                          {errors.storeId && <p id="err-store" className="text-sm font-semibold text-[#c8401f]">{errors.storeId}</p>}
                        </div>
                      )}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </fieldset>

            {/* aclaraciones */}
            <div data-kb-reveal>
              <label htmlFor="ck-notes" className="mb-1.5 block text-sm font-bold">
                Aclaraciones <span className="font-medium text-muted">(opcional)</span>
              </label>
              <textarea
                id="ck-notes"
                className="field min-h-[88px] resize-none"
                value={o.draft.notes}
                onChange={(e) => o.setDraft({ notes: e.target.value })}
                maxLength={400}
                rows={3}
                placeholder="Ej.: tocar timbre, horario, cucuruchos…"
              />
            </div>

            {/* resumen */}
            <div className="rounded-[20px] bg-white p-4 shadow-[inset_0_0_0_1.5px_var(--color-line)]">
              <p className="text-sm font-bold">Resumen</p>
              <ul className="mt-2 grid gap-1.5 text-sm">
                {items.map((it) => {
                  const p = getProduct(it.sizeId);
                  if (!p) return null;
                  return (
                    <li key={it.id} className="flex justify-between gap-3">
                      <span className="min-w-0 text-ink/80">
                        <strong className="text-ink">
                          {it.qty > 1 ? `${it.qty} × ` : ""}
                          {p.name}
                        </strong>{" "}
                        · {it.flavors.map((id) => getFlavor(id)?.name).join(", ")}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{formatPrice(p.price * it.qty)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* destino del pedido */}
            {locality && channel.kind === "chat" && (
              <p className="flex gap-2.5 rounded-2xl bg-[#e7f4ec] px-4 py-3 text-[14px] leading-snug text-[#14532d]">
                <ClipboardCopy className="mt-0.5 size-5 shrink-0" aria-hidden />
                <span>
                  Vamos a <strong>copiar tu pedido</strong> y abrir el chat oficial de <strong>{brandAt(locality.name)}</strong>. Solo
                  tenés que pegarlo y enviarlo.
                </span>
              </p>
            )}
            {locality && channel.kind === "direct" && (
              <p className="flex gap-2.5 rounded-2xl bg-[#e7f4ec] px-4 py-3 text-[14px] leading-snug text-[#14532d]">
                <MessageCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <span>
                  Se abrirá WhatsApp de <strong>{brandAt(locality.name)}</strong> con tu pedido escrito. Solo tenés que enviarlo.
                </span>
              </p>
            )}
            {locality && channel.kind === "none" && (
              <p role="alert" className="flex gap-2.5 rounded-2xl bg-[#fbe6de] px-4 py-3 text-[14px] leading-snug text-[#7a2610]">
                <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
                <span>
                  Todavía no podemos recibir pedidos online de {locality.name}. Escribinos por Instagram y te ayudamos.
                </span>
              </p>
            )}
          </form>
        )}

        {cartStep === "sent" && sent && (
          <div className="grid gap-5 pt-2 pb-4">
            <div className="flex items-center gap-4">
              <m.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 14 }}
                className="grid size-16 shrink-0 place-items-center rounded-full bg-[#1f8f4e] text-white"
              >
                <Check className="size-8" strokeWidth={3} aria-hidden />
              </m.span>
              <div>
                <p className="font-display text-xl leading-tight font-extrabold tracking-tight">
                  {sent.kind === "direct" ? "Te abrimos WhatsApp" : sent.copied ? "Pedido copiado" : "Abrimos el chat"}
                </p>
                <p className="mt-0.5 text-[15px] text-muted">
                  {sent.kind === "direct"
                    ? `Enviá el mensaje a ${brandAt(sent.localityName)} y esperá su confirmación.`
                    : `Pegá el pedido en el chat de ${brandAt(sent.localityName)} y envialo.`}
                </p>
              </div>
            </div>

            {sent.kind === "chat" && (
              <div>
                <label htmlFor="msg" className="mb-1.5 block text-sm font-bold">
                  Tu pedido
                </label>
                <textarea id="msg" readOnly value={sent.message} rows={8} className="field resize-none font-mono text-[13px] leading-relaxed" onFocus={(e) => e.currentTarget.select()} />
                <button type="button" onClick={copyAgain} className="btn btn-ghost mt-2 w-full">
                  <ClipboardCopy className="size-4" aria-hidden /> {copiedAgain ? "¡Copiado!" : "Copiar pedido"}
                </button>
              </div>
            )}

            <div className="grid gap-2.5">
              <a href={sent.url} target="_blank" rel="noopener noreferrer" className="btn h-14 bg-[#1f8f4e] text-white hover:bg-[#187a41]">
                <MessageCircle className="size-5" aria-hidden /> Abrir WhatsApp de nuevo
              </a>
              <button
                type="button"
                className="btn btn-dark h-14"
                onClick={() => {
                  o.clearCart();
                  setSent(null);
                  closeCart();
                  setCartStep("cart");
                }}
              >
                <ShoppingBag className="size-5" aria-hidden /> Ya lo envié · empezar de nuevo
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setCartStep("cart")}>
                Volver a mi pedido
              </button>
            </div>
          </div>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmClear}
        title="¿Vaciar el carrito?"
        description="Se van a borrar todos los productos de tu pedido."
        confirmLabel="Sí, vaciar"
        tone="danger"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          o.clearCart();
          setConfirmClear(false);
        }}
      />
    </>
  );
}
