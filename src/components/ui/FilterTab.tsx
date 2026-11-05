'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Accenthex → WCAG-säker texttoken. Bara purple används (Events "Alla sektioner");
// övriga anropare skickar sektionsfärger (gul/grå/marin/mörkröd) som saknar token.
const ACCENT_TEXT: Record<string, string> = {
  '#8B5CF6': 'var(--text-purple)',
};

// Rå sektionshex som text är oläslig (marinblå #172191 ~1,3:1 på mörk bg, gul faller i
// ljust tema) — blanda mot --hero-text, samma princip som EventCards sectionText.
const safeText = (color: string) => ACCENT_TEXT[color] ?? `color-mix(in srgb, ${color} 45%, var(--hero-text))`;

interface FilterTabProps {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
  /** Valfri logotyp (sektionsikon för Events) */
  logo?: string | null;
}

export function FilterTab({ active, onClick, label, color, logo }: FilterTabProps) {
  const textColor = safeText(color);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -1 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap min-h-11 transition-[background-color,border-color,color,box-shadow] duration-200"
      style={{
        background: active ? `${color}22` : 'var(--glass-bg-subtle)',
        border: `1px solid ${active ? color + '55' : 'var(--glass-border-subtle)'}`,
        color: active ? textColor : 'var(--hero-text-muted)',
        boxShadow: active ? `0 0 20px ${color}15` : 'none',
      }}
      aria-pressed={active}
    >
      {logo && (
        <img src={logo} alt="" width={16} height={16} className="object-contain" aria-hidden="true" loading="lazy" decoding="async" />
      )}
      {label}
    </motion.button>
  );
}
