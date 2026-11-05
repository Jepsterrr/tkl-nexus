'use client';

import { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { useHideNavbarWhileOpen } from '@/components/providers/NavbarStateProvider';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
  /** Primär åtgärd — ligger fast i sheetens botten (utanför scrollytan), alltid synlig */
  footer?: React.ReactNode;
  /**
   * Fokusmål vid stängning när triggern inte längre är synlig — t.ex. när sheeten
   * stängs av en resize till ≥lg och den lg:hidden-dolda filterknappen försvunnit.
   */
  fallbackFocus?: () => HTMLElement | null;
}

const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Mobil bottom-sheet (modal dialog). Döljs från lg och uppåt. */
/** Synlig och fokuserbar — display:none (lg:hidden) ger inga client rects */
const isFocusable = (el: HTMLElement | null): el is HTMLElement =>
  !!el && el.isConnected && el.getClientRects().length > 0;

export function BottomSheet({ open, onClose, title, closeLabel, children, footer, fallbackFocus }: BottomSheetProps) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const sheetRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Senaste onClose i en ref — effekten nedan ska bara köras när `open` ändras,
  // annars flyttas fokus till stängknappen vid varje omrendering (t.ex. vid skrivning i sökfältet).
  const onCloseRef = useRef(onClose);
  const fallbackFocusRef = useRef(fallbackFocus);
  useEffect(() => {
    onCloseRef.current = onClose;
    fallbackFocusRef.current = fallbackFocus;
  }, [onClose, fallbackFocus]);

  // Navbaren glider undan (samma mönster som CareerDrawer) — annars ligger den
  // odämpad och klickbar ovanför den modala sheeten. Den släpps i onExitComplete.
  const releaseNavbar = useHideNavbarWhileOpen(open);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      // Fokusfälla
      const el = sheetRef.current;
      if (e.key !== 'Tab' || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (isFocusable(previouslyFocused)) previouslyFocused.focus();
      else fallbackFocusRef.current?.()?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence onExitComplete={releaseNavbar}>
      {open && (
        <>
          <motion.div
            key="sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 lg:hidden"
            style={{ zIndex: 44, background: 'oklch(0.04 0.01 270 / 0.82)' }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.section
            key="sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="fixed inset-x-0 bottom-0 lg:hidden flex flex-col rounded-t-3xl max-h-[85svh]"
            style={{ zIndex: 45, background: 'var(--drawer-bg)', borderTop: '1px solid var(--drawer-border)' }}
          >
            {/* Greppindikator — ren visuell markör */}
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full" style={{ background: 'var(--glass-border-subtle)' }} aria-hidden="true" />
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <h2 id={titleId} className="font-heading font-bold hero-text text-base">{title}</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="flex items-center justify-center w-11 h-11 -mr-1.5 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue)"
                style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
              >
                <X className="w-4 h-4 hero-text-muted" aria-hidden="true" />
              </button>
            </div>
            <div
              className={`min-h-0 overflow-y-auto overscroll-contain px-5 ${
                footer ? 'pb-4' : 'pb-[max(1.5rem,env(safe-area-inset-bottom))]'
              }`}
            >
              {children}
            </div>
            {/* Fast footer — flex-syskon till scrollytan, så den syns oavsett scrollposition */}
            {footer && (
              <div
                className="shrink-0 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
                style={{ borderTop: '1px solid var(--drawer-border)', background: 'var(--drawer-bg)' }}
              >
                {footer}
              </div>
            )}
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
