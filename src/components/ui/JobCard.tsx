'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Calendar, Building2, ExternalLink, ArrowRight, Clock } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { TKLCareer, CareerType } from '@/lib/schemas/career';
import { EASE_OUT_EXPO } from '@/lib/motion';

interface JobCardProps {
  job: TKLCareer;
  color?: string;
  entryDelay?: number;
  onViewDetails?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const TYPE_COLORS: Record<CareerType, string> = {
  exjobb: '#8B5CF6',
  jobb: '#3B82F6',
  praktik: '#10B981',
  trainee: '#F59E0B',
};

// Maps accent hex → WCAG-safe text CSS variable (light: darker shade, dark: same hex)
const ACCENT_TEXT: Record<string, string> = {
  '#8B5CF6': 'var(--text-purple)',
  '#3B82F6': 'var(--text-blue)',
  '#10B981': 'var(--text-green)',
  '#F59E0B': 'var(--text-orange)',
  '#6366F1': 'var(--text-purple)',
  '#0EA5E9': 'var(--text-blue)',
  '#06B6D4': 'var(--text-blue)',
};

export function JobCard({ job, color, entryDelay = 0, onViewDetails }: JobCardProps) {
  const { t, locale } = useLanguage();
  const opp = t.opportunities;
  const shouldReduceMotion = useReducedMotion();
  const cardColor = color ?? '#3B82F6';
  const cardTextColor = ACCENT_TEXT[cardColor] ?? cardColor;
  const badgeColor = TYPE_COLORS[job.type];

  const isEnglish = locale === 'en';
  const displayTitle = isEnglish && job.titleEn ? job.titleEn : job.title;
  const displayDesc = isEnglish && job.descriptionEn ? job.descriptionEn : job.description;
  const displayStart = isEnglish && job.startDateEn ? job.startDateEn : (job.startDate || opp.ongoing);

  const deadlineDate = job.deadline
    ? new Date(job.deadline).toLocaleDateString(isEnglish ? 'en-US' : 'sv-SE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : opp.ongoing;

  return (
    <motion.article
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22, delay: entryDelay, ease: EASE_OUT_EXPO }}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
      className="glass-card group relative overflow-hidden rounded-2xl flex flex-col"
      style={{ backgroundImage: `linear-gradient(135deg, ${cardColor}08 0%, transparent 50%)` }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${cardColor}28, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="pl-5 pr-5 pt-5 pb-5 flex gap-5 flex-1 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm font-medium hero-text-subtle">
              <Building2 className="w-4 h-4" style={{ color: cardColor }} aria-hidden="true" />
              {job.company}
            </div>
            {/* Temasäker badge: vit text på halvtransparent accent faller till
                ~1,9:1 i ljust tema — accentfärgad text på kortbakgrund i stället. */}
            <span
              className="text-[0.625rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{
                color: ACCENT_TEXT[badgeColor] ?? badgeColor,
                background: 'var(--about-card-bg)',
                border: `1px solid color-mix(in srgb, ${badgeColor} 35%, transparent)`,
                boxShadow: `0 0 12px ${badgeColor}40`,
              }}
            >
              {opp.filters[job.type]}
            </span>
          </div>

          <h3 className="hero-text font-semibold text-xl leading-snug mb-2 line-clamp-2">
            {displayTitle}
          </h3>

          <p className="hero-text-muted text-sm leading-relaxed line-clamp-2 mb-4">
            {displayDesc}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs hero-text-subtle mt-auto">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {opp.startLabel} <span className="hero-text-muted">{displayStart}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3 mt-1 relative z-10"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <span className="flex items-center gap-1.5 text-xs hero-text-subtle">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          {opp.deadlineLabel} <span className="hero-text-muted">{deadlineDate}</span>
        </span>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(e); }}
              aria-label={`${opp.visaMer}: ${displayTitle}`}
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 hover:gap-2.5 px-2.5 py-1 rounded-lg hover:brightness-110"
              style={{ color: cardTextColor, background: `${cardColor}12`, border: `1px solid ${cardColor}28` }}
            >
              {opp.visaMer}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold transition-opacity duration-200 hover:opacity-80"
              style={{ color: cardTextColor }}
              onClick={(e) => e.stopPropagation()}
              aria-label={`${opp.drawerApply}: ${displayTitle} (${opp.opensInNewTab})`}
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
