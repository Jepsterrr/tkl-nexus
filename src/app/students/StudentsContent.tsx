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

  // Parallax scroll for hero orb
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-30%']);
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
      label: 'Events',
      description: 'Arbetsmarknadsdagar, mingel och sektionsaktiviteter.',
      Icon: CalendarDays,
      accentColor: '#8B5CF6',
    },
    {
      href: '/career',
      label: 'Jobb & Exjobb',
      description: 'Exjobb, praktik och traineemöjligheter vid LTU-anslutna företag.',
      Icon: Briefcase,
      accentColor: '#10B981',
    },
    {
      href: 'students/deals',
      label: 'Nexus Deals',
      description: 'Exklusiva rabatter och förmåner för kårmedlemmar.',
      Icon: GraduationCap,
      accentColor: '#F59E0B',
    },
  ];

  return (
    <>
      {/*  Hero (Epic Design: 3-layer parallax) */}
      <section
        ref={heroRef}
        className="relative min-h-svh flex flex-col justify-center overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8"
        aria-labelledby="students-hero-heading"
      >
        {/* Depth-0: Far atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 5% 10%, rgba(16,185,129,0.10) 0%, transparent 60%),' +
              'radial-gradient(ellipse 70% 60% at 90% 80%, rgba(16,185,129,0.06) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        {/* Depth-1: Parallax orbs */}
        <motion.div style={{ y: orbY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <GradientOrb color="green" size={600} top="30%" left="60%" opacity={0.12} animClass="animate-orb-float" />
          <GradientOrb color="purple" size={280} top="70%" left="8%" opacity={0.07} animClass="animate-orb-float-reverse" />
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),' +
                'linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </motion.div>

        {/* Depth-2: Floating accent shapes */}
        <motion.div
          className="absolute top-24 right-[12%] w-2 h-2 rounded-full pointer-events-none"
          style={{ background: '#10B981', boxShadow: '0 0 12px #10B981' }}
          animate={shouldReduceMotion ? {} : {
            y: [0, -12, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-32 left-[15%] w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{ background: '#8B5CF6', boxShadow: '0 0 8px #8B5CF6' }}
          animate={shouldReduceMotion ? {} : {
            y: [0, 10, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          aria-hidden="true"
        />

        {/* Depth-4: Content */}
        <motion.div style={{ y: heroTextY }} className="relative max-w-4xl mx-auto w-full">
          <StaggerReveal className="text-center" delay={0.1}>
            <RevealItem className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10B981',
                }}
              >
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                {students.badge}
              </span>
            </RevealItem>

            <RevealItem>
              <h1
                id="students-hero-heading"
                className="text-4xl sm:text-5xl md:text-7xl font-bold hero-text leading-[1.05] tracking-tight"
              >
                {students.heading}{' '}
                <span
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #34D399)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {students.headingAccent}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, #10B981, #34D399, transparent)' }}
                    aria-hidden="true"
                  />
                </span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mt-6 text-base sm:text-lg md:text-xl hero-text-muted max-w-2xl mx-auto leading-relaxed">
                {students.description}
              </p>
            </RevealItem>

            <RevealItem className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Link
                href="#mojligheter"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  boxShadow: '0 0 28px rgba(16,185,129,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                {students.ctaExplore}
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl hero-text-muted font-semibold text-sm sm:text-base hover:hero-text hover:bg-white/8 active:scale-95 w-full sm:w-auto"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Events
              </Link>
            </RevealItem>
          </StaggerReveal>
        </motion.div>

        {/* Depth-5: Foreground fade-out */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
      </section>

      {/* Benefits */}
      <section
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
              <div key={b.title} className="min-w-70 sm:min-w-0 flex-1 snap-center" style={{ marginTop: `${i * 24}px` }}>
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
              Dina ingångar
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
