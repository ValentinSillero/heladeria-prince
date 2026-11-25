import Image from "next/image";
import type { Flavor } from "@/config/flavors";
import { photoFor } from "@/lib/flavor-photos";

/**
 * Foto de la bocha de un sabor: WebP con transparencia real (sin fondo) y su
 * sombra de contacto semitransparente, así se apoya sobre cualquier superficie.
 * Si el sabor no tiene foto, muestra un diseño tipográfico (sin círculos ni íconos).
 */
export function FlavorPhoto({
  flavor,
  sizes,
  className = "",
}: {
  flavor: Flavor;
  sizes: string;
  className?: string;
}) {
  const img = photoFor(flavor.photo);
  if (!img) {
    return (
      <div
        className={`grid place-items-center overflow-hidden ${className.includes("absolute") ? className : `relative ${className}`}`}
        style={{ backgroundColor: `color-mix(in srgb, ${flavor.color} 16%, transparent)` }}
        aria-hidden
      >
        <span className="font-serif text-[clamp(2rem,40%,4rem)] leading-none italic" style={{ color: flavor.color }}>
          {flavor.name.charAt(0)}
        </span>
      </div>
    );
  }
  return (
    <div className={className.includes("absolute") ? className : `relative ${className}`} aria-hidden>
      <Image src={img} alt="" fill sizes={sizes} className="object-contain select-none" draggable={false} />
    </div>
  );
}
