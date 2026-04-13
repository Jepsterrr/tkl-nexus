'use client';

import Link from 'next/link';
import { StarField } from '@/components/ui/StarField';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import type { HeroProps, AccentColor } from '@/lib/types';
import { ACCENT_COLOR_MAP } from '@/lib/types';

// Icons per accentColor badge
const BADGE_ICONS: Record<AccentColor, string> = {
  red: '⬡',
  purple: '◆',
  green: '◎',
  blue: '⬢',
  orange: '',
};

export function HeroSection({
  badge,
  heading,
  headingAccent,
  description,
  ctas,
  accentColor,
}: HeroProps) {
  const colors = ACCENT_COLOR_MAP[accentColor];

  return (
    <section
      className="relative min-h-svh flex flex-col justify-center overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8"
      aria-labelledby="hero-heading"
    >
      {/* Cosmic background */}
      <StarField />
      <GradientOrb color={accentColor} size={600} top="30%" left="50%" opacity={0.12} animClass="animate-orb-float" />
      <GradientOrb color="red" size={300} top="70%" left="15%" opacity={0.08} animClass="animate-orb-float-reverse" />

      <div className="relative max-w-4xl mx-auto w-full">
        <StaggerReveal className="text-center" delay={0.1}>
          {/* Badge */}
          {badge && (
            <RevealItem className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: colors.bgStrong,
                  border: `1px solid ${colors.border}`,
                  color: colors.hex,
                }}
              >
                <span aria-hidden="true">{BADGE_ICONS[accentColor]}</span>
                {badge}
              </span>
            </RevealItem>
          )}

          {/* Heading */}
          <RevealItem>
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold hero-text leading-[1.1] tracking-tight"
            >
              {heading}{' '}
              <span className={colors.textClass}>
                {headingAccent}
              </span>
            </h1>
          </RevealItem>

          {/* Description */}
          <RevealItem>
            <p className="mt-6 text-base sm:text-lg hero-text-muted max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </RevealItem>

          {/* CTAs */}
          {ctas.length > 0 && (
            <RevealItem className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              {ctas.map((cta, i) => {
                if (cta.variant === 'primary') {
                  return (
                    <Link
                      key={cta.href}
                      href={cta.href}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent w-full sm:w-auto"
                      style={{
                        background: colors.gradient,
                        boxShadow: `0 0 28px ${colors.glow}, 0 8px 32px rgba(0,0,0,0.3)`,
                      }}
                    >
                      {cta.label}
                    </Link>
                  );
                }
                if (cta.variant === 'secondary') {
                  return (
                    <Link
                      key={cta.href}
                      href={cta.href}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl hero-text-muted font-semibold text-sm sm:text-base transition-all duration-200 hover:hero-text hover:bg-white/8 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 w-full sm:w-auto"
                      style={{
                        border: `1px solid rgba(255,255,255,0.15)`,
                      }}
                    >
                      {cta.label}
                    </Link>
                  );
                }
                // Ghost
                return (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white/50 font-medium text-sm hover:text-white transition-colors w-full sm:w-auto"
                  >
                    {cta.label}
                  </Link>
                );
              })}
            </RevealItem>
          )}
        </StaggerReveal>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--cosmic-bg))' }}
        aria-hidden="true"
      />
    </section>
  );
}
