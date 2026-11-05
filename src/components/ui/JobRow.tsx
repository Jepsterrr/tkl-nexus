'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Clock, Calendar, Building2, Landmark, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { TKLCareer } from '@/lib/schemas/career';
import { TYPE_COLORS, TYPE_TEXT } from '@/lib/careerTypes';
import { orgOf } from '@/lib/careerFilters';
import { EASE_OUT_EXPO } from '@/lib/motion';

interface JobRowProps {
  job: TKLCareer;
  entryDelay?: number;
  onViewDetails: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** React 19: ref som prop — AnimatePresence mode="popLayout" behöver mäta raden vid exit */
  ref?: React.Ref<HTMLLIElement>;
}

/**
 * Rubriken är en riktig <h3> med en "utsträckt"
 * <button> (after:inset-0) - hela raden är klickbar, rubriknavigering för
 * skärmläsare bevaras och HTML:en förblir giltig (inga rubriker inuti <button>).
 */
export function JobRow({ job, entryDelay = 0, onViewDetails, ref }: JobRowProps) {
  const { t, locale } = useLanguage();
  const opp = t.opportunities;
  const reduce = useReducedMotion();
  const color = TYPE_COLORS[job.type];
  const isEn = locale === 'en';
  const title = isEn && job.titleEn ? job.titleEn : job.title;
  const start = (isEn && job.startDateEn ? job.startDateEn : job.startDate) || opp.ongoing;
  const deadline = new Date(job.deadline).toLocaleDateString(isEn ? 'en-US' : 'sv-SE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const isPublic = orgOf(job) === 'public';
  const OrgIcon = isPublic ? Landmark : Building2;

  return (
    <motion.li
      ref={ref}
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: entryDelay, ease: EASE_OUT_EXPO }}
      className="group relative list-none rounded-xl px-4 py-3.5 sm:px-5 grid gap-x-6 gap-y-2 items-center md:grid-cols-[minmax(0,1fr)_auto] border bg-(--about-card-bg) border-(--about-card-border) transition-[border-color,background-color] duration-200 hover:border-[color-mix(in_srgb,var(--row-accent)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--row-accent)_6%,var(--about-card-bg))] has-focus-visible:ring-2 has-focus-visible:ring-(--text-blue)"
      style={{ '--row-accent': color } as React.CSSProperties}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
          <span className="flex items-center gap-1.5 text-sm font-medium hero-text-subtle min-w-0">
            <OrgIcon className="w-4 h-4 shrink-0" style={{ color }} aria-hidden="true" />
            <span className="truncate">{job.company}</span>
          </span>
          {/* Temasäker badge: accenttext på kortbakgrund, aldrig vit på transparent accent */}
          <span
            className="text-[0.625rem] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full whitespace-nowrap"
            style={{
              color: TYPE_TEXT[job.type],
              background: 'var(--about-card-bg)',
              border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
            }}
          >
            {opp.filters[job.type]}
          </span>
        </div>
        {/* Brödtextfonten i täta rader — Unbounded i 18px blir för bred och tung för en skannbar lista */}
        <h3
          className="hero-text font-semibold text-base sm:text-[1.0625rem] leading-snug"
          style={{ fontFamily: 'var(--font-body), system-ui, sans-serif', letterSpacing: '-0.01em' }}
        >
          <button
            type="button"
            onClick={onViewDetails}
            aria-label={`${opp.visaMer}: ${title} — ${job.company}`}
            className="text-left cursor-pointer outline-none after:absolute after:inset-0 after:rounded-xl after:content-['']"
          >
            {/* Knappen är atomär (inline-block) — klippningen måste ligga på ett inre element */}
            <span className="line-clamp-2">{title}</span>
          </button>
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs hero-text-subtle">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {opp.drawerTime}: <span className="hero-text-muted">{start}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 text-xs hero-text-subtle">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {opp.deadlineLabel} <span className="hero-text-muted tabular-nums">{deadline}</span>
        </span>
        <ChevronRight
          className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
          style={{ color: TYPE_TEXT[job.type] }}
          aria-hidden="true"
        />
      </div>
    </motion.li>
  );
}