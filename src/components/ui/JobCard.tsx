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
}

const TYPE_COLORS: Record<CareerType, string> = {
  exjobb:  '#8B5CF6', // lila — akademisk tyngd
  jobb:    '#3B82F6', // blå  — professionellt
  praktik: '#10B981', // grön — tillväxt och lärande
  trainee: '#F59E0B', // orange — nystart, energi
};

export function JobCard({ job, color, entryDelay = 0 }: JobCardProps) {
  const { t, locale } = useLanguage();
  const opp = t.opportunities;
  const shouldReduceMotion = useReducedMotion();
  const cardColor = color ?? '#3B82F6';
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

  const hasApplyUrl = !!job.applyUrl;

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: entryDelay, ease: EASE_OUT_EXPO }}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
      className="glass-card group relative overflow-hidden rounded-2xl flex flex-col"
      style={{ backgroundImage: `linear-gradient(135deg, ${cardColor}08 0%, transparent 50%)` }}
    >
      {/* Accessible overlay link — sole interactive element for the card */}
      {hasApplyUrl && (
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{ '--tw-ring-color': cardColor } as React.CSSProperties}
          aria-label={`${displayTitle} — ${job.company}`}
        />
      )}

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${cardColor}28, transparent 70%)`, zIndex: 1 }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="pl-5 pr-5 pt-5 pb-5 flex gap-5 flex-1 relative pointer-events-none" style={{ zIndex: 20 }}>
        <div className="flex-1 min-w-0">

          {/* Header row: Company & Type Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm font-medium hero-text-subtle">
              <Building2 className="w-4 h-4" style={{ color: cardColor }} aria-hidden="true" />
              {job.company}
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{
                color: '#fff',
                background: `linear-gradient(135deg, ${badgeColor}cc, ${badgeColor}88)`,
                boxShadow: `0 0 12px ${badgeColor}40`,
              }}
            >
              {job.type}
            </span>
          </div>

          <h3 className="hero-text font-semibold text-xl leading-snug mb-2 line-clamp-2 group-hover:text-white transition-colors">
            {displayTitle}
          </h3>

          <p className="hero-text-muted text-sm leading-relaxed line-clamp-2 mb-4">
            {displayDesc}
          </p>

          {/* Meta data row */}
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
        className="flex items-center justify-between px-5 py-3 mt-1 relative pointer-events-none"
        style={{ borderTop: '1px solid var(--border)', zIndex: 20 }}
      >
        <span className="flex items-center gap-1.5 text-xs hero-text-subtle">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          {opp.deadlineLabel} <span className="hero-text-muted">{deadlineDate}</span>
        </span>

        <span
          className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:gap-2"
          style={{ color: cardColor }}
          aria-hidden="true"
        >
          {hasApplyUrl ? opp.applyNow : opp.readMore}
          {hasApplyUrl
            ? <ExternalLink className="w-3.5 h-3.5" />
            : <ArrowRight className="w-3.5 h-3.5" />
          }
        </span>
      </div>
    </motion.article>
  );
}
