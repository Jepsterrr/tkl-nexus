'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import type { TKLEventType } from '@/lib/schemas/eventType';
import { EASE_OUT_EXPO } from '@/lib/motion';

interface EventTypeCardProps {
  eventType: TKLEventType;
  locale: string;
  index: number;
  selected: boolean;
  onSelect: () => void;
}

export function EventTypeCard({ eventType, locale, index, selected, onSelect }: EventTypeCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const isEn = locale === 'en';

  const name = isEn && eventType.nameEn ? eventType.nameEn : eventType.name;
  const desc = isEn && eventType.descriptionEn ? eventType.descriptionEn : eventType.description;
  const highlights = (isEn && eventType.highlightsEn?.length
    ? eventType.highlightsEn
    : eventType.highlights
  ).slice(0, 3);

  return (
    <motion.button
      type="button"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.32),
        ease: EASE_OUT_EXPO,
      }}
      whileHover={shouldReduceMotion ? {} : { y: -2, transition: { duration: 0.15, ease: EASE_OUT_EXPO } }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97, transition: { duration: 0.1 } }}
      onClick={onSelect}
      aria-pressed={selected}
      className="text-left rounded-2xl p-4 space-y-2 cursor-pointer transition-[background,border-color,box-shadow] duration-200 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
      style={{
        background: selected ? 'rgba(59,130,246,0.09)' : 'var(--about-card-bg)',
        border: `1px solid ${selected ? 'rgba(59,130,246,0.40)' : 'var(--about-card-border)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: selected ? '0 0 24px rgba(59,130,246,0.12)' : 'none',
      }}
    >
      {/* Light-mode surface overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl light:bg-white/40" aria-hidden="true" />

      {/* Selected checkmark */}
      <AnimatePresence>
        {selected && (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full shrink-0"
            style={{ background: 'var(--text-blue)' }}
            aria-hidden="true"
          >
            <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Name */}
      <h3
        className="text-sm font-bold pr-7 leading-snug transition-colors duration-150"
        style={{ color: selected ? 'var(--text-blue)' : 'var(--hero-text)', fontFamily: 'var(--font-heading)' }}
      >
        {name}
      </h3>

      {/* Description */}
      {desc && (
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: 'var(--hero-text-muted)' }}
        >
          {desc}
        </p>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <ul className="space-y-1 pt-0.5">
          {highlights.map((h, i) => (
            <li
              key={i}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--hero-text-subtle)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200"
                style={{ background: selected ? 'var(--text-blue)' : 'var(--hero-text-subtle)' }}
                aria-hidden="true"
              />
              {h}
            </li>
          ))}
        </ul>
      )}
    </motion.button>
  );
}
