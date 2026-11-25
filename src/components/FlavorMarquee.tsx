import { availableFlavors } from "@/config/flavors";

/** Cinta de sabores en movimiento (CSS puro, sin JavaScript). */
export function FlavorMarquee() {
  const names = availableFlavors().map((f) => f.name);
  const row = (
    <ul className="flex shrink-0 items-center" aria-hidden>
      {names.map((n) => (
        <li key={n} className="flex items-center whitespace-nowrap">
          <span className="px-4 font-serif text-[20px] text-white sm:text-[24px]">{n}</span>
          <span className="text-yellow">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative overflow-hidden bg-orange py-3.5 shadow-[inset_0_-4px_0_var(--color-orange-soft)]">
      <p className="sr-only">Algunos de nuestros sabores: {names.join(", ")}.</p>
      <div className="flex w-max animate-[marquee_70s_linear_infinite] hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}
