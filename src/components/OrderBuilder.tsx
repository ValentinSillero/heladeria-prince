"use client";

import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { getProduct, PRODUCTS, type SizeId } from "@/config/products";
import { formatPrice } from "@/lib/format";
import { useOrder } from "@/lib/order-store";
import { BRAND } from "@/config/brand";
import potekilo from "@/assets/potes/pote-kilo.webp";
import potemedio from "@/assets/potes/pote-medio.webp";
import potecuarto from "@/assets/potes/pote-cuarto.webp";
import { LocalityPicker } from "./LocalityPicker";

/**
 * "Armá tu pedido": el pote es el protagonista y cambia de composición con el tamaño.
 *
 * Tres fotos distintas (2, 3 y 4 bochas) comparten fondo (#E6D4BA, el mismo de la
 * sección), cámara y "mesa". Están apiladas y precargadas: al cambiar de tamaño, la
 * foto entrante nace con la huella de la anterior y crece/encoge hasta su tamaño real
 * mientras ambas se funden, como una transformación física del producto.
 *
 * Las bochas son ilustrativas de la combinación posible, no equivalen al peso.
 */

interface Pote {
  img: StaticImageData;
  /** ancho mostrado, en % del escenario (proporcional al tamaño real del pote) */
  width: number;
  alt: string;
}

const POTES: Record<SizeId, Pote> = {
  cuarto: { img: potecuarto, width: 58, alt: "Pote chico de 1/4 kg con dos bochas: dulce de leche y frutilla" },
  medio: { img: potemedio, width: 70, alt: "Pote mediano de 1/2 kg con tres bochas: chocolate, dulce de leche y frutilla" },
  kilo: { img: potekilo, width: 82, alt: "Pote grande de 1 kg con cuatro bochas: chocolate, dulce de leche, frutilla y vainilla" },
};

const ORDER: SizeId[] = ["cuarto", "medio", "kilo"];

// bordes de cada foto fundidos con el fondo (evita cualquier corte visible al escalar)
const FEATHER: React.CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 7%, #000 95%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 7%, #000 95%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

function PoteStage({ size }: { size: SizeId }) {
  const reduce = useReducedMotion();
  const active = POTES[size];
  return (
    <div className="relative aspect-[1/1.06] w-full" aria-live="polite">
      <span className="sr-only">{active.alt}</span>
      {ORDER.map((id) => {
        const p = POTES[id];
        const on = id === size;
        return (
          <m.div
            key={id}
            aria-hidden
            className="absolute bottom-0 left-1/2 origin-bottom"
            style={{ width: `${p.width}%`, x: "-50%" }}
            initial={false}
            animate={{
              opacity: on ? 1 : 0,
              // todas las fotos ocupan la huella del pote activo: la que entra crece o encoge
              // desde la anterior hasta su tamaño real
              scale: active.width / p.width,
            }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    scale: { type: "spring", stiffness: 210, damping: 30, mass: 0.9 },
                    opacity: { duration: on ? 0.32 : 0.26, ease: [0.22, 1, 0.36, 1], delay: on ? 0.04 : 0 },
                  }
            }
          >
            <Image
              src={p.img}
              alt=""
              sizes="(min-width:1024px) 480px, (min-width:640px) 50vw, 80vw"
              className="h-auto w-full select-none"
              style={FEATHER}
              draggable={false}
            />
          </m.div>
        );
      })}
    </div>
  );
}

