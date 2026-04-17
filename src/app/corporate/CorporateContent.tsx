'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { CalendarDays, LayoutGrid, Handshake, Building2, Users, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
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
  const scrollContainer = useScrollContainer();
  const colors = ACCENT_COLOR_MAP['purple'];

  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
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
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative flex flex-col lg:grid lg:grid-cols-2 min-h-svh overflow-hidden"
        aria-labelledby="corporate-hero-heading"
      >
        {/* Background: diagonal cross-hatch (both panels) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(139,92,246,0.04) 0px, rgba(139,92,246,0.04) 1px, transparent 1px, transparent 40px),' +
              'repeating-linear-gradient(45deg, rgba(139,92,246,0.025) 0px, rgba(139,92,246,0.025) 1px, transparent 1px, transparent 40px)',
          }}
          aria-hidden="true"
        />

        {/* LEFT PANEL — heading only */}
        <motion.div
          style={{ y: heroTextY }}
          className="relative flex items-end lg:items-center px-8 sm:px-12 lg:px-16 pt-32 pb-8 lg:py-24 z-10"
        >
          <StaggerReveal delay={0.05}>
            <RevealItem>
              <h1
                id="corporate-hero-heading"
                className="hero-text"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  lineHeight: 0.92,
                  letterSpacing: '-0.05em',
                  fontSize: 'clamp(3rem, 7vw + 1rem, 8rem)',
                }}
              >
                {corporate.heading}
                <br />
                <span className="text-accent-purple">{corporate.headingAccent}</span>
              </h1>
            </RevealItem>
          </StaggerReveal>
        </motion.div>

        {/* Divider line — desktop only */}
        <div
          className="hidden lg:block absolute left-1/2 -translate-x-px top-24 bottom-0 w-px pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.25) 20%, rgba(139,92,246,0.25) 80%, transparent)' }}
          aria-hidden="true"
        />

        {/* RIGHT PANEL — badge, description, trust chips, CTAs */}
        <motion.div
          style={{ y: heroTextY, background: 'rgba(139,92,246,0.03)' }}
          className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-16 pb-16 lg:py-24 z-10"
        >
          <StaggerReveal delay={0.2}>
            <RevealItem className="mb-8">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  color: '#8B5CF6',
                }}
              >
                <Building2 className="w-4 h-4" aria-hidden="true" />
                {corporate.badge}
              </span>
            </RevealItem>

            <RevealItem>
              <p className="text-base sm:text-lg hero-text-muted leading-relaxed max-w-[52ch] mb-8">
                {corporate.description}
              </p>
            </RevealItem>

            {/* Trust chips — visible on all sizes */}
            <RevealItem className="flex flex-wrap gap-2 mb-10">
              {[corporate.pills.members, corporate.pills.programs, corporate.pills.location].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: '#8B5CF6' }}
                >
                  <span className="w-1 h-1 rounded-full bg-[#8B5CF6] shrink-0" />
                  {label}
                </span>
              ))}
            </RevealItem>

            <RevealItem className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/about#kontakt"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #a78bfa)',
                  boxShadow: '0 0 28px rgba(139,92,246,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                {corporate.ctaContact}
              </Link>
              <Link
                href="#tjanster"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl hero-text-muted font-semibold text-sm sm:text-base hover:hero-text active:scale-95"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}
              >
                {corporate.ctaServices}
              </Link>
            </RevealItem>
          </StaggerReveal>
        </motion.div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-30"
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
