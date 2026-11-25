"use client";

import { AnimatePresence, m } from "motion/react";
import { Minus, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { availableFlavors, CATEGORIES, getFlavor, type CategoryId, type Flavor } from "@/config/flavors";
import { getProduct, MAX_QTY_PER_ITEM } from "@/config/products";
import { formatPrice } from "@/lib/format";
import { useOrder } from "@/lib/order-store";
import { FlavorCard } from "./FlavorCard";
import { FlavorPhoto } from "./FlavorPhoto";
import { Dialog } from "./ui/Dialog";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const GRID = "grid grid-cols-2 gap-x-2.5 gap-y-4 min-[360px]:grid-cols-3 sm:grid-cols-4 sm:gap-x-3 md:grid-cols-5 lg:grid-cols-6";
const CARD_SIZES = "(min-width:768px) 160px, (min-width:640px) 22vw, (min-width:360px) 30vw, 45vw";

/**
 * Selector de sabores (único lugar donde se muestran todos los sabores).
 * Estructura: encabezado compacto · buscador + categorías fijos · grilla con un
 * único scroll · barra inferior fija con lo elegido, cantidad y confirmación.
 */
export function FlavorPicker() {
  const { picker, closePicker, items, addItem, updateItem } = useOrder();
  // conserva el último contenido mientras el diálogo se cierra
  const last = useRef(picker);
  if (picker) last.current = picker;
  const active = picker ?? last.current;
  const product = active ? getProduct(active.sizeId) : undefined;
  const editing = active?.editId ? items.find((i) => i.id === active.editId) : undefined;

  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [qty, setQty] = useState(1);
  const [limitHit, setLimitHit] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  // evita agregar dos veces el mismo helado con toques repetidos mientras el diálogo se cierra
  const submitted = useRef(false);

  // al abrir: estado limpio (o los sabores del pote que se está editando)
  useEffect(() => {
    if (!picker || !product) return;
    submitted.current = false;
    setSelected(editing ? editing.flavors.slice(0, product.maxFlavors) : []);
    setQuery("");
    setCat("all");
    setQty(1);
    setLimitHit(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picker?.sizeId, picker?.editId, !!picker]);

  // al cambiar filtro o búsqueda, volver arriba de la grilla
  useEffect(() => {
    scrollRef.current?.closest(".overflow-y-auto")?.scrollTo({ top: 0 });
  }, [cat, query]);

  const all = availableFlavors();
  const q = norm(query.trim());
  const flavors = useMemo(
    () => all.filter((f) => (cat === "all" || f.category === cat) && (!q || norm(f.name).includes(q))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, cat],
  );

  if (!product) return null;

  const max = product.maxFlavors;
  const full = selected.length >= max;
  const none = selected.length < product.minFlavors;

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
      setLimitHit(0);
      return;
    }
    if (selected.length >= max) {
      setLimitHit((n) => n + 1);
      return;
    }
    setSelected([...selected, id]);
  };

  const confirm = () => {
    if (none || !picker || submitted.current) return;
    submitted.current = true;
    if (editing) updateItem(editing.id, selected);
    else addItem(product.id, selected, qty);
    closePicker();
  };

  const grouped = cat === "all" && !q;
  const card = (f: Flavor, caption?: string | null) => (
    <li key={f.id}>
      <FlavorCard flavor={f} selected={selected.includes(f.id)} muted={full && !selected.includes(f.id)} onToggle={() => toggle(f.id)} sizes={CARD_SIZES} compact>
        {caption}
      </FlavorCard>
    </li>
  );

  const message =
    limitHit > 0 && full
      ? `Máximo ${max} ${max === 1 ? "sabor" : "sabores"}. Quitá uno para cambiarlo.`
      : none
        ? `Elegí al menos ${product.minFlavors} sabor para continuar.`
        : selected.map((id) => getFlavor(id)?.name).join(" · ");

  return (
    <Dialog
      open={!!picker}
      onClose={closePicker}
      label={`${editing ? "Editar sabores de" : "Elegir sabores para"} ${product.name}`}
      header={
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[1.35rem] leading-tight font-bold tracking-[-0.02em] sm:text-[1.6rem]">
              {editing ? "Editar sabores · " : "Armá tu "}
              <span className="text-orange">{product.name}</span>
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {formatPrice(product.price)} · hasta {max} {max === 1 ? "sabor" : "sabores"}
            </p>
          </div>
          <button
            type="button"
            onClick={closePicker}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/70 shadow-[inset_0_0_0_1px_var(--color-hairline)] transition hover:bg-white active:scale-95"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
      }
      toolbar={
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-4">
          <label className="relative block md:w-[260px] md:shrink-0">
            <span className="sr-only">Buscar sabor</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              placeholder="Buscar sabor"
              enterKeyHint="search"
              autoComplete="off"
              className="h-11 w-full rounded-full bg-white/75 pr-10 pl-10 text-[16px] shadow-[inset_0_0_0_1px_var(--color-hairline)] outline-none transition placeholder:text-muted focus:bg-white focus:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-vanilla hover:text-ink"
                aria-label="Borrar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0" role="group" aria-label="Filtrar por categoría">
            {[{ id: "all" as const, name: "Todos" }, ...CATEGORIES].map((c) => {
              const on = cat === c.id;
              const n = c.id === "all" ? all.length : all.filter((f) => f.category === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={(e) => {
                    setCat(c.id);
                    e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
                  }}
                  aria-pressed={on}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition ${
                    on ? "bg-carbon text-cream" : "bg-white/60 text-ink/80 shadow-[inset_0_0_0_1px_var(--color-hairline)] hover:bg-white hover:text-ink"
                  }`}
                >
                  {c.name}
                  <span className={`tabular-nums ${on ? "text-cream/60" : "text-muted"}`}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      }
      footer={
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:flex md:items-center md:justify-between md:gap-6">
          <div className="flex min-w-0 items-center gap-3 md:flex-1">
            <ul className="flex shrink-0 gap-1.5" aria-label={`Sabores elegidos: ${selected.length} de ${max}`}>
              {Array.from({ length: max }, (_, i) => {
                const fl = selected[i] ? getFlavor(selected[i]) : undefined;
                return (
                  <li key={i}>
                    {fl ? (
                      <button
                        type="button"
                        onClick={() => toggle(fl.id)}
                        className="group relative grid size-10 place-items-center rounded-xl bg-surface min-[360px]:size-11 shadow-[inset_0_0_0_1px_var(--color-hairline)]"
                        aria-label={`Quitar ${fl.name}`}
                        title={`Quitar ${fl.name}`}
                      >
                        <m.span key={fl.id} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 28 }} className="absolute inset-0.5">
                          <FlavorPhoto flavor={fl} sizes="44px" className="h-full w-full" />
                        </m.span>
                        <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-carbon text-cream opacity-80 transition group-hover:opacity-100">
                          <X className="size-2.5" strokeWidth={3} />
                        </span>
                      </button>
                    ) : (
                      <span className="grid size-10 place-items-center rounded-xl border border-dashed min-[360px]:size-11 border-ink/20 text-[13px] font-semibold text-ink/30">{i + 1}</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold tabular-nums">
                {selected.length} de {max} sabores
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <m.p
                  key={message}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.15 }}
                  role="status"
                  className={`truncate text-[12px] ${limitHit > 0 && full ? "font-semibold text-[#c2236f]" : "text-muted"}`}
                >
                  {message}
                </m.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2.5 md:shrink-0">
            {!editing && (
              <div className="flex h-12 shrink-0 items-center rounded-full bg-white/70 shadow-[inset_0_0_0_1px_var(--color-hairline)]" role="group" aria-label="Cantidad de potes">
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full disabled:opacity-30"
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  disabled={qty <= 1}
                  aria-label="Restar un pote"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-5 text-center text-[15px] font-bold tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full disabled:opacity-30"
                  onClick={() => setQty((v) => Math.min(MAX_QTY_PER_ITEM, v + 1))}
                  disabled={qty >= MAX_QTY_PER_ITEM}
                  aria-label="Sumar un pote"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={confirm}
              disabled={none}
              className="btn btn-dark h-12 min-w-0 flex-1 justify-between gap-3 px-5 md:w-[300px] md:flex-none text-[15px] disabled:bg-ink/15 disabled:text-ink/50 disabled:opacity-100 disabled:shadow-none"
            >
              {none ? (
                <span className="w-full truncate text-center">Elegí al menos 1 sabor</span>
              ) : (
                <>
                  <span className="truncate">
                    {editing ? (
                      "Guardar sabores"
                    ) : (
                      <>
                        Agregar<span className="hidden min-[400px]:inline"> al carrito</span>
                      </>
                    )}
                  </span>
                  {!editing && <span className="shrink-0 tabular-nums">{formatPrice(product.price * qty)}</span>}
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div ref={scrollRef} className="px-4 pt-4 pb-6 sm:px-6 sm:pt-5">
        {flavors.length === 0 ? (
          <div className="grid place-items-center gap-3 py-16 text-center">
            <p className="font-display text-lg font-bold">No encontramos “{query}”.</p>
            <button
              type="button"
              className="btn-sm btn-line"
              onClick={() => {
                setQuery("");
                setCat("all");
              }}
            >
              Ver todos los sabores
            </button>
          </div>
        ) : grouped ? (
          <div className="grid gap-8">
            {CATEGORIES.map((c) => {
              const list = flavors.filter((f) => f.category === c.id);
              if (!list.length) return null;
              return (
                <section key={c.id} aria-labelledby={`cat-${c.id}`}>
                  <h3 id={`cat-${c.id}`} className="mb-3 flex items-baseline gap-2 text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">
                    {c.name}
                    <span className="font-normal tracking-normal tabular-nums">{list.length}</span>
                  </h3>
                  <ul className={GRID}>{list.map((f) => card(f))}</ul>
                </section>
              );
            })}
          </div>
        ) : (
          <ul className={GRID}>{flavors.map((f) => card(f, q && cat === "all" ? CATEGORIES.find((c) => c.id === f.category)?.name : null))}</ul>
        )}
        <p className="pt-8 text-center text-xs text-muted">Fotos ilustrativas del tipo de sabor.</p>
      </div>
    </Dialog>
  );
}