function SizeSelector({ size, onChange }: { size: SizeId; onChange: (s: SizeId) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (dir: 1 | -1) => {
    const i = ORDER.indexOf(size);
    const next = ORDER[(i + dir + ORDER.length) % ORDER.length];
    onChange(next);
    refs.current[ORDER.indexOf(next)]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label="Tamaño del pote"
      id="tamanos"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          move(-1);
        }
      }}
      className="relative grid scroll-mt-28 grid-cols-3 rounded-full bg-white/40 p-1 shadow-[inset_0_0_0_1px_var(--color-hairline)]"
    >
      {PRODUCTS.map((p, i) => {
        const on = p.id === size;
        return (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(p.id)}
            className="relative flex h-[60px] flex-col items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6D4BA] sm:h-16"
          >
            {on && (
              <m.span
                layoutId="size-pill"
                aria-hidden
                className="absolute inset-0 rounded-full bg-carbon shadow-[0_10px_22px_-12px_rgb(28_25_23/0.8)]"
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
              />
            )}
            <span className={`relative font-display text-[17px] leading-none font-bold tracking-[-0.02em] transition-colors duration-200 sm:text-[18px] ${on ? "text-cream" : "text-ink/80"}`}>
              {p.name}
            </span>
            <span className={`relative mt-1 text-[11px] leading-none font-medium transition-colors duration-200 sm:text-[12px] ${on ? "text-cream/65" : "text-ink/55"}`}>
              {p.maxFlavors} sabores
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Texto que cambia con un desplazamiento vertical corto, sin saltos de layout. */
function Swap({ k, children, className }: { k: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-grid overflow-hidden ${className ?? ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={k}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="col-start-1 row-start-1"
        >
          {children}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

export function OrderBuilder() {
  const { openPicker } = useOrder();
  const [size, setSize] = useState<SizeId>("medio");
  const product = getProduct(size)!;

  return (
    <section id="pedido" className="relative overflow-hidden bg-[#E6D4BA] pt-8 pb-12 sm:py-16 lg:py-20" aria-labelledby="pedido-title">
      <div className="container-x grid grid-cols-[minmax(0,1fr)] items-center gap-y-2 lg:min-h-[min(720px,calc(100svh-72px))] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-x-14 xl:gap-x-20">
        {/* título + localidad */}
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="hidden text-[12px] font-semibold tracking-[0.18em] text-ink/60 uppercase sm:block">Pedido online</p>
          <h2 id="pedido-title" className="section-title sm:mt-3">
            Armá tu <span className="font-serif font-normal tracking-[-0.01em] italic">pedido</span>
          </h2>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 sm:mt-6">
            <span className="text-[16px] text-ink/70 sm:text-[17px]">Pedís en</span>
            <LocalityPicker />
          </div>
        </div>

        {/* escenario del producto */}
        <div className="mx-auto w-[min(100%,calc(44svh/1.06),380px)] sm:w-[min(72%,calc(52svh/1.06))] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:w-full lg:max-w-[580px]">
          <PoteStage size={size} />
        </div>

        {/* selector + precio + acción */}
        <div className="lg:col-start-1 lg:row-start-2 lg:self-start lg:pt-8">
          <SizeSelector size={size} onChange={setSize} />

          <div className="mt-5 flex items-end justify-between gap-3 sm:mt-7 sm:gap-4">
            <div className="min-w-0">
              <Swap k={product.id} className="font-display text-[#c2236f] text-[1.7rem] leading-none min-[360px]:text-[2.1rem] font-bold tracking-[-0.03em] tabular-nums sm:text-[2.6rem]">
                {formatPrice(product.price)}
              </Swap>
              <p className="mt-1.5 text-[12px] text-ink/65 min-[360px]:text-[13px]">
                <Swap k={`${product.id}-m`}>
                  {product.name} · hasta {product.maxFlavors} sabores
                </Swap>
              </p>
            </div>
            <button
              type="button"
              onClick={() => openPicker(size)}
              className="btn btn-dark group h-[52px] shrink-0 gap-3 pr-2 pl-5 text-[15px] whitespace-nowrap max-[359px]:h-12 max-[359px]:gap-2 max-[359px]:pl-4 max-[359px]:text-[14px]"
              aria-label={`Elegir sabores para ${product.name}`}
            >
              Elegir sabores
              <span className="grid size-9 place-items-center rounded-full bg-orange text-white">
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </button>
          </div>
          <p className="mt-5 hidden text-[13px] text-ink/60 sm:block">Después elegís los sabores y confirmás por WhatsApp.</p>
          {BRAND.demoNotice && (
            <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-white/60 px-3 py-2 text-[12.5px] leading-snug text-ink/75 ring-1 ring-ink/10">
              <span className="mt-[5px] size-1.5 shrink-0 rounded-full bg-orange" aria-hidden />
              {BRAND.demoNotice}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
