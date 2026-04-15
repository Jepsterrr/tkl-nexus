'use client';

import { useRef } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Mail, MapPin, Linkedin, Instagram } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { Timeline } from '@/components/ui/Timeline';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { CONTACT_ITEMS } from '@/lib/types';

export function AboutContent() {
  const { t } = useLanguage();
  const { about } = t;

  const CONTACT_ITEMS_ABOUT: { Icon: LucideIcon; label: string; href: string; external: boolean }[] = [
    {
      Icon: Mail,
      label: CONTACT_ITEMS[0].label,
      href: CONTACT_ITEMS[0].href,
      external: CONTACT_ITEMS[0].external,
    },
    {
      Icon: MapPin,
      label: about.contactAddress,
      href: 'https://maps.google.com/?q=Tekniktorget+3+Luleå',
      external: true,
    },
    {
      Icon: Linkedin,
      label: CONTACT_ITEMS[1].label,
      href: CONTACT_ITEMS[1].href,
      external: CONTACT_ITEMS[1].external,
    },
    {
      Icon: Instagram,
      label: CONTACT_ITEMS[2].label,
      href: CONTACT_ITEMS[2].href,
      external: CONTACT_ITEMS[2].external,
    },
  ];

  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const scrollContainer = useScrollContainer();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: scrollContainer,
    offset: ['start start', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-25%']);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-8%']);

  const TIMELINE_ITEMS = [
    { year: '2019', title: about.timeline.founded.title, description: about.timeline.founded.desc },
    { year: '2021', title: about.timeline.firstEvent.title, description: about.timeline.firstEvent.desc },
    { year: '2023', title: about.timeline.portal.title, description: about.timeline.portal.desc },
    { year: '2024', title: about.timeline.deals.title, description: about.timeline.deals.desc },
    { year: '2025', title: about.timeline.growth.title, description: about.timeline.growth.desc },
  ];

  return (
    <>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-svh flex flex-col justify-center overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8"
        aria-labelledby="hero-heading"
      >
        {/* Depth-0: Far atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(227,6,19,0.10) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 85% 75%, rgba(227,6,19,0.06) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />
        <motion.div style={{ y: orbY }} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <GradientOrb color="red" size={600} top="30%" left="50%" opacity={0.12} animClass="animate-orb-float" />
          <GradientOrb color="red" size={300} top="70%" left="15%" opacity={0.08} animClass="animate-orb-float-reverse" />
        </motion.div>

        <motion.div style={{ y: heroTextY }} className="relative max-w-4xl mx-auto w-full">
          <StaggerReveal className="text-center" delay={0.1}>
            <RevealItem className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: 'rgba(227, 6, 19, 0.2)',
                  border: '1px solid rgba(227, 6, 19, 0.3)',
                  color: '#E30613',
                }}
              >
                <span aria-hidden="true">⬡</span>
                {about.badge}
              </span>
            </RevealItem>

            <RevealItem>
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold hero-text leading-[1.1] tracking-tight"
              >
                {about.heading}{' '}
                <span className="text-gradient-red">{about.headingAccent}</span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mt-6 text-base sm:text-lg hero-text-muted max-w-2xl mx-auto leading-relaxed">
                {about.description}
              </p>
            </RevealItem>

            <RevealItem className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Link
                href="#kontakt"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #E30613, #ff4d5a)',
                  boxShadow: '0 0 28px rgba(227, 6, 19, 0.4), 0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                {about.ctaContact}
              </Link>
            </RevealItem>
          </StaggerReveal>
        </motion.div>

        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
      </section>

      {/* About + Contact cards */}
      <section
        className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        aria-labelledby="about-heading"
      >
        <GradientOrb color="red" size={350} top="30%" left="80%" opacity={0.07} />
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vad är TKL Nexus? */}
            <StaggerReveal>
              <RevealItem>
                <div
                  className="h-full rounded-2xl p-6 sm:p-8"
                  style={{
                    background: 'var(--about-card-bg)',
                    border: '1px solid var(--about-card-border)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <h2 id="about-heading" className="text-xl sm:text-2xl font-bold hero-text mb-4">
                    {about.whatIsTitle}
                  </h2>
                  <div className="space-y-4 hero-text-muted text-sm sm:text-base leading-relaxed">
                    <p>{about.whatIs.p1}</p>
                    <p>{about.whatIs.p2}</p>
                    <p>{about.whatIs.p3}</p>
                  </div>
                </div>
              </RevealItem>
            </StaggerReveal>

            {/* Kontakt */}
            <StaggerReveal delay={0.15}>
              <RevealItem>
                <div
                  id="kontakt"
                  className="h-full rounded-2xl p-6 sm:p-8"
                  style={{
                    background: 'var(--about-card-bg)',
                    border: '1px solid var(--about-card-border)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <h2 className="text-xl sm:text-2xl font-bold hero-text mb-6">{about.contactTitle}</h2>
                  <ul className="space-y-4" role="list">
                    {CONTACT_ITEMS_ABOUT.map(({ Icon, label, href, external }) => (
                      <li key={label}>
                        <a
                          href={href}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-4 group"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold transition-all duration-200 group-hover:scale-110"
                            style={{
                              background: 'rgba(227,6,19,0.15)',
                              border: '1px solid rgba(227,6,19,0.25)',
                              color: '#E30613',
                            }}
                            aria-hidden="true"
                          >
                            <Icon className="w-5 h-5" style={{ color: '#E30613' }} strokeWidth={1.5} />
                          </div>
                          <span className="hero-text-muted text-sm group-hover:text-[var(--hero-text)] transition-colors duration-150">
                            {label}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            </StaggerReveal>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="timeline-heading">
        <div className="max-w-4xl mx-auto">
          <StaggerReveal>
            <RevealItem>
              <h2 id="timeline-heading" className="text-center text-sm font-mono uppercase tracking-[0.15em] text-muted-foreground mb-14">
                {about.timelineTitle}
              </h2>
            </RevealItem>
          </StaggerReveal>
          <Timeline items={TIMELINE_ITEMS} />
        </div>
      </section>

      <section className="py-10 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <StaggerReveal>
            <RevealItem>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8">
                {about.reachOutTitle}
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {CONTACT_ITEMS_ABOUT.map(({ label, href, external }) => (
                  <a
                    key={href}
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="px-5 py-2.5 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 glass-panel"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </RevealItem>
          </StaggerReveal>
        </div>
      </section>
    </>
  );
}
