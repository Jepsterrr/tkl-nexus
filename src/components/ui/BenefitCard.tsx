'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { BenefitCard } from '@/lib/types';
import { ACCENT_COLOR_MAP } from '@/lib/types';
import {
  BookOpen, Rocket, Target, Building2, GraduationCap, Handshake,
  CalendarDays, LayoutGrid, Gift, LucideIcon, ArrowRight,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen, Rocket, Target, Building2, GraduationCap, Handshake,
  CalendarDays, LayoutGrid, Gift,
};

interface BenefitCardComponentProps extends BenefitCard {
  index: number;
}

export function BenefitCardComponent({
  title,
  description,
  iconName,
  accentColor,
  linkLabel,
  linkHref,
  featured,
  index,
}: BenefitCardComponentProps) {
  const colors = ACCENT_COLOR_MAP[accentColor];
  const Icon = ICON_MAP[iconName] ?? LayoutGrid;

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, delay: 0, ease: [0.16, 1, 0.3, 1] }}
        className="group relative rounded-2xl overflow-hidden p-7 sm:p-8 h-full"
        style={{
          background: `linear-gradient(135deg, ${colors.bgStrong}, ${colors.bg})`,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Light mode: white glass overlay for visual substance */}
        <div className="absolute inset-0 light:bg-white/50 pointer-events-none" aria-hidden="true" />

        {/* Bakgrundssiffra — featured, dramatiskt stor */}
        <span
          className="absolute bottom-0 right-4 font-bold pointer-events-none select-none leading-none"
          style={{
            fontSize: '9rem',
            color: colors.hex,
            opacity: 0.08,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 0.85,
          }}
          aria-hidden="true"
        >
          01
        </span>

        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(ellipse at 20% 0%, ${colors.glow} 0%, transparent 65%)` }}
          aria-hidden="true"
        />

        {/* Layout: vertikal på mobil, horisontell på sm+ */}
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Ikon-block */}
          <div className="shrink-0">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${colors.bgStrong}, rgba(0,0,0,0.15))`,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 0 24px ${colors.glow}`,
              }}
              aria-hidden="true"
            >
              <Icon className="w-8 h-8" style={{ color: colors.hex }} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold hero-text mb-2 leading-tight"
              style={{ fontSize: 'clamp(1.25rem, 2vw + 0.5rem, 1.625rem)' }}
            >
              {title}
            </h3>
            <p className="hero-text-muted text-sm leading-relaxed mb-4 max-w-prose">
              {description}
            </p>

            {linkLabel && linkHref && (
              <Link
                href={linkHref}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-150 group/link"
                style={{ color: colors.hex }}
              >
                {linkLabel}
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-150 group-hover/link:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.18, ease: 'easeOut' } }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden p-6 h-full"
      style={{
        background: `linear-gradient(135deg, ${colors.bgStrong}, ${colors.bg})`,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Light mode: white glass overlay for visual substance */}
      <div className="absolute inset-0 light:bg-white/50 pointer-events-none" aria-hidden="true" />

      {/* Ikon — neutral bakgrund för tydlig kontrast */}
      <div
        className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${colors.border}`,
        }}
        aria-hidden="true"
      >
        <Icon className="w-5 h-5" style={{ color: colors.hex }} />
      </div>

      <h3 className="hero-text font-semibold text-base mb-2 leading-snug">{title}</h3>
      <p className="hero-text-muted text-sm leading-relaxed">{description}</p>

      {linkLabel && linkHref && (
        <Link
          href={linkHref}
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium transition-colors duration-150"
          style={{ color: colors.hex }}
        >
          {linkLabel} →
        </Link>
      )}

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% 0%, ${colors.glow} 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Bakgrundssiffra */}
      <span
        className="absolute bottom-2 right-3 font-bold pointer-events-none select-none leading-none"
        style={{
          fontSize: '4.5rem',
          color: colors.hex,
          opacity: 0.1,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')}
      </span>
    </motion.div>
  );
}
