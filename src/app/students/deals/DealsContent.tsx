'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Loader2, Tag } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { GradientOrb } from '@/components/ui/GradientOrb';
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

  const [allDeals, setAllDeals] = useState<TKLDeal[]>([]);
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

  return (
    <>
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative min-h-svh flex flex-col justify-center overflow-hidden pt-28 pb-16 px-4 sm:px-6 lg:px-8"
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
        <motion.div style={{ y: orbY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <GradientOrb color="orange" size={480} top="30%" left="60%" opacity={0.11} animClass="animate-orb-float" />
          <GradientOrb color="red" size={260} top="65%" left="10%" opacity={0.07} animClass="animate-orb-float-reverse" />
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
        </motion.div>

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
