"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string, initial = false) {
  const [match, setMatch] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

let locks = 0;
/** Bloquea el scroll del fondo mientras hay un panel abierto (admite paneles anidados). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks++;
    const html = document.documentElement;
    if (locks === 1) {
      const sbw = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      if (sbw > 0) html.style.paddingRight = `${sbw}px`;
    }
    return () => {
      locks--;
      if (locks === 0) {
        html.style.overflow = "";
        html.style.paddingRight = "";
      }
    };
  }, [active]);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}
