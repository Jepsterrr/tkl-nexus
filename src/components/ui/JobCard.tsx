'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, MapPin, Clock, Bookmark } from 'lucide-react';
import type { JobCardProps } from '@/lib/types';
import { ACCENT_COLOR_MAP } from '@/lib/types';

export function JobCard({
  title,
  company,
  location,
  type,
  deadline,
  category,
}: JobCardProps) {
  const accentKey = category === 'corporate' ? 'purple' : 'green';
  const colors = ACCENT_COLOR_MAP[accentKey];

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-transparent"
      style={{
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ background: `linear-gradient(135deg, ${colors.hex} 0%, transparent 60%)` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/4 backdrop-blur-sm" aria-hidden="true" />

      {/* Content */}
      <div className="relative p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
                {category === 'corporate' ? 'Företag' : 'Student'}
              </span>
            </div>
            <h3 className="text-white font-semibold text-base sm:text-lg leading-snug group-hover:text-white/90 transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-white/60 text-sm font-medium mt-0.5">{company}</p>
          </div>

          <div
            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
            aria-hidden="true"
          >
            <Briefcase className="w-5 h-5" style={{ color: colors.hex }} />
          </div>
        </div>

        {/* Meta */}
        <dl className="space-y-1.5">
          <div className="flex items-center gap-2 text-white/55 text-sm">
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Plats</dt>
            <dd>{location}</dd>
          </div>
          <div className="flex items-center gap-4 text-white/55 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Typ</dt>
              <dd>{type}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/30" aria-hidden="true" />
              <dt className="sr-only">Deadline</dt>
              <dd>Deadline: {deadline}</dd>
            </div>
          </div>
        </dl>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 group-hover:gap-3 active:scale-95"
            style={{
              background: colors.gradient,
              boxShadow: `0 4px 14px ${colors.glow}`,
            }}
            aria-label={`Läs mer om ${title}`}
          >
            Läs mer
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>

          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label={`Spara ${title}`}
          >
            <Bookmark className="w-4 h-4 text-white/60" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% -10%, ${colors.glow} 0%, transparent 65%)` }}
        aria-hidden="true"
      />
    </motion.article>
  );
}
