'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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
        color: active ? color : 'var(--hero-text-muted)',
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
          style={{ color, opacity: active ? 1 : 0.35 }}
          aria-hidden="true"
        />
      )}
      {label}
    </motion.button>
  );
}
