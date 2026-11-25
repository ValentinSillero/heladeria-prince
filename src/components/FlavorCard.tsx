import { Check } from "lucide-react";
import type { Flavor } from "@/config/flavors";
import { FlavorPhoto } from "./FlavorPhoto";

/**
 * Tarjeta de sabor: foto de la bocha sobre la superficie crema y nombre debajo.
 * Seleccionada: aro rosa fino, fondo cálido y tilde. Sin efectos exagerados.
 */
export function FlavorCard({
  flavor,
  selected,
  muted = false,
  onToggle,
  sizes,
  compact = false,
  children,
}: {
  flavor: Flavor;
  selected: boolean;
  muted?: boolean;
  onToggle: () => void;
  sizes: string;
  /** Versión para grillas densas (selector) */
  compact?: boolean;
  /** Línea secundaria opcional (ej. categoría) */
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={muted || undefined}
      onClick={onToggle}
      className={`group flex w-full flex-col items-stretch text-center transition-opacity duration-200 ${muted ? "opacity-40" : ""}`}
    >
      <span
        className={`relative block aspect-square overflow-hidden transition-[background-color,box-shadow] duration-300 ${compact ? "rounded-[18px]" : "rounded-[24px]"} ${
          selected
            ? "bg-surface-on shadow-[inset_0_0_0_2px_rgb(236_66_150/0.85),0_12px_24px_-20px_rgb(236_66_150/0.6)]"
            : "bg-surface shadow-[inset_0_0_0_1px_var(--color-hairline),inset_0_1px_0_rgb(255_255_255/0.55)] group-hover:shadow-[inset_0_0_0_1px_rgb(25_25_25/0.12),inset_0_1px_0_rgb(255_255_255/0.55),0_14px_26px_-24px_rgb(25_25_25/0.4)]"
        }`}
      >
        <FlavorPhoto
          flavor={flavor}
          sizes={sizes}
          className={`absolute inset-[3%] transition-transform duration-500 ease-[var(--ease-out-soft)] ${
            selected ? "scale-[1.04]" : muted ? "" : "group-hover:scale-[1.05] group-active:scale-[0.97]"
          }`}
        />
        {selected && (
          <span
            className={`absolute grid animate-[check-in_0.35s_var(--ease-spring)_both] place-items-center rounded-full bg-orange text-white shadow-md ${
              compact ? "top-1.5 right-1.5 size-6" : "top-2.5 right-2.5 size-7"
            }`}
          >
            <Check className={compact ? "size-3.5" : "size-4"} strokeWidth={3} aria-hidden />
          </span>
        )}
      </span>
      <span
        className={`px-0.5 font-display leading-[1.15] font-bold tracking-tight [overflow-wrap:anywhere] ${
          compact ? "mt-2 text-[13px] sm:text-[14px]" : "mt-2.5 text-[15px] sm:text-[16px]"
        } ${selected ? "text-[#c2236f]" : "text-ink"}`}
      >
        {flavor.name}
      </span>
      {children && <span className="mt-0.5 text-[11px] font-medium text-muted">{children}</span>}
    </button>
  );
}
