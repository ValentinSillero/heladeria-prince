import { Instagram } from "./icons";
import { groupHours, LOCALITIES, storeMapsUrl, telHref } from "@/config/branches";
import { SITE } from "@/config/site";
import { BRAND } from "@/config/brand";
import { getOrderChannel } from "@/lib/whatsapp";
import { Logo } from "./Logo";

const linkCls = "transition-colors hover:text-orange-soft";

export function Footer() {
  const locality = LOCALITIES[0];
  const store = locality?.stores[0];
  const channel = getOrderChannel(locality);
  const chatUrl = channel.kind === "direct" ? `https://wa.me/${channel.number}` : channel.kind === "chat" ? channel.url : null;
  const maps = store && locality ? storeMapsUrl(store, locality) : null;
  const hours = store?.hours ? groupHours(store.hours) : [];

  return (
    <footer className="relative bg-carbon pt-14 pb-10 text-cream">
      {/* filete con los colores de la marca */}
      <div aria-hidden className="absolute inset-x-0 top-0 flex h-1.5">
        <span className="flex-1 bg-orange" />
        <span className="flex-1 bg-orange-soft" />
        <span className="flex-1 bg-yellow" />
      </div>
      <div className="container-x">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Logo variant="light" className="h-16 w-auto" sizes="120px" />
            <p className="mt-4 max-w-[22ch] font-serif text-[22px] leading-snug text-cream/90">{SITE.tagline}.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-sm md:grid-cols-4 lg:gap-10">
            <div>
              <p className="eyebrow text-cream/50">Pedidos</p>
              <ul className="mt-3 grid gap-2">
                <li><a className={linkCls} href="#pedido">Armar pedido</a></li>
                <li><a className={linkCls} href="#pedido">Tamaños y precios</a></li>
                {chatUrl && (
                  <li>
                    <a className={linkCls} href={chatUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                  </li>
                )}
              </ul>
            </div>
            {store && (
              <div>
                <p className="eyebrow text-cream/50">Local</p>
                <ul className="mt-3 grid gap-2">
                  {store.address && (
                    <li>
                      {maps ? (
                        <a className={linkCls} href={maps} target="_blank" rel="noopener noreferrer">
                          {store.address}, {locality.name}
                        </a>
                      ) : (
                        <>{store.address}, {locality.name}</>
                      )}
                    </li>
                  )}
                  {store.phone && (
                    <li>
                      <a className={`${linkCls} tabular-nums`} href={telHref(store.phone)}>{store.phone}</a>
                    </li>
                  )}
                </ul>
              </div>
            )}
            {hours.length > 0 && (
              <div>
                <p className="eyebrow text-cream/50">Horarios</p>
                <ul className="mt-3 grid gap-2">
                  {hours.map((h) => (
                    <li key={h.days}>
                      <span className="block text-cream/60">{h.days}</span>
                      <span className="tabular-nums">{h.time ?? "Cerrado"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="eyebrow text-cream/50">Redes</p>
              <ul className="mt-3 grid gap-2">
                <li>
                  <a className={`inline-flex items-center gap-2 ${linkCls}`} href={SITE.instagram.url} target="_blank" rel="noopener noreferrer">
                    <Instagram className="size-4" aria-hidden /> @{SITE.instagram.handle}
                  </a>
                </li>
                {SITE.linktree && (
                  <li>
                    <a className={linkCls} href={SITE.linktree} target="_blank" rel="noopener noreferrer">Linktree</a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-cream/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name} · {SITE.region}</p>
          <p>{BRAND.copy.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
