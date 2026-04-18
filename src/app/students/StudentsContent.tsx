'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  Briefcase,
  GraduationCap,
  BookOpen,
  Rocket,
  Target,
} from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { BenefitCardComponent } from '@/components/ui/BenefitCard';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { DestinationCard } from '@/components/ui/DestinationCard';
import type { BenefitCard, JobCardProps } from '@/lib/types';

export function StudentsContent() {
  const { t } = useLanguage();
  const { students } = t;
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const scrollContainer = useScrollContainer();

  // Parallax scroll for hero orb
  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-10%']);

  const BENEFITS: BenefitCard[] = [
    {
      title: students.benefits.learn.title,
      description: students.benefits.learn.description,
      iconName: 'BookOpen',
      accentColor: 'green',
    },
    {
      title: students.benefits.career.title,
      description: students.benefits.career.description,
      iconName: 'Rocket',
      accentColor: 'green',
    },
    {
      title: students.benefits.network.title,
      description: students.benefits.network.description,
      iconName: 'Target',
      accentColor: 'green',
    },
  ];

  const DESTINATIONS = [
    {
      href: '/events',
      label: students.destinations.events.label,
      description: students.destinations.events.description,
      Icon: CalendarDays,
      accentColor: '#8B5CF6',
      cta: students.destinations.events.cta,
    },
    {
      href: '/career',
      label: students.destinations.career.label,
      description: students.destinations.career.description,
      Icon: Briefcase,
      accentColor: '#3B82F6',
      cta: students.destinations.career.cta,
    },
    {
      href: '/students/deals',
      label: students.destinations.deals.label,
      description: students.destinations.deals.description,
      Icon: GraduationCap,
      accentColor: '#F59E0B',
      cta: students.destinations.deals.cta,
    },
  ];

  return (
    <>
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden pt-28 pb-16 px-6 sm:px-8 lg:px-16"
        aria-labelledby="students-hero-heading"
      >
        {/* Depth-0: atmospheric radials */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 75% 20%, rgba(16,185,129,0.10) 0%, transparent 55%),' +
              'radial-gradient(ellipse 50% 45% at 10% 75%, rgba(139,92,246,0.07) 0%, transparent 55%)',
          }}
          aria-hidden="true"
        />

        {/* Depth-1: dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.07) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {/* Depth-2: parallax orbs */}
        <GradientOrb color="green" size={680} top="15%" left="58%" opacity={0.10} animClass="animate-orb-float" />
        <GradientOrb color="purple" size={320} top="60%" left="2%" opacity={0.08} animClass="animate-orb-float-reverse" />
        <GradientOrb color="green" size={240} top="75%" left="85%" opacity={0.06} animClass="animate-orb-float" />

        {/* Ghost "S" watermark */}
        <div
          className="absolute top-1/2 right-0 pointer-events-none select-none overflow-hidden"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            fontSize: 'clamp(16rem, 35vw, 28rem)',
            lineHeight: 1,
            color: '#10B981',
            opacity: 0.04,
            transform: 'translate(20%, -50%)',
            letterSpacing: '-0.06em',
          }}
          aria-hidden="true"
        >
          S
        </div>

        {/* Split-screen content */}
        <div className="relative w-full z-20 flex flex-col lg:grid lg:grid-cols-[3fr_2fr] lg:gap-16 max-w-7xl mx-auto">
          {/* Left: heading */}
          <motion.div style={{ y: heroTextY }} className="flex items-center lg:items-end pb-0 lg:pb-12">
            <StaggerReveal delay={0.05}>
              <RevealItem>
                <h1
                  id="students-hero-heading"
                  className="hero-text hero-heading text-left"
                  style={{ fontSize: 'clamp(2.75rem, 6vw + 1rem, 6.5rem)' }}
                >
                  {students.heading}{' '}
                  <span className="relative inline-block text-accent-green">
                    {students.headingAccent}
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-px pointer-events-none"
                      style={{ background: 'linear-gradient(90deg, #10B981, transparent)' }}
                      aria-hidden="true"
                    />
                  </span>
                </h1>
              </RevealItem>
            </StaggerReveal>
          </motion.div>

          {/* Right: description + chips + CTAs */}
          <motion.div style={{ y: heroTextY }} className="flex flex-col justify-center lg:pt-28">
            <StaggerReveal delay={0.2}>
              <RevealItem>
                <p className="text-base sm:text-lg hero-text-muted max-w-[48ch] leading-relaxed mb-6">
                  {students.description}
                </p>
              </RevealItem>

              {/* Trust chips — all sizes */}
              <RevealItem className="flex flex-wrap gap-2 mb-8">
                {[students.pills.jobs, students.pills.events, students.pills.deals].map((label) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.22)', color: '#10B981' }}>
                    <span className="w-1 h-1 rounded-full bg-[#10B981] shrink-0" />
                    {label}
                  </span>
                ))}
              </RevealItem>

              <RevealItem className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="#mojligheter"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 28px rgba(16,185,129,0.4), 0 8px 32px rgba(0,0,0,0.3)' }}
                >
                  {students.ctaExplore}
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl hero-text-muted font-semibold text-sm hover:hero-text hover:bg-white/8 active:scale-95"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  {students.ctaEvents}
                </Link>
              </RevealItem>
            </StaggerReveal>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-30"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
      </section>

      {/* Benefits */}
      <section
        id="mojligheter"
        className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        aria-labelledby="benefits-heading"
      >
        <GradientOrb color="green" size={400} top="40%" left="75%" opacity={0.07} />
        <div className="max-w-6xl mx-auto">
          <StaggerReveal className="mb-10">
            <RevealItem className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" aria-hidden="true" />
              <h2 id="benefits-heading" className="hero-text-subtle text-sm font-bold uppercase tracking-widest whitespace-nowrap">
                {students.benefitsTitle}
              </h2>
              <div className="h-px flex-1 bg-border" aria-hidden="true" />
            </RevealItem>
          </StaggerReveal>
          <div className="flex gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory sm:snap-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="min-w-70 sm:min-w-0 flex-1 snap-center">
                <BenefitCardComponent {...b} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

    {/* Destinations hub */}
    <section
      className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-labelledby="destinations-heading"
    >
      <div className="max-w-6xl mx-auto">
        <StaggerReveal className="mb-8">
          <RevealItem className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
            <h2 id="destinations-heading" className="hero-text-subtle text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              {students.destinationsTitle}
            </h2>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </RevealItem>
        </StaggerReveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DESTINATIONS.map((d, i) => (
            <DestinationCard key={d.href} {...d} index={i} />
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
