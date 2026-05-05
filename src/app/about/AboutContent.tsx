'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Mail, MapPin, Linkedin, Instagram } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { useImageLoad } from '@/lib/hooks/useImageLoad';
import { HeroPhotoLayer } from '@/components/ui/HeroPhotoLayer';
import { getTimelineItems } from '@/lib/services/settings';
import type { TimelineItem } from '@/lib/schemas/settings';
import { Timeline } from '@/components/ui/Timeline';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { CONTACT_ITEMS } from '@/lib/types';

export function AboutContent() {
  const { t, locale } = useLanguage();
  const { about } = t;
  const { contact, about: about_settings, heroImages } = useSettings();

  const [timelineItems, setTimelineItems] = useState<TimelineItem[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getTimelineItems()
      .then((items) => {
        if (!cancelled) setTimelineItems(items);
      })
      .catch(() => {
        /* keep null — use i18n fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const email = contact?.email ?? CONTACT_ITEMS[0].label;
  const emailHref = contact?.email
    ? `mailto:${contact.email}`
    : CONTACT_ITEMS[0].href;
  const address = contact?.address ?? about.contactAddress;
  const addressHref = contact?.address
    ? `https://maps.google.com/?q=${encodeURIComponent(contact.address)}`
    : 'https://maps.google.com/?q=Tekniktorget+3+Luleå';
  const linkedin = contact?.linkedin || CONTACT_ITEMS[1].href;
  const instagram = contact?.instagram || CONTACT_ITEMS[2].href;

  const CONTACT_ITEMS_ABOUT: { Icon: LucideIcon; label: string; href: string; external: boolean }[] = [
    {
      Icon: Mail,
      label: email,
      href: emailHref,
      external: CONTACT_ITEMS[0].external,
    },
    {
      Icon: MapPin,
      label: address,
      href: addressHref,
      external: true,
    },
    {
      Icon: Linkedin,
      label: CONTACT_ITEMS[1].label,
      href: linkedin,
      external: CONTACT_ITEMS[1].external,
    },
    {
      Icon: Instagram,
      label: CONTACT_ITEMS[2].label,
      href: instagram,
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
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '-8%']);

  const bgUrl = heroImages?.aboutUrl || '/images/heroes/about.svg';
  const imgLoaded = useImageLoad(bgUrl);

  const campusUrl = about_settings?.campusPhotoUrl || '/images/about/campus.png';
  const campusLoaded = useImageLoad(campusUrl);

  const TIMELINE_ITEMS =
    timelineItems && timelineItems.length > 0
      ? timelineItems.map((item) => ({
          year: item.year,
          title: locale === 'sv' ? item.titleSv : item.titleEn,
          description: locale === 'sv' ? item.descSv : item.descEn,
        }))
      : [
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
        aria-labelledby="about-hero-heading"
      >
        <HeroPhotoLayer url={bgUrl} isLoaded={imgLoaded} />

        {/* Depth-0: atmospheric radials */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 80% 15%, rgba(227,6,19,0.10) 0%, transparent 55%),' +
              'radial-gradient(ellipse 45% 40% at 5% 80%, rgba(139,92,246,0.06) 0%, transparent 55%)',
          }}
          aria-hidden="true"
        />

        {/* Depth-1: horizontal ruled lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(227,6,19,0.05) 0px, rgba(227,6,19,0.05) 1px, transparent 1px, transparent 48px)',
          }}
          aria-hidden="true"
        />

        {/* Depth-2: parallax orbs */}
        <GradientOrb color="red" size={620} top="10%" left="65%" opacity={0.10} animClass="animate-orb-float" />
        <GradientOrb color="purple" size={280} top="65%" left="80%" opacity={0.07} animClass="animate-orb-float-reverse" />
        <GradientOrb color="red" size={200} top="40%" left="0%" opacity={0.06} animClass="animate-orb-float" />

        {/* Giant "01" watermark */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none select-none overflow-hidden"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            fontSize: 'clamp(12rem, 22vw, 20rem)',
            lineHeight: 1,
            letterSpacing: '-0.06em',
            color: '#E30613',
            opacity: 0.08,
            transform: 'translate(8%, 15%)',
          }}
          aria-hidden="true"
        >
          01
        </div>

        <motion.div style={{ y: heroTextY }} className="relative max-w-4xl mx-auto w-full z-20">
          <StaggerReveal className="text-left" delay={0.1}>

            {/* Typografisk caption — ersätter badge-pill */}
            <RevealItem>
              <p
                className="text-xs font-mono uppercase tracking-[0.2em] mb-5 opacity-55"
                style={{ color: '#E30613' }}
              >
                Est. 2025 · TKL NEXUS
              </p>
            </RevealItem>

            {/* Rubrik — andra raden indenterad för redaktionell känsla */}
            <RevealItem>
              <h1
                id="about-hero-heading"
                className="hero-text hero-heading"
                style={{ fontSize: 'clamp(2.75rem, 6vw + 0.5rem, 6.5rem)', lineHeight: 0.95 }}
              >
                {about.heading}
                <br />
                <span className="text-accent-red pl-8 sm:pl-16">{about.headingAccent}</span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mt-8 text-base sm:text-lg hero-text-muted max-w-[52ch] leading-relaxed">
                {about.description}
              </p>
            </RevealItem>

            <RevealItem className="flex mt-10">
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
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-30"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          animate={shouldReduceMotion ? {} : { y: [0, 7, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <div className="w-px h-10 mx-auto rounded-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(227,6,19,0.5))' }} />
        </motion.div>
      </section>

      {/* Campus photo */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-8" aria-labelledby="campus-photo-heading">
        <div className="max-w-6xl mx-auto">
          <StaggerReveal>
            <RevealItem>
              <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '16/7' }}>
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: campusLoaded ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    backgroundImage: `url(${campusUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--cosmic-bg) 100%)' }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to right, var(--cosmic-bg), transparent 20%, transparent 80%, var(--cosmic-bg))' }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
                  <p
                    id="campus-photo-heading"
                    className="text-xs font-mono uppercase tracking-widest mb-1"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {about.campusLabel}
                  </p>
                  <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {about.campusSubtitle}
                  </p>
                </div>
              </div>
            </RevealItem>
          </StaggerReveal>
        </div>
      </section>

      {/* About + Contact cards */}
      <section
        className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        aria-labelledby="about-heading"
      >
        <GradientOrb color="red" size={350} top="30%" left="80%" opacity={0.07} />
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vad är TKL NEXUS? */}
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
                    <p>{(locale === 'sv' ? about_settings?.whatIsP1Sv : about_settings?.whatIsP1En) ?? about.whatIs.p1}</p>
                    <p>{(locale === 'sv' ? about_settings?.whatIsP2Sv : about_settings?.whatIsP2En) ?? about.whatIs.p2}</p>
                    <p>{(locale === 'sv' ? about_settings?.whatIsP3Sv : about_settings?.whatIsP3En) ?? about.whatIs.p3}</p>
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
                          <span className="hero-text-muted text-sm group-hover:text-(--hero-text) transition-colors duration-150">
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
