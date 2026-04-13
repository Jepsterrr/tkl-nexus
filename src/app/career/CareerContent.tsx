'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Briefcase, Loader2, Sparkles, Compass } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { JobCard } from '@/components/ui/JobCard';
import type { TKLOpportunity, OpportunityType } from '@/lib/schemas/opportunity';
import { getPublishedOpportunities } from '@/lib/services/opportunities';

type FilterKey = OpportunityType | 'all';

// Filter Färger
const FILTER_COLORS: Record<FilterKey, string> = {
  all: '#8B5CF6',
  jobb: '#3B82F6',
  exjobb: '#8B5CF6',
  praktik: '#10B981',
  trainee: '#F59E0B',
};

const TICKER_LOGOS = [
  '/Logo/Data.png',
  '/Logo/Geo.png',
  '/Logo/I.png',
  '/Logo/Maskin.png',
];

// Filter Tab - Framer Motion variant med hover/tap-animationer
function FilterTab({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.button
      onClick={onClick}
      whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -1 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
      style={{
        background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? color + '55' : 'rgba(255,255,255,0.08)'}`,
        color: active ? color : 'var(--hero-text-muted)',
        boxShadow: active ? `0 0 20px ${color}15` : 'none',
        transition: 'background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s',
      }}
      aria-pressed={active}
    >
      {active && <Sparkles className="w-4 h-4" style={{ color }} />}
      {label}
    </motion.button>
  );
}

export function CareerContent() {
  const { t } = useLanguage();
  const opportunity = t.opportunities;

  const [opportunities, setOpportunities] = useState<TKLOpportunity[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPublishedOpportunities()
      .then((data) => {
        if (isMounted) {
          setOpportunities(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError(opportunity.error);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [opportunity.error]);

  const filteredOpps = filter === 'all'
    ? opportunities
    : opportunities.filter((o) => o.type === filter);

  return (
    <>
      {/* EPIC HERO SECTION (Depth 0-5) */}
      <section
        ref={heroRef}
        className="relative min-h-[55svh] flex flex-col justify-center overflow-hidden pt-28 pb-16 px-4 sm:px-6 lg:px-8"
        aria-labelledby="career-hero-heading"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 85% 20%, rgba(59,130,246,0.12) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 15% 75%, rgba(16,185,129,0.08) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <GradientOrb color="blue" size={500} top="20%" left="60%" opacity={0.12} animClass="animate-orb-float" />
        <GradientOrb color="green" size={300} top="70%" left="20%" opacity={0.08} animClass="animate-orb-float-reverse" />

        <div className="relative max-w-4xl mx-auto w-full z-20">
          <StaggerReveal className="text-center" delay={0.1}>
            <RevealItem className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                {opportunity.badge}
              </span>
            </RevealItem>

            <RevealItem>
              <h1
                id="career-hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-bold hero-text leading-[1.1] tracking-tight"
              >
                {opportunity.heading}{' '}
                <span
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {opportunity.headingAccent}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, #3B82F6, #10B981, transparent)' }}
                    aria-hidden="true"
                  />
                </span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mt-6 text-base sm:text-lg hero-text-muted max-w-2xl mx-auto leading-relaxed">
                {opportunity.description}
              </p>
            </RevealItem>
          </StaggerReveal>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-30"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
      </section>

      {/* Logo-ticker */}
      <div
        className="overflow-hidden py-5"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
        aria-hidden="true"
      >
        <div className="animate-scroll flex gap-20 w-max">
          {[...TICKER_LOGOS, ...TICKER_LOGOS, ...TICKER_LOGOS, ...TICKER_LOGOS].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              width={32}
              height={32}
              className="object-contain grayscale"
              style={{ opacity: 0.18 }}
            />
          ))}
        </div>
      </div>

      {/* INNEHÅLLS-SEKTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24" aria-label="Opportunities">
        <div className="max-w-6xl mx-auto">

          {/* Filtrering */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-12 pt-10"
            role="group"
            aria-label="Filter opportunities"
          >
            {(Object.keys(FILTER_COLORS) as FilterKey[]).map((key) => (
              <FilterTab
                key={key}
                active={filter === key}
                onClick={() => setFilter(key)}
                label={opportunity.filters[key]}
                color={FILTER_COLORS[key]}
              />
            ))}
          </motion.div>

          {/* Laddar-state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4" aria-live="polite" aria-busy="true">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <p className="text-sm hero-text-subtle font-medium tracking-wide animate-pulse">
                {opportunity.loading}
              </p>
            </div>
          )}

          {/* Error-state */}
          {error && !loading && (
            <div className="flex justify-center py-16" role="alert">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md">
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Tomt State */}
          {!loading && !error && filteredOpps.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-white/5 border border-white/10 rounded-3xl"
            >
              <Briefcase className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
              <p className="text-lg hero-text-muted">
                {filter === 'all' ? opportunity.noOpps : opportunity.noOppsFiltered}
              </p>
            </motion.div>
          )}

          {/* Jobb Grid */}
          {!loading && !error && filteredOpps.length > 0 && (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredOpps.map((job, idx) => (
                  <JobCard key={job.id} job={job} idx={idx} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </section>
    </>
  );
}
