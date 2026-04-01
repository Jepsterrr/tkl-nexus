'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { BenefitCard } from '@/lib/types';
import { ACCENT_COLOR_MAP } from '@/lib/types';
import {
  BookOpen, Rocket, Target, Building2, GraduationCap, Handshake,
  CalendarDays, LayoutGrid, Gift, LucideIcon,
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
  index,
}: BenefitCardComponentProps) {
  const colors = ACCENT_COLOR_MAP[accentColor];
  const Icon = ICON_MAP[iconName] ?? LayoutGrid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.18, ease: "easeOut" } }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden p-6"
      style={{
        background: `linear-gradient(135deg, ${colors.bgStrong}, ${colors.bg})`,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Icon */}
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
        style={{
          background: `linear-gradient(135deg, ${colors.bgStrong}, ${colors.bg})`,
          border: `1px solid ${colors.border}`,
        }}
        aria-hidden="true"
      >
        <Icon className="w-6 h-6" style={{ color: colors.hex }} />
      </div>

      <h3 className="text-white font-semibold text-lg mb-2 leading-snug">{title}</h3>
      <p className="text-white/55 text-sm leading-relaxed">{description}</p>

      {linkLabel && linkHref && (
        <Link
          href={linkHref}
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium transition-colors duration-150"
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
    </motion.div>
  );
}
