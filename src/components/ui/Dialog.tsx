"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef } from "react";
import { useMediaQuery, useScrollLock } from "@/lib/hooks";
import { isTopOverlay, pushOverlay, trapTab } from "@/lib/overlay-stack";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Nombre accesible del diálogo */
  label: string;
  header: React.ReactNode;
  /** Zona fija bajo el encabezado (buscador, filtros) */
  toolbar?: React.ReactNode;
  /** Barra inferior fija */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Diálogo de tarea: en celular ocupa toda la pantalla (respeta áreas seguras),
 * en escritorio es un modal centrado con altura fija adaptada a la ventana.
 * Encabezado, toolbar y barra inferior quedan fijos; solo el contenido se desplaza
 * (un único scroll, sin scrolls anidados).
 */
export function Dialog({ open, onClose, label, header, toolbar, footer, children }: DialogProps) {
  const desktop = useMediaQuery("(min-width: 768px)");
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const token = {};
    const release = pushOverlay(token);
    returnFocus.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 30);
    const onKey = (e: KeyboardEvent) => {
      if (!isTopOverlay(token)) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
      trapTab(e, panelRef.current);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      release();
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const motionProps = desktop
    ? { initial: { opacity: 0, scale: 0.97, y: 14 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.98, y: 8 } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] md:grid md:place-items-center md:p-6" role="presentation">
          <m.div
            className="absolute inset-0 bg-carbon/50 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            {...motionProps}
            transition={desktop ? { duration: 0.28, ease: [0.22, 1, 0.36, 1] } : { type: "spring", stiffness: 380, damping: 40 }}
            className="absolute inset-0 flex flex-col overflow-hidden bg-cream outline-none md:relative md:inset-auto md:h-[min(860px,calc(100dvh-48px))] md:w-[min(980px,100%)] md:rounded-[28px] md:shadow-[0_40px_100px_-30px_rgb(28_25_23/0.6)]"
          >
            <div className="shrink-0 px-4 pt-[max(14px,env(safe-area-inset-top))] sm:px-6 md:pt-6">{header}</div>
            {toolbar && <div className="shrink-0 border-b border-hairline px-4 pt-3 pb-3 sm:px-6">{toolbar}</div>}
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">{children}</div>
            {footer && (
              <div className="shrink-0 border-t border-hairline bg-cream px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-12px_24px_-20px_rgb(74_42_29/0.35)] sm:px-6 md:pb-4">
                {footer}
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
