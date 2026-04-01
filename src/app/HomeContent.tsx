'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { HeroSection } from '@/components/sections/HeroSection';
import { BenefitCardComponent } from '@/components/ui/BenefitCard';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import type { BenefitCard } from '@/lib/types';

export function HomeContent() {
  const { t } = useLanguage();
  const { home } = t;

  const FEATURES: BenefitCard[] = [
    {
      title: home.features.students.title,
      description: home.features.students.description,
      iconName: 'GraduationCap',
      accentColor: 'green',
      linkLabel: home.features.students.linkLabel,
      linkHref: '/students',
    },
    {
      title: home.features.corporate.title,
      description: home.features.corporate.description,
      iconName: 'Building2',
      accentColor: 'purple',
      linkLabel: home.features.corporate.linkLabel,
      linkHref: '/corporate',
    },
    {
      title: home.features.about.title,
      description: home.features.about.description,
      iconName: 'Handshake',
      accentColor: 'red',
      linkLabel: home.features.about.linkLabel,
      linkHref: '/about',
    },
  ];

  return (
    <>
      <HeroSection
        badge={home.badge}
        heading={home.heading}
        headingAccent={home.headingAccent}
        description={home.description}
        ctas={[
          { label: home.ctaStudents, href: '/students', variant: 'primary' },
          { label: home.ctaCorporate, href: '/corporate', variant: 'secondary' },
        ]}
        accentColor="red"
      />

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((f, i) => (
              <BenefitCardComponent key={f.title} {...f} index={i} />
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
                className="shrink-0 px-8 py-3.5 rounded-2xl bg-linear-to-r from-[#E30613] to-[#c00510] text-white font-semibold text-sm sm:text-base hover:scale-105 hover:shadow-lg hover:shadow-[#E30613]/30 transition-all active:scale-95"
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
