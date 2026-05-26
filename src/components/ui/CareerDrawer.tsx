'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, MapPin, Calendar, Building2, Clock, ExternalLink } from 'lucide-react';
import posthog from 'posthog-js';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { TKLCareer, CareerType } from '@/lib/schemas/career';
import { EASE_OUT_EXPO } from '@/lib/motion';

const TYPE_COLORS: Record<CareerType, string> = {
  exjobb:  '#8B5CF6',
  jobb:    '#3B82F6',
  praktik: '#10B981',
  trainee: '#F59E0B',
};

interface CareerDrawerProps {
  job: TKLCareer | null;
  onClose: () => void;
}

export function CareerDrawer({ job, onClose }: CareerDrawerProps) {
  const { t, locale } = useLanguage();
  const opp = t.opportunities;
  const shouldReduceMotion = useReducedMotion();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isOpen = job !== null;
  const isEnglish = locale === 'en';
  const color = job ? TYPE_COLORS[job.type] : '#3B82F6';
  const displayTitle = job ? (isEnglish && job.titleEn ? job.titleEn : job.title) : '';
  const displayDesc = job
    ? (isEnglish && job.descriptionEn ? job.descriptionEn : job.description) ?? ''
    : '';
  const displayStart = job
    ? (isEnglish && job.startDateEn ? job.startDateEn : job.startDate) ?? opp.ongoing
    : '';
  const localeStr = isEnglish ? 'en-US' : 'sv-SE';
  const deadlineLabel = job
    ? new Date(job.deadline).toLocaleDateString(localeStr, { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

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
  }, [isOpen, job?.id]);

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
            key="career-overlay"
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
            key="career-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={opp.drawerAriaLabel}
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
              style={{ minHeight: 148, padding: '20px 24px', paddingTop: 'calc(var(--navbar-bottom, 80px) + 44px)' }}
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
                  backgroundSize: '28px 28px',
                }}
                aria-hidden="true"
              />

              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-opacity duration-200 hover:opacity-80"
                style={{ top: 'calc(var(--navbar-bottom, 80px) + 28px)', background: 'var(--drawer-bg)', border: '1px solid var(--drawer-border)' }}
                aria-label={opp.drawerClose}
              >
                <X className="w-4 h-4 hero-text-muted" />
              </button>

              <div className="relative z-10 flex items-center gap-2 mb-2.5">
                <span
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ color: '#fff', background: `${color}cc`, boxShadow: `0 0 12px ${color}40` }}
                >
                  {opp.filters[job!.type]}
                </span>
                <span className="text-xs hero-text-muted flex items-center gap-1">
                  <Building2 className="w-3 h-3" aria-hidden="true" />
                  {job!.company}
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
                  {job!.location}
                </span>
                {displayStart && (
                  <span
                    className="flex items-center gap-1.5 text-xs hero-text-muted px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
                  >
                    <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                    {opp.startLabel} {displayStart}
                  </span>
                )}
                <span
                  className="flex items-center gap-1.5 text-xs hero-text-muted px-3 py-1.5 rounded-full"
                  style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
                >
                  <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
                  {opp.drawerDeadline}: {deadlineLabel}
                </span>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-widest hero-text-subtle mb-3 font-heading">
                {opp.drawerAbout}
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
              <span className="text-xs hero-text-subtle">
                {opp.deadlineLabel} {deadlineLabel}
              </span>
              {job!.applyUrl && (
                <a
                  href={job!.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-opacity duration-200 hover:opacity-80"
                  style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
                  onClick={() =>
                    posthog.capture('career_apply_clicked', {
                      job_id: job!.id,
                      company: job!.company,
                      job_type: job!.type,
                      title: job!.title,
                    })
                  }
                >
                  {opp.drawerApply}
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
