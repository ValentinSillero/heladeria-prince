"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { useScrollLock } from "@/lib/hooks";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "dark" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  tone = "dark",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const id = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  useScrollLock(open);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => cancelRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancelRef.current();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey, true);
      prev?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-end p-3 sm:place-items-center" role="presentation">
          <m.div
            className="absolute inset-0 bg-carbon/50 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <m.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            aria-describedby={description ? `${id}-d` : undefined}
            className="relative w-full max-w-[420px] rounded-[28px] bg-cream p-6 pb-[max(24px,env(safe-area-inset-bottom))] shadow-2xl sm:pb-6"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
          >
            <h2 id={`${id}-t`} className="font-display text-2xl leading-tight font-extrabold tracking-tight">
              {title}
            </h2>
            {description && (
              <div id={`${id}-d`} className="mt-2 text-[15px] leading-relaxed text-muted">
                {description}
              </div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button ref={cancelRef} type="button" className="btn btn-ghost" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`btn ${tone === "danger" ? "bg-[#c8401f] text-white hover:bg-[#ad3416]" : "btn-dark"}`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
