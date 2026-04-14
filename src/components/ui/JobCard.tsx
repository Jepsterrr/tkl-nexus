'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Calendar, Building2, ExternalLink, ArrowRight, Clock } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { TKLOpportunity, OpportunityType } from '@/lib/schemas/opportunity';

interface JobCardProps {
  job: TKLOpportunity;
  idx?: number;
  color?: string;
}

const TYPE_COLORS: Record<OpportunityType, string> = {
  exjobb: '#8B5CF6',
  jobb: '#3B82F6',
  praktik: '#10B981',
  trainee: '#F59E0B',
};

export function JobCard({ job, idx = 0, color }: JobCardProps) {
  const { t, nav } = useLanguage() as any;
  const shouldReduceMotion = useReducedMotion();
  const cardColor = color ?? '#3B82F6';
  const badgeColor = TYPE_COLORS[job.type];

  // Fallback-logik för översatta fält
  const isEnglish = nav?.langEn === 'English (active)' || t.nav?.langEn === 'English (active)';
  const displayTitle = isEnglish && job.titleEn ? job.titleEn : job.title;
  const displayDesc = isEnglish && job.descriptionEn ? job.descriptionEn : job.description;
  const displayStart = isEnglish && job.startDateEn ? job.startDateEn : (job.startDate || '-');

  // Formatera deadline
  const deadlineDate = job.deadline ? new Date(job.deadline).toLocaleDateString(isEnglish ? 'en-US' : 'sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : (isEnglish ? 'Ongoing' : 'Löpande');

  const hasApplyUrl = !!job.applyUrl;

  const handleCardClick = () => {
    if (hasApplyUrl && job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && hasApplyUrl) {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <motion.article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={hasApplyUrl ? 0 : undefined}
      role={hasApplyUrl ? 'link' : undefined}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
      layout
      className={`group relative overflow-hidden rounded-2xl flex flex-col ${hasApplyUrl ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent' : ''}`}
      style={{
        background: 'var(--about-card-bg)',
        backgroundImage: `linear-gradient(135deg, ${cardColor}08 0%, transparent 50%)`,
        border: `1px solid var(--about-card-border)`,
        backdropFilter: 'blur(12px)',
        '--tw-ring-color': cardColor,
      } as React.CSSProperties}
      aria-label={displayTitle}
    >
      {/* Accent Edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl z-10 pointer-events-none"
        style={{ background: cardColor }}
        aria-hidden="true"
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl z-10"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${cardColor}28, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="pl-5 pr-5 pt-5 pb-5 flex gap-5 flex-1 relative z-20">
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
              {isEnglish ? 'Start:' : 'Start:'} <span className="text-gray-300">{displayStart}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3 mt-1 relative z-30"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="flex items-center gap-1.5 text-xs hero-text-subtle pointer-events-none">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          {isEnglish ? 'Deadline:' : 'Sista dag:'} <span className="text-gray-300">{deadlineDate}</span>
        </span>
        
        {hasApplyUrl ? (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:gap-2 hover:opacity-80"
            style={{ color: cardColor }}
          >
            {isEnglish ? 'Apply Now' : 'Ansök nu'}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span
            className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:gap-2 pointer-events-none"
            style={{ color: cardColor }}
            aria-hidden="true"
          >
            {isEnglish ? 'Read more' : 'Läs mer'}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </motion.article>
  );
}