'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useNavbarState } from '@/components/providers/NavbarStateProvider';
import type { TKLDeal } from '@/lib/schemas/deal';
import { EASE_OUT_EXPO } from '@/lib/motion';

const ORANGE = '#F59E0B';

interface DealDrawerProps {
  deal: TKLDeal | null;
  onClose: () => void;
}

export function DealDrawer({ deal, onClose }: DealDrawerProps) {
  const { t, locale } = useLanguage();
  const deals = t.deals;
  const shouldReduceMotion = useReducedMotion();
  const { setDrawerOpen } = useNavbarState();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  const isOpen = deal !== null;
  const isEnglish = locale === 'en';
  const displayTitle = deal ? (isEnglish && deal.titleEn ? deal.titleEn : deal.title) : '';
  const displayDesc = deal
    ? (isEnglish && deal.descriptionEn ? deal.descriptionEn : deal.description)
    : '';

  const handleCopy = () => {
    if (!deal?.discountCode) return;
    navigator.clipboard.writeText(deal.discountCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* tyst fail */ });
  };

  // Reset copied state on deal change (via callback to satisfy lint rule)
  useEffect(() => {
    const t = setTimeout(() => setCopied(false), 0);
    return () => clearTimeout(t);
  }, [deal?.id]);

  useEffect(() => {
    setDrawerOpen(isOpen);
    return () => {
      if (isOpen) setDrawerOpen(false);
    };
  }, [isOpen, setDrawerOpen]);

  // Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Fokus
  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen, deal?.id]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;
    const el = drawerRef.current;
    const focusable = () =>
      Array.from(el.querySelectorAll<HTMLElement>(
        'button:not([disabled]),[href],input,[tabindex]:not([tabindex="-1"])',
      ));
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !el.contains(document.activeElement)) return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="deal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0"
            style={{ zIndex: 44, background: 'oklch(0.04 0.01 270 / 0.82)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            key="deal-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={deals.drawerAriaLabel}
            initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="fixed right-0 inset-y-0 flex flex-col overflow-hidden w-full md:w-[clamp(340px,38vw,560px)]"
            style={{
              zIndex: 45,
              background: 'var(--drawer-bg)',
              borderLeft: '1px solid var(--drawer-border)',
            }}
          >
            {/* Hero */}
            <div
              className="relative shrink-0 flex flex-col justify-end overflow-hidden"
              style={{ minHeight: 148, padding: '20px 24px', paddingTop: '24px' }}
            >
              <div
                className="absolute inset-0 light:opacity-40"
                style={{ background: `linear-gradient(135deg, ${ORANGE}22 0%, ${ORANGE}08 60%, transparent 100%)` }}
                aria-hidden="true"
              />
              {/* Diagonal hatch — samma som Deals-hero */}
              <div
                className="absolute inset-0 light:opacity-20"
                style={{
                  backgroundImage: 'repeating-linear-gradient(135deg, rgba(245,158,11,0.06) 0px, rgba(245,158,11,0.06) 1px, transparent 1px, transparent 24px)',
                }}
                aria-hidden="true"
              />

              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-opacity duration-200 hover:opacity-80"
                style={{ top: '20px', background: 'var(--drawer-bg)', border: '1px solid var(--drawer-border)' }}
                aria-label={deals.drawerClose}
              >
                <X className="w-4 h-4 hero-text-muted" />
              </button>

              {/* Logotyp + företagsnamn */}
              <div className="relative z-10 flex items-center gap-3 mb-3">
                {deal!.logoUrl ? (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center p-1.5 shrink-0"
                    style={{ background: `${ORANGE}15`, border: `1px solid ${ORANGE}30` }}
                  >
                    <img src={deal!.logoUrl} alt="" className="w-full h-full object-contain rounded" />
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${ORANGE}15`, border: `1px solid ${ORANGE}30` }}
                  >
                    <span className="text-lg font-black" style={{ color: ORANGE }}>
                      {deal!.company.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-xs hero-text-subtle">{deal!.company}</p>
                  {deal!.discount && (
                    <span className="text-sm font-bold" style={{ color: ORANGE }}>
                      {deal!.discount}
                    </span>
                  )}
                </div>
              </div>

              <h2
                className="relative z-10 font-heading font-extrabold leading-tight hero-text"
                style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', letterSpacing: '-0.03em' }}
              >
                {displayTitle}
              </h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-widest hero-text-subtle mb-3 font-heading">
                {deals.drawerAbout}
              </p>
              <p className="text-sm leading-relaxed hero-text-muted mb-6" style={{ maxWidth: '65ch' }}>
                {displayDesc}
              </p>

              {/* Rabattkod */}
              {deal!.discountCode && (
                <div
                  className="rounded-xl p-4"
                  style={{ background: `${ORANGE}10`, border: `1px solid ${ORANGE}25` }}
                >
                  <p className="text-xs hero-text-subtle mb-2 font-heading font-bold uppercase tracking-widest">
                    {deals.drawerCopyCode}
                  </p>
                  <button
                    onClick={handleCopy}
                    disabled={copied}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-default"
                    style={{
                      background: `${ORANGE}18`,
                      border: `1px solid ${ORANGE}40`,
                      color: ORANGE,
                    }}
                    aria-label={`${deals.drawerCopyCode}: ${deal!.discountCode}`}
                  >
                    <span className="text-base font-bold tracking-widest font-heading">
                      {deal!.discountCode}
                    </span>
                    {copied ? (
                      <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-xs mt-2 text-center"
                    style={{ color: ORANGE, minHeight: '1em' }}
                  >
                    {copied ? deals.drawerCopied : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="shrink-0 flex items-center justify-end gap-3 px-6 py-4"
              style={{ borderTop: '1px solid var(--drawer-border)', background: 'var(--drawer-bg)' }}
            >
              {deal!.link && (
                <a
                  href={deal!.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-opacity duration-200 hover:opacity-80"
                  style={{ color: ORANGE, background: `${ORANGE}15`, border: `1px solid ${ORANGE}30` }}
                >
                  {deals.drawerVisit}
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
