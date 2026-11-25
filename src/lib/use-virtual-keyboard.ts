"use client";

import { useEffect, useState } from "react";

const TEXT_INPUTS = new Set(["", "text", "search", "email", "tel", "url", "password", "number", "date", "datetime-local", "month", "time", "week"]);

/** ¿Este elemento abre el teclado virtual al recibir foco? (radios, botones y campos de solo lectura no) */
export function isTextEntry(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) return TEXT_INPUTS.has(el.type) && !el.readOnly && !el.disabled;
  return false;
}

export interface VirtualKeyboard {
  /** Hay un campo de texto activo y el teclado en pantalla está visible. */
  open: boolean;
  /** Lo que tapa el teclado debajo del área visible, medido desde el borde inferior de la ventana (iOS). */
  inset: number;
  /** Desplazamiento del área visible respecto de la ventana (iOS la corre al enfocar). */
  offsetTop: number;
  /** Alto del área visible, en px CSS. */
  visibleHeight: number;
}

const CLOSED: VirtualKeyboard = { open: false, inset: 0, offsetTop: 0, visibleHeight: 0 };
/** Más que lo que cambian las barras del navegador, menos que cualquier teclado (incluso apaisado). */
const MIN_KEYBOARD = 120;
/** Tiempo que tarda el teclado en aparecer: mientras tanto se lo da por abierto en pantallas táctiles. */
const FOCUS_GRACE = 700;

/**
 * Detecta el teclado virtual combinando tres señales, porque ninguna alcanza sola:
 * - foco: solo puede haber teclado si hay un campo de texto activo;
 * - visualViewport: el teclado achica el área visible (iOS y Android). Se compara contra el alto
 *   sin teclado medido para el ancho actual, así un cambio de orientación no da falsos positivos;
 * - puntero táctil: si el navegador (p. ej. algunos navegadores internos de apps) no informa el
 *   teclado en visualViewport, en pantallas táctiles se asume teclado mientras se escribe.
 * Si el visualViewport ya demostró ser confiable en este dispositivo, también detecta cuando el
 * usuario baja el teclado sin salir del campo (botón "atrás" en Android).
 */
export function useVirtualKeyboard(enabled: boolean): VirtualKeyboard {
  const [state, setState] = useState<VirtualKeyboard>(CLOSED);

  useEffect(() => {
    if (!enabled) {
      setState(CLOSED);
      return;
    }
    const vv = window.visualViewport;
    const coarse = window.matchMedia("(pointer: coarse)");
    const baseline = new Map<number, number>(); // ancho → alto visible sin teclado
    let reliable = false;
    let focusAt = 0;
    let raf = 0;
    const timers = new Set<number>();

    const measure = () => {
      raf = 0;
      const scale = vv?.scale ?? 1;
      // alto y ancho normalizados por el zoom con pellizco
      const h = vv ? vv.height * scale : window.innerHeight;
      const width = Math.round(vv ? vv.width * scale : window.innerWidth);
      const editing = isTextEntry(document.activeElement);
      const known = baseline.get(width);
      if (!editing || (known !== undefined && h > known)) baseline.set(width, h);
      const ref = baseline.get(width);
      const shrink = ref === undefined ? 0 : ref - h;
      if (editing && shrink > MIN_KEYBOARD) reliable = true;
      const settling = performance.now() - focusAt < FOCUS_GRACE;
      const open = editing && (shrink > MIN_KEYBOARD || (coarse.matches && (!reliable || settling || ref === undefined)));

      const unzoomed = Math.abs(scale - 1) < 0.01;
      const visibleHeight = Math.round(vv ? vv.height : window.innerHeight);
      const offsetTop = open && vv && unzoomed ? Math.max(0, Math.round(vv.offsetTop)) : 0;
      const inset = open && vv && unzoomed ? Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height))) : 0;

      setState((prev) =>
        prev.open === open && prev.inset === inset && prev.offsetTop === offsetTop && prev.visibleHeight === visibleHeight
          ? prev
          : { open, inset, offsetTop, visibleHeight },
      );
    };

    // agrupa ráfagas de eventos en una sola medición (sin requestAnimationFrame: algunos
    // navegadores internos de apps lo pausan y la barra quedaría desincronizada)
    const schedule = () => {
      if (!raf) raf = window.setTimeout(measure, 16);
    };
    const later = (ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        schedule();
      }, ms);
      timers.add(id);
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!isTextEntry(e.target as Element)) return schedule();
      focusAt = performance.now();
      schedule();
      // algunos navegadores informan el tamaño final recién al terminar la animación del teclado
      later(320);
      later(FOCUS_GRACE + 60);
    };
    // al pasar de un campo a otro hay un instante sin foco: se mide después para no parpadear
    const onFocusOut = () => {
      later(120);
      later(450);
    };

    measure();
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      clearTimeout(raf);
      timers.forEach((id) => clearTimeout(id));
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      setState(CLOSED);
    };
  }, [enabled]);

  return state;
}
