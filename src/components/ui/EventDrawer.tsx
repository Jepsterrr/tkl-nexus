'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, MapPin, CalendarDays, Tag, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useNavbarState } from '@/components/providers/NavbarStateProvider';
import type { TKLEvent, Section } from '@/lib/schemas/event';
import { EASE_OUT_EXPO } from '@/lib/motion';

type ExtendedEvent = TKLEvent & { externalUrl?: string };

const SECTION_COLORS: Record<Section, string> = {
  data: '#f7cf3b',
  geo: '#858585',
  i: '#172191',
  maskin: '#5c0d0d',
  general: '#8B5CF6',
};

// Temasäker text — rå sektionshex (marinblå/mörkröd) är ~1,3:1 på mörk bg.
// Samma helper som i EventsContent; rå hex enbart för bg/border/glow.
const sectionText = (color: string) =>
  `color-mix(in srgb, ${color} 45%, var(--hero-text))`;

const SECTION_LOGOS: Record<Section, string | null> = {
  data: '/Logo/Data.png',
  geo: '/Logo/Geo.png',
  i: '/Logo/I.png',
  maskin: '/Logo/Maskin.png',
  general: null,
};

interface EventDrawerProps {
  event: ExtendedEvent | null;
  onClose: () => void;
}

export function EventDrawer({ event, onClose }: EventDrawerProps) {
  const { t, locale } = useLanguage();
  const ev = t.events;
  const shouldReduceMotion = useReducedMotion();
  const { setDrawerOpen } = useNavbarState();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isOpen = event !== null;
  const isEnglish = locale === 'en';
  const color = event ? SECTION_COLORS[event.section] : '#8B5CF6';
  const logo = event ? SECTION_LOGOS[event.section] : null;
  const displayTitle = event
    ? isEnglish && event.titleEn ? event.titleEn : event.title
    : '';
  const displayDesc = event
    ? isEnglish && event.descriptionEn ? event.descriptionEn : event.description
    : '';

  const startDate = event ? new Date(event.date) : null;
  const endDate = event ? new Date(event.endDate) : null;
  const localeStr = isEnglish ? 'en-US' : 'sv-SE';
  const dateLabel = startDate
    ? startDate.toLocaleDateString(localeStr, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const timeRange =
    startDate && endDate
      ? `${startDate.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })}`
      : '';
  const shortDate = startDate
    ? startDate.toLocaleDateString(localeStr, { weekday: 'short', day: 'numeric', month: 'short' })
    : '';

  // Escape-tangent
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Sätt fokus på stäng-knapp när drawer öppnas
  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen, event?.id]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;
    const el = drawerRef.current;
    const focusable = () =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'button:not([disabled]),[href],input,[tabindex]:not([tabindex="-1"])',
        ),
      );
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !el.contains(document.activeElement)) return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  useEffect(() => {
    setDrawerOpen(isOpen);
    return () => {
      if (isOpen) setDrawerOpen(false);
    };
  }, [isOpen, setDrawerOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="event-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0"
            style={{ zIndex: 44, background: 'oklch(0.04 0.01 270 / 0.82)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="event-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={ev.drawerAriaLabel}
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
                style={{ background: `linear-gradient(135deg, ${color}28 0%, ${color}0a 60%, transparent 100%)` }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 light:opacity-20"
                style={{
                  backgroundImage: `linear-gradient(${color}0c 1px, transparent 1px), linear-gradient(90deg, ${color}0c 1px, transparent 1px)`,
                  backgroundSize: '32px 32px',
                }}
                aria-hidden="true"
              />

              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-opacity duration-200 hover:opacity-80"
                style={{ top: '20px', background: 'var(--drawer-bg)', border: '1px solid var(--drawer-border)' }}
                aria-label={ev.drawerClose}
              >
                <X className="w-4 h-4 hero-text-muted" />
              </button>

              <div className="relative z-10 flex items-center gap-2 mb-2.5">
                {logo && <img src={logo} alt="" className="w-4 h-4 object-contain" aria-hidden="true" loading="lazy" decoding="async" />}
                <span
                  className="text-[0.625rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ color: sectionText(color), background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  {ev.sections[event!.section]}
                </span>
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
              <div
                className="flex flex-wrap gap-2 mb-5 pb-5"
                style={{ borderBottom: '1px solid var(--about-card-border)' }}
              >
                <span
                  className="flex items-center gap-1.5 text-xs hero-text-muted px-3 py-1.5 rounded-full"
                  style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
                >
                  <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                  {event!.location}
                </span>
                <span
                  className="flex items-center gap-1.5 text-xs hero-text-muted px-3 py-1.5 rounded-full"
                  style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
                >
                  <CalendarDays className="w-3 h-3 shrink-0" aria-hidden="true" />
                  {dateLabel}{timeRange ? `, ${timeRange}` : ''}
                </span>
                {event!.tags.length > 0 && (
                  <span
                    className="flex items-center gap-1.5 text-xs hero-text-muted px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
                  >
                    <Tag className="w-3 h-3 shrink-0" aria-hidden="true" />
                    {event!.tags.join(', ')}
                  </span>
                )}
              </div>

              <p className="text-[0.625rem] font-bold uppercase tracking-widest hero-text-subtle mb-3 font-heading">
                {ev.drawerAbout}
              </p>
              <p className="text-sm leading-relaxed hero-text-muted" style={{ maxWidth: '65ch' }}>
                {displayDesc}
              </p>
            </div>

            {/* Footer */}
            <div
              className="shrink-0 flex items-center justify-between gap-3 px-6 py-4"
              style={{ borderTop: '1px solid var(--drawer-border)', background: 'var(--drawer-bg)' }}
            >
              <span className="text-xs hero-text-subtle">{shortDate}</span>
              {event!.externalUrl && (
                <a
                  href={event!.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-opacity duration-200 hover:opacity-80"
                  style={{ color: sectionText(color), background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  {ev.readOnLudd}
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
