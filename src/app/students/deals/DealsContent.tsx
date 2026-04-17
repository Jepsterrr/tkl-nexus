'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Loader2, Tag } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { DealCard } from '@/components/ui/DealCard';
import type { TKLDeal } from '@/lib/schemas/deal';
import { getPublishedDeals } from '@/lib/services/deals';
import { useScrollContainer } from '@/components/providers/ScrollProvider';

// Deals Page Content
export function DealsContent() {
  const { t } = useLanguage();
  const { deals } = t;

  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const scrollContainer = useScrollContainer();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-30%']);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-10%']);
  const floatY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-22%']);

  const [allDeals, setAllDeals] = useState<TKLDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  // Hämta deals från Firestore (klientdriven)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

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
  }, [deals, fetchKey]);

  return (
    <>
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative min-h-[60svh] flex flex-col justify-center overflow-hidden pt-28 pb-12 px-4 sm:px-6 lg:px-8"
        aria-labelledby="deals-hero-heading"
      >
        {/* Diagonal hatch bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(245,158,11,0.035) 0px, rgba(245,158,11,0.035) 1px, transparent 1px, transparent 28px)',
          }}
          aria-hidden="true"
        />

        {/* Rotated card silhouette */}
        <motion.div style={{ y: orbY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              width: 'clamp(280px, 45vw, 520px)',
              height: 'clamp(175px, 28vw, 325px)',
              border: '1px solid rgba(245,158,11,0.14)',
              borderRadius: '28px',
              background: 'rgba(245,158,11,0.04)',
              transform: 'translate(-50%, -50%) rotate(-12deg)',
            }}
            aria-hidden="true"
          />
        </motion.div>

        {/* Depth-3: Floating geometry + context pills */}
        <motion.div style={{ y: floatY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.span
            className="absolute top-[22%] right-[11%] text-4xl select-none"
            style={{ color: '#F59E0B', opacity: 0.14, textShadow: '0 0 22px rgba(245,158,11,0.6)' }}
            animate={shouldReduceMotion ? {} : { y: [0, -14, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >✦</motion.span>
          <motion.span
            className="absolute top-[53%] left-[5%] text-2xl select-none"
            style={{ color: '#8B5CF6', opacity: 0.11, textShadow: '0 0 14px rgba(139,92,246,0.5)' }}
            animate={shouldReduceMotion ? {} : { y: [0, 12, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
          >◆</motion.span>
          <motion.span
            className="absolute top-[37%] right-[4%] text-xl select-none"
            style={{ color: '#F59E0B', opacity: 0.08 }}
            animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          >%</motion.span>

          <motion.div
            className="absolute top-[27%] left-[4%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)', color: '#F59E0B', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            animate={shouldReduceMotion ? {} : { y: [0, -7, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
            {deals?.pills?.exclusive}
          </motion.div>
          <motion.div
            className="absolute top-[17%] right-[19%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: '#8B5CF6', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            animate={shouldReduceMotion ? {} : { y: [0, -9, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
            {deals?.pills?.offers}
          </motion.div>
          <motion.div
            className="absolute bottom-[30%] right-[7%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)', color: '#F59E0B', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
            {deals?.pills?.name}
          </motion.div>
        </motion.div>

        <motion.div style={{ y: heroTextY }} className="relative max-w-4xl mx-auto w-full z-20">
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
                <span aria-hidden="true">★</span>
                {deals?.badge ?? 'Nexus Deals'}
              </span>
            </RevealItem>

            {/* Rubrik */}
            <RevealItem>
              <h1
                id="deals-hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl hero-text hero-heading"
              >
                {deals?.heading ?? 'Exklusiva'}{' '}
                <span className="relative inline-block text-accent-orange">
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
        </motion.div>

        {/* Fade-out + scroll cue */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-30"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          animate={shouldReduceMotion ? {} : { y: [0, 7, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <div className="w-px h-10 mx-auto rounded-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(245,158,11,0.5))' }} />
        </motion.div>
      </section>

      {/* DEALS-LISTA */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24" aria-label="Nexus Deals">
        <div className="max-w-4xl mx-auto">

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
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md flex flex-col items-center gap-4">
                <p className="text-red-400 font-medium">{error}</p>
                <button
                  onClick={() => setFetchKey((k) => k + 1)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #f97316)' }}
                >
                  {deals?.retry ?? 'Försök igen'}
                </button>
              </div>
            </div>
          )}

          {/* Tomt state */}
          {!loading && !error && allDeals.length === 0 && (
            <motion.div
              role="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
              style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)' }}
            >
              <Tag className="w-12 h-12 mb-4 opacity-30" style={{ color: '#F59E0B' }} aria-hidden="true" />
              <p className="text-lg hero-text-muted">
                {deals?.noDeals ?? 'Inga deals tillgängliga.'}
              </p>
            </motion.div>
          )}

          {/* Deals-lista */}
          {!loading && !error && allDeals.length > 0 && (
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {allDeals.map((deal, idx) => (
                  <DealCard key={deal.id} deal={deal} idx={idx} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
