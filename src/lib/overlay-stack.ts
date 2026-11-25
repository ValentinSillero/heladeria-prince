/**
 * Paneles abiertos en orden (carrito, selector, etc.).
 * Solo el de arriba responde a Escape y a la trampa de foco con Tab.
 */
export const overlayStack: object[] = [];

export function pushOverlay(token: object) {
  overlayStack.push(token);
  return () => {
    const i = overlayStack.indexOf(token);
    if (i >= 0) overlayStack.splice(i, 1);
  };
}

export function isTopOverlay(token: object) {
  return overlayStack[overlayStack.length - 1] === token;
}

/** Mantiene el foco dentro del panel al usar Tab. */
export function trapTab(e: KeyboardEvent, panel: HTMLElement | null) {
  if (e.key !== "Tab" || !panel) return;
  const els = panel.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
  );
  if (!els.length) return;
  const first = els[0];
  const last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
