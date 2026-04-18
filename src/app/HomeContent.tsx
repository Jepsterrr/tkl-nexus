'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { BenefitCardComponent } from '@/components/ui/BenefitCard';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StarField } from '@/components/ui/StarField';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import type { BenefitCard } from '@/lib/types';

// Module-level style constants — avoids recreating objects on every scroll-driven render
const PILL_STYLE_GREEN: React.CSSProperties = {
  background: 'rgba(16,185,129,0.10)',
  border: '1px solid rgba(16,185,129,0.22)',
  color: '#10B981',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};
const PILL_STYLE_PURPLE: React.CSSProperties = {
  background: 'rgba(139,92,246,0.10)',
  border: '1px solid rgba(139,92,246,0.22)',
  color: '#8B5CF6',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};
const PILL_STYLE_RED: React.CSSProperties = {
  background: 'rgba(227,6,19,0.08)',
  border: '1px solid rgba(227,6,19,0.20)',
  color: '#E30613',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};
const BADGE_STYLE: React.CSSProperties = {
  background: 'rgba(227,6,19,0.12)',
  border: '1px solid rgba(227,6,19,0.28)',
  color: '#E30613',
  boxShadow: '0 0 20px rgba(227,6,19,0.10)',
};
const CTA_STUDENT_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(16,185,129,0.07))',
  border: '1px solid rgba(16,185,129,0.32)',
  color: '#10B981',
  boxShadow: '0 0 28px rgba(16,185,129,0.10)',
  minWidth: '240px',
};
const CTA_CORPORATE_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(139,92,246,0.07))',
  border: '1px solid rgba(139,92,246,0.32)',
  color: '#8B5CF6',
  boxShadow: '0 0 28px rgba(139,92,246,0.10)',
  minWidth: '240px',
};
const CTA_STUDENT_ICON_STYLE: React.CSSProperties = {
  background: 'rgba(16,185,129,0.15)',
  border: '1px solid rgba(16,185,129,0.28)',
};
const CTA_CORPORATE_ICON_STYLE: React.CSSProperties = {
  background: 'rgba(139,92,246,0.15)',
  border: '1px solid rgba(139,92,246,0.28)',
};

