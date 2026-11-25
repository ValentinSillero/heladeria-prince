import Image from "next/image";
import { BRAND } from "@/config/brand";
import { BRAND_ASSETS } from "@/config/brand-assets";

/**
 * Logo de la heladería (src/config/brand-assets.ts).
 * Con `logoStyle: "badge"` (imagen cuadrada) se muestra recortado en círculo.
 */
export function Logo({
  variant = "dark",
  className,
  priority,
  sizes = "140px",
  loading,
}: {
  variant?: "dark" | "light";
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: "eager" | "lazy";
}) {
  const badge = BRAND.logoStyle === "badge";
  return (
    <Image
      src={variant === "dark" ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight}
      alt={BRAND.name}
      className={badge ? `${className ?? ""} aspect-square rounded-full object-cover shadow-[0_0_0_2px_rgb(255_255_255/0.7)]` : className}
      preload={priority} loading={loading ?? (priority ? "eager" : undefined)}
      sizes={sizes}
    />
  );
}
