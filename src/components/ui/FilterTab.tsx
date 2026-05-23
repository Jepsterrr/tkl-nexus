'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Maps accent hex → WCAG-safe text CSS variable (light: darker shade, dark: same hex)
const ACCENT_TEXT: Record<string, string> = {
  '#8B5CF6': 'var(--text-purple)',
  '#3B82F6': 'var(--text-blue)',
  '#10B981': 'var(--text-green)',
  '#F59E0B': 'var(--text-orange)',
  '#6366F1': 'var(--text-purple)',
  '#0EA5E9': 'var(--text-blue)',
  '#06B6D4': 'var(--text-blue)',
};

interface FilterTabProps {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
  /** Valfri logotyp (sektionsikon för Events) */
  logo?: string | null;
  /** Visa Sparkles-ikon när aktiv (Career-stil) */
  showActiveIcon?: boolean;
}

export function FilterTab({ active, onClick, label, color, logo, showActiveIcon }: FilterTabProps) {
  const textColor = ACCENT_TEXT[color] ?? color;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -1 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap min-h-[44px] transition-[background-color,border-color,color,box-shadow] duration-200"
      style={{
        background: active ? `${color}22` : 'var(--glass-bg-subtle)',
        border: `1px solid ${active ? color + '55' : 'var(--glass-border-subtle)'}`,
        color: active ? textColor : 'var(--hero-text-muted)',
        boxShadow: active ? `0 0 20px ${color}15` : 'none',
      }}
      aria-pressed={active}
    >
      {logo && (
        <img src={logo} alt="" width={16} height={16} className="object-contain" aria-hidden="true" />
      )}
      {showActiveIcon && (
        <Sparkles
          className="w-4 h-4 transition-opacity duration-200"
          style={{ color: textColor, opacity: active ? 1 : 0.35 }}
          aria-hidden="true"
        />
      )}
      {label}
    </motion.button>
  );
}