export function HomeContent() {
  const { t } = useLanguage();
  const { home } = t;
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const scrollContainer = useScrollContainer();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-40%']);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-15%']);
  const floatY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-25%']);

  const FEATURES: BenefitCard[] = [
    {
      title: home.features.career.title,
      description: home.features.career.description,
      iconName: 'Rocket',
      accentColor: 'blue',
      linkLabel: home.features.career.linkLabel,
      linkHref: '/career',
      featured: true,
    },
    {
      title: home.features.events.title,
      description: home.features.events.description,
      iconName: 'CalendarDays',
      accentColor: 'purple',
      linkLabel: home.features.events.linkLabel,
      linkHref: '/events',
    },
    {
      title: home.features.deals.title,
      description: home.features.deals.description,
      iconName: 'Gift',
      accentColor: 'orange',
      linkLabel: home.features.deals.linkLabel,
      linkHref: '/students/deals',
    },
  ];

  return (
    <>
      {/* EPIC HOME HERO */}
      <section
        ref={heroRef}
        className="relative min-h-svh flex flex-col justify-center overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8"
        aria-labelledby="home-hero-heading"
      >
        {/* Depth-0: Animated star field */}
        <StarField />

        {/* Depth-1: Atmospheric radials */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 15% 15%, rgba(227,6,19,0.11) 0%, transparent 55%),' +
              'radial-gradient(ellipse 60% 55% at 85% 80%, rgba(139,92,246,0.08) 0%, transparent 55%),' +
              'radial-gradient(ellipse 50% 40% at 55% 100%, rgba(16,185,129,0.05) 0%, transparent 50%)',
          }}
          aria-hidden="true"
        />

        {/* Depth-2: Parallax orbs */}
        <motion.div style={{ y: orbY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <GradientOrb color="red" size={750} top="18%" left="44%" opacity={0.09} animClass="animate-orb-float" />
          <GradientOrb color="purple" size={380} top="58%" left="78%" opacity={0.07} animClass="animate-orb-float-reverse" />
          <GradientOrb color="green" size={260} top="48%" left="3%" opacity={0.06} animClass="animate-orb-float" />
          {/* Subtle dot-grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </motion.div>

        {/* Depth-3: Floating decorative geometry */}
        <motion.div style={{ y: floatY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Large hexagon — top right */}
          <motion.span
            className="absolute top-[20%] right-[10%] text-5xl select-none"
            style={{ color: '#E30613', opacity: 0.14, textShadow: '0 0 24px rgba(227,6,19,0.6)' }}
            animate={shouldReduceMotion ? {} : { y: [0, -16, 0], rotate: [0, 12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >⬡</motion.span>

          {/* Medium hexagon — mid left */}
          <motion.span
            className="absolute top-[52%] left-[6%] text-3xl select-none"
            style={{ color: '#8B5CF6', opacity: 0.11, textShadow: '0 0 18px rgba(139,92,246,0.5)' }}
            animate={shouldReduceMotion ? {} : { y: [0, 12, 0], rotate: [0, -12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
          >⬡</motion.span>

          {/* Small diamond — upper left */}
          <motion.span
            className="absolute top-[33%] left-[2%] text-xl select-none"
            style={{ color: '#10B981', opacity: 0.09, textShadow: '0 0 12px rgba(16,185,129,0.5)' }}
            animate={shouldReduceMotion ? {} : { y: [0, -9, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          >◆</motion.span>

          {/* Floating stat pill: students */}
          <motion.div
            className="absolute top-[26%] left-[4%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold"
            style={PILL_STYLE_GREEN}
            animate={shouldReduceMotion ? {} : { y: [0, -7, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
            {home.pills.students}
          </motion.div>

          {/* Floating stat pill: companies */}
          <motion.div
            className="absolute top-[16%] right-[18%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold"
            style={PILL_STYLE_PURPLE}
            animate={shouldReduceMotion ? {} : { y: [0, -9, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            aria-hidden="true"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
            {home.pills.companies}
          </motion.div>

          {/* Floating stat pill: opportunity types */}
          <motion.div
            className="absolute bottom-[30%] right-[6%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold"
            style={PILL_STYLE_RED}
            animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            aria-hidden="true"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E30613] shrink-0" />
            {home.pills.types}
          </motion.div>
        </motion.div>

        {/* Depth-4: Hero content */}
        <motion.div style={{ y: heroTextY }} className="relative max-w-4xl mx-auto w-full z-20">
          <StaggerReveal className="text-center" delay={0.1}>

            {/* Badge */}
            <RevealItem className="flex justify-center mb-8">
              <span
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
                style={BADGE_STYLE}
              >
                <span aria-hidden="true">⬡</span>
                {home.badge}
              </span>
            </RevealItem>

            {/* Heading */}
            <RevealItem>
              <h1
                id="home-hero-heading"
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black hero-text hero-heading"
              >
                {home.heading}
                <br />
                <span className="text-accent-red">{home.headingAccent}</span>
              </h1>
            </RevealItem>

            {/* Description */}
            <RevealItem>
              <p className="mt-8 text-base sm:text-lg md:text-xl hero-text-muted max-w-2xl mx-auto leading-relaxed">
                {home.description}
              </p>
            </RevealItem>

            {/* Mobile trust chips — multi-colour matching feature card accents */}
            <RevealItem className="flex flex-wrap justify-center gap-2 mt-4 lg:hidden">
              {([
                { label: home.pills.students,  color: '#3B82F6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.22)'  },
                { label: home.pills.companies, color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.22)' },
                { label: home.pills.types,     color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.22)'  },
              ] as const).map(({ label, color, bg, border }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: bg, border: `1px solid ${border}`, color }}
                >
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </RevealItem>

            {/* Dual-audience CTAs */}
            <RevealItem className="mt-12">
              <p className="text-xs font-semibold uppercase tracking-widest hero-text-subtle mb-5">
                {home.ctaLabel}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
                <Link
                  href="/students"
                  className="group flex items-center justify-between gap-4 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] w-full sm:w-auto"
                  style={CTA_STUDENT_STYLE}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={CTA_STUDENT_ICON_STYLE}
                      aria-hidden="true"
                    >
                      <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold leading-tight">{home.ctaStudents}</div>
                      <div className="text-xs leading-tight mt-0.5" style={{ color: 'rgba(16,185,129,0.65)' }}>{home.ctaStudentsSub}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0" aria-hidden="true" />
                </Link>

                <Link
                  href="/corporate"
                  className="group flex items-center justify-between gap-4 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] w-full sm:w-auto"
                  style={CTA_CORPORATE_STYLE}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={CTA_CORPORATE_ICON_STYLE}
                      aria-hidden="true"
                    >
                      <Building2 className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold leading-tight">{home.ctaCorporate}</div>
                      <div className="text-xs leading-tight mt-0.5" style={{ color: 'rgba(139,92,246,0.65)' }}>{home.ctaCorporateSub}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </RevealItem>

          </StaggerReveal>
        </motion.div>

        {/* Depth-5: Bottom fade + scroll cue */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-30"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          animate={shouldReduceMotion ? {} : { y: [0, 7, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <div
            className="w-px h-10 mx-auto rounded-full"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.35))' }}
          />
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        aria-labelledby="features-heading"
      >
        <GradientOrb color="purple" size={400} top="50%" left="80%" opacity={0.06} />
        <div className="max-w-6xl mx-auto">
          <StaggerReveal className="text-center mb-14">
            <RevealItem>
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold hero-text">
                {home.featuresTitle}
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 hero-text-muted text-lg max-w-xl mx-auto">
                {home.featuresSubtitle}
              </p>
            </RevealItem>
          </StaggerReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-5 sm:gap-6 items-stretch">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}>
                <BenefitCardComponent {...f} index={i} />
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div
            className="mt-16 relative rounded-3xl overflow-hidden p-px"
            style={{ background: 'linear-gradient(135deg, rgba(227,6,19,0.4), rgba(139,92,246,0.3), rgba(16,185,129,0.3))' }}
          >
            <div className="rounded-3xl cta-banner-bg backdrop-blur-xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="hero-text text-xl sm:text-2xl font-bold mb-2">{home.ctaBannerTitle}</h3>
                <p className="hero-text-muted text-sm">{home.ctaBannerSubtitle}</p>
              </div>
              <Link
                href="/about#kontakt"
                className="shrink-0 px-8 py-3.5 rounded-2xl bg-linear-to-r from-[#E30613] to-[#c00510] text-white font-semibold text-sm sm:text-base hover:scale-105 hover:shadow-lg hover:shadow-[#E30613]/30 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
              >
                {home.ctaBannerBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
