import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Instagram } from "./icons";
import { SITE } from "@/config/site";
import { BRAND } from "@/config/brand";
import { BRAND_ASSETS } from "@/config/brand-assets";

// Imágenes oficiales de la marca (ver src/config/brand-assets.ts).
const TILES = BRAND_ASSETS.instagramTiles.slice(0, 4).map((src) => ({ src, className: "" }));
const badge = BRAND.logoStyle === "badge";

export function InstagramSection() {
  return (
    <section className="bg-peach/60 py-16 sm:py-24" aria-labelledby="ig-title">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`grid size-16 place-items-center overflow-hidden rounded-full bg-white shadow-[0_0_0_3px_var(--color-orange)] ${badge ? "" : "p-2.5"}`}
            >
              <Image src={BRAND_ASSETS.logoDark} alt="" sizes="64px" className={badge ? "size-full object-cover" : "h-auto w-full"} />
            </span>
            <div>
              <p className="font-display text-lg font-extrabold tracking-tight">@{SITE.instagram.handle}</p>
              <p className="text-sm text-muted">{BRAND.instagram.displayName}</p>
            </div>
          </div>
          <h2 id="ig-title" className="section-title mt-7">
            {BRAND.copy.instagramTitle.plain}{" "}
            <span className="font-serif font-normal tracking-[-0.02em] italic">{BRAND.copy.instagramTitle.italic}</span>
          </h2>
          <p className="mt-4 max-w-[40ch] text-[16px] leading-relaxed text-ink/75">
            {BRAND.copy.instagramText}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="btn btn-dark h-14 px-6">
              <Instagram className="size-5" aria-hidden /> Seguir en Instagram
              <ArrowUpRight className="size-4 opacity-70" aria-hidden />
            </a>
            {SITE.linktree && (
              <a href={SITE.linktree} target="_blank" rel="noopener noreferrer" className="link-quiet">
                Todos nuestros enlaces <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            )}
          </div>
        </div>

        <a
          href={SITE.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto grid w-full max-w-[520px] grid-cols-2 gap-2.5 sm:gap-3 lg:mr-0"
          aria-label={`Ver el perfil @${SITE.instagram.handle} en Instagram`}
        >
          {TILES.map((t, i) => (
            <span
              key={i}
              className={`relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-vanilla ${t.className} ${i % 2 ? "translate-y-6" : ""}`}
            >
              <Image
                src={t.src}
                alt=""
                fill
                sizes="(min-width:640px) 260px, 46vw"
                className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
              />
            </span>
          ))}
        </a>
      </div>
    </section>
  );
}
