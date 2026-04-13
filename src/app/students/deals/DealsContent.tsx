'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Loader2, Sparkles, Tag } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { DealCard } from '@/components/ui/DealCard';
import type { TKLDeal, DealCategory } from '@/lib/schemas/deal';
import { getPublishedDeals } from '@/lib/services/deals';

// Alla möjliga filtervärden
type FilterKey = DealCategory | 'all';

// Färgkarta för filter-tabs (matchar DealCard)
const FILTER_COLORS: Record<FilterKey, string> = {
  all: '#8B5CF6',
  rabatt: '#8B5CF6',
  mat: '#F59E0B',
  teknik: '#3B82F6',
  sport: '#10B981',
  övrigt: '#6B7280',
};

// Filter Tab - Framer Motion variant för hover/tap
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
        boxShadow: active ? `0 0 20px ${color}20` : 'none',
        transition: 'background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s',
      }}
      aria-pressed={active}
    >
      {active && <Sparkles className="w-4 h-4" style={{ color }} aria-hidden="true" />}
      {label}
    </motion.button>
  );
}

// Deals Page Content
export function DealsContent() {
  const { t } = useLanguage();
  // Castar till any för att undvika TSD-klagomål om saknad `deals`-nyckel
  const deals = (t as any).deals as Record<string, any>;

  const [allDeals, setAllDeals] = useState<TKLDeal[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hämta deals från Firestore (klientdriven)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPublishedDeals()
      .then((data) => {
        if (isMounted) {
          setAllDeals(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('[DealsContent]', err);
          setError(deals?.error ?? 'Kunde inte hämta deals.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [deals]);

  // Filtrera på kategori
  const filtered: TKLDeal[] = filter === 'all'
    ? allDeals
    : allDeals.filter((d) => d.category === filter);

  // Dynamiska filter-nycklar: visa bara kategorier med innehåll
  const availableCategories = Array.from(new Set(allDeals.map((d) => d.category)));
  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: deals?.filterAll ?? 'Alla' },
    ...Object.keys(FILTER_COLORS)
      .filter((k) => k !== 'all' && availableCategories.includes(k as DealCategory))
      .map((k) => ({
        key: k as FilterKey,
        label: deals?.categories?.[k] ?? k,
      })),
  ];

  return (
    <>
      {/* HERO SECTION */}
      <section
        className="relative min-h-[55svh] flex flex-col justify-center overflow-hidden pt-28 pb-16 px-4 sm:px-6 lg:px-8"
        aria-labelledby="deals-hero-heading"
      >
        {/* Atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 80% 20%, rgba(245,158,11,0.12) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 20% 75%, rgba(139,92,246,0.08) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />
        <GradientOrb color="orange" size={480} top="30%" left="60%" opacity={0.11} animClass="animate-orb-float" />
        <GradientOrb color="red" size={260} top="65%" left="10%" opacity={0.07} animClass="animate-orb-float-reverse" />

        <div className="relative max-w-4xl mx-auto w-full z-20">
          <StaggerReveal className="text-center" delay={0.1}>
            {/* Badge */}
            <RevealItem className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.35)',
                  color: '#F59E0B',
                }}
              >
                <Tag className="w-4 h-4" aria-hidden="true" />
                {deals?.badge ?? 'Nexus Deals'}
              </span>
            </RevealItem>

            {/* Rubrik */}
            <RevealItem>
              <h1
                id="deals-hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-bold hero-text leading-[1.1] tracking-tight"
              >
                {deals?.heading ?? 'Exklusiva'}{' '}
                <span
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #8B5CF6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {deals?.headingAccent ?? 'kårförmåner'}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, #F59E0B, #8B5CF6, transparent)' }}
                    aria-hidden="true"
                  />
                </span>
              </h1>
            </RevealItem>

            {/* Underrubrik */}
            <RevealItem>
              <p className="mt-6 text-base sm:text-lg hero-text-muted max-w-2xl mx-auto leading-relaxed">
                {deals?.description ?? 'Exklusiva rabatter och förmåner för dig som är kårmedlem i Teknologkåren.'}
              </p>
            </RevealItem>
          </StaggerReveal>
        </div>

        {/* Fade-out till bakgrund */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
      </section>

      {/* DEALS-LISTA */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24" aria-label="Nexus Deals">
        <div className="max-w-4xl mx-auto">

          {/* Filter-tabs (visas bara om det finns data) */}
          {!loading && !error && allDeals.length > 1 && FILTERS.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
              role="group"
              aria-label="Filtrera deals"
            >
              {FILTERS.map(({ key, label }) => (
                <FilterTab
                  key={key}
                  active={filter === key}
                  onClick={() => setFilter(key)}
                  label={label}
                  color={FILTER_COLORS[key]}
                />
              ))}
            </motion.div>
          )}

          {/* Laddning */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4" aria-live="polite" aria-busy="true">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#F59E0B' }} />
              <p className="text-sm hero-text-subtle animate-pulse">
                {deals?.loading ?? 'Hämtar deals...'}
              </p>
            </div>
          )}

          {/* Fel-state */}
          {error && !loading && (
            <div className="flex justify-center py-16" role="alert">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md">
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Tomt state */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div
              role="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-white/5 border border-white/10 rounded-3xl"
            >
              <Tag className="w-12 h-12 mb-4 opacity-30" style={{ color: '#F59E0B' }} />
              <p className="text-lg hero-text-muted">
                {filter === 'all' ? (deals?.noDeals ?? 'Inga deals tillgängliga.') : (deals?.noDealsFiltered ?? 'Inga deals matchar filtret.')}
              </p>
            </motion.div>
          )}

          {/* Deals-lista */}
          {!loading && !error && filtered.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((deal, idx) => (
                  <DealCard key={deal.id} deal={deal} idx={idx} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
