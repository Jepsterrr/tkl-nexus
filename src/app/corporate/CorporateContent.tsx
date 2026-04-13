'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { CalendarDays, LayoutGrid, Handshake, Building2, Users, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { MegaStat } from '@/components/ui/MegaStat';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import type { StatItem } from '@/lib/types';
import { ACCENT_COLOR_MAP } from '@/lib/types';

const ICON_MAP: Record<string, LucideIcon> = {
  CalendarDays,
  LayoutGrid,
  Handshake,
};

export function CorporateContent() {
  const { t } = useLanguage();
  const { corporate } = t;
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const colors = ACCENT_COLOR_MAP['purple'];

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-30%']);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-10%']);

  const STATS: StatItem[] = [
    { value: '1 600+', label: corporate.stats.members },
    { value: '30', label: corporate.stats.programs },
    { value: '4', label: corporate.stats.sections },
  ];

  const SERVICES = [
    { title: corporate.services.events.title, description: corporate.services.events.description, linkLabel: corporate.services.events.linkLabel, iconName: 'CalendarDays', linkHref: '/events', accentColor: 'purple' as const },
    { title: corporate.services.portal.title, description: corporate.services.portal.description, linkLabel: corporate.services.portal.linkLabel, iconName: 'LayoutGrid', linkHref: '/corporate/post', accentColor: 'purple' as const },
    { title: corporate.services.partnership.title, description: corporate.services.partnership.description, linkLabel: corporate.services.partnership.linkLabel, iconName: 'Handshake', linkHref: '/about#kontakt', accentColor: 'purple' as const },
  ];

  return (
    <>
      {/* Hero (Epic Design: 3-layer parallax) */}
      <section
        ref={heroRef}
        className="relative min-h-svh flex flex-col justify-center overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8"
        aria-labelledby="corporate-hero-heading"
      >
        {/* Depth-0: Far atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 5% 10%, rgba(139,92,246,0.12) 0%, transparent 60%),' +
              'radial-gradient(ellipse 70% 60% at 90% 80%, rgba(139,92,246,0.07) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        {/* Depth-1: Parallax orbs + grid */}
        <motion.div style={{ y: orbY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <GradientOrb color="purple" size={600} top="30%" left="60%" opacity={0.12} animClass="animate-orb-float" />
          <GradientOrb color="red" size={280} top="70%" left="8%" opacity={0.07} animClass="animate-orb-float-reverse" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),' +
                'linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </motion.div>

        {/* Depth-2: Floating accent dots */}
        <motion.div
          className="absolute top-28 right-[14%] w-2 h-2 rounded-full pointer-events-none"
          style={{ background: '#8B5CF6', boxShadow: '0 0 12px #8B5CF6' }}
          animate={shouldReduceMotion ? {} : { y: [0, -14, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-36 left-[12%] w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{ background: '#E30613', boxShadow: '0 0 8px #E30613' }}
          animate={shouldReduceMotion ? {} : { y: [0, 10, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          aria-hidden="true"
        />

        {/* Depth-4: Content */}
        <motion.div style={{ y: heroTextY }} className="relative max-w-4xl mx-auto w-full">
          <StaggerReveal className="text-center" delay={0.1}>
            <RevealItem className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  color: '#8B5CF6',
                }}
              >
                <Building2 className="w-4 h-4" aria-hidden="true" />
                {corporate.badge}
              </span>
            </RevealItem>

            <RevealItem>
              <h1
                id="corporate-hero-heading"
                className="text-4xl sm:text-5xl md:text-7xl font-bold hero-text leading-[1.05] tracking-tight"
              >
                {corporate.heading}{' '}
                <span
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {corporate.headingAccent}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, #8B5CF6, #a78bfa, transparent)' }}
                    aria-hidden="true"
                  />
                </span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mt-6 text-base sm:text-lg md:text-xl hero-text-muted max-w-2xl mx-auto leading-relaxed">
                {corporate.description}
              </p>
            </RevealItem>

            <RevealItem className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Link
                href="/about#kontakt"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #a78bfa)',
                  boxShadow: '0 0 28px rgba(139,92,246,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                {corporate.ctaContact}
              </Link>
              <Link
                href="#tjanster"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl hero-text-muted font-semibold text-sm sm:text-base hover:hero-text hover:bg-white/8 active:scale-95 w-full sm:w-auto"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}
              >
                {corporate.ctaServices}
              </Link>
            </RevealItem>
          </StaggerReveal>
        </motion.div>

        {/* Depth-5: Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8" aria-label="Statistik om Teknologkåren">
        <div className="max-w-6xl mx-auto">
          <dl className="flex flex-wrap justify-between gap-8 sm:gap-4">
            {STATS.map((stat, i) => (
              <MegaStat key={stat.label} value={stat.value} label={stat.label} index={i} />
            ))}
          </dl>
        </div>
      </section>

      {/* Services (detailed) */}
      <section
        id="tjanster"
        className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 mb-10"
        aria-labelledby="services-heading"
      >
        <GradientOrb color="purple" size={450} top="50%" left="10%" opacity={0.07} />
        <div className="max-w-6xl mx-auto">
          <StaggerReveal className="mb-10">
            <RevealItem>
              <h2 id="services-heading" className="text-2xl sm:text-3xl font-bold hero-text text-center mt-10">
                {corporate.servicesTitle}
              </h2>
            </RevealItem>
          </StaggerReveal>
          <div className="relative">
            <div
              className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ borderLeft: 'dashed 1px var(--border)' }}
              aria-hidden="true"
            />

            <div className="space-y-10 lg:space-y-16">
              {SERVICES.map((service, i) => {
                const Icon = ICON_MAP[service.iconName] ?? LayoutGrid;
                const isReversed = i % 2 !== 0;
                return (
                  <div
                    key={service.title}
                    className={`flex flex-col lg:flex-row items-start gap-6 lg:gap-12 ${isReversed ? 'lg:flex-row-reverse' : ''}`}
                  >
                    <div className={`lg:w-1/2 flex items-start gap-4 ${isReversed ? 'lg:pl-12' : 'lg:pr-12 lg:justify-end lg:text-right'}`}>
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isReversed ? '' : 'lg:order-last'}`}
                        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                        aria-hidden="true"
                      >
                        <Icon className="w-5 h-5" style={{ color: colors.hex }} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-foreground font-display font-semibold text-lg">{service.title}</h3>
                        <Link
                          href={service.linkHref}
                          className="inline-block mt-2 text-sm font-mono font-medium tracking-wide transition-colors duration-150"
                          style={{ color: colors.hex }}
                        >
                          {service.linkLabel}
                        </Link>
                      </div>
                    </div>
                    <div className={`lg:w-1/2 ${isReversed ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                        {service.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 pb-24">
        <GradientOrb color="purple" size={400} top="-10%" left="80%" opacity={0.08} />
        <div className="max-w-6xl mx-auto">
          <div
            className="relative rounded-3xl p-px"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(139,92,246,0.15))' }}
          >
            <div className="rounded-3xl cta-banner-bg backdrop-blur-xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="hero-text text-xl sm:text-2xl font-bold mb-2">{corporate.ctaBannerTitle}</h3>
                <p className="hero-text-muted text-sm">{corporate.ctaBannerSubtitle}</p>
              </div>
              <Link
                href="/about#kontakt"
                className="shrink-0 px-8 py-3.5 rounded-2xl bg-linear-to-r from-[#8B5CF6] to-[#6d28d9] text-white font-semibold text-sm hover:scale-105 hover:shadow-lg hover:shadow-[#8B5CF6]/30 transition-all active:scale-95"
              >
                {corporate.ctaBannerBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
