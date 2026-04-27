'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { TKLDeal } from '@/lib/schemas/deal';
import { EASE_OUT_EXPO } from '@/lib/motion';

const ORANGE = '#F59E0B';

interface DealCardProps {
  deal: TKLDeal;
  idx?: number;
}

export function DealCard({ deal, idx = 0 }: DealCardProps) {
  const { t, locale } = useLanguage();
  const deals = t.deals;
  const shouldReduceMotion = useReducedMotion();

  const isEnglish = locale === 'en';
  const displayTitle = isEnglish && deal.titleEn ? deal.titleEn : deal.title;
  const displayDesc = isEnglish && deal.descriptionEn ? deal.descriptionEn : deal.description;

  // Kopiera rabattkod
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!deal.discountCode) return;
    navigator.clipboard.writeText(deal.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Avatar: antingen logotyp eller initial
  const avatarLetter = deal.company.charAt(0).toUpperCase();

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.35, delay: idx * 0.05, ease: EASE_OUT_EXPO }}
      whileHover={shouldReduceMotion ? {} : { y: -3 }}
      layout
      className="glass-card group relative overflow-hidden rounded-2xl flex flex-row items-stretch"
      aria-label={displayTitle}
    >
      {/* Shimmer-animation vid hover */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${ORANGE}12 50%, transparent 60%)`,
          backgroundSize: '200% 100%',
        }}
        aria-hidden="true"
      />

      {/* Avatar / Logotyp - vänster kolumn */}
      <div
        className="shrink-0 w-20 flex items-center justify-center m-4 rounded-xl self-stretch"
        style={{ background: `${ORANGE}15`, border: `1px solid ${ORANGE}30` }}
        aria-hidden="true"
      >
        {deal.logoUrl ? (
          <img
            src={deal.logoUrl}
            alt=""
            className="w-12 h-12 object-contain rounded-lg"
          />
        ) : (
          <span
            className="text-2xl font-black select-none"
            style={{ color: ORANGE, textShadow: `0 0 20px ${ORANGE}` }}
          >
            {avatarLetter}
          </span>
        )}
      </div>

      {/* Innehåll - höger kolumn */}
      <div className="flex flex-col justify-between flex-1 py-4 pr-4 min-w-0">
        {/* Topp: company */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-medium hero-text-subtle truncate">{deal.company}</span>
        </div>

        {/* Rubrik */}
        <h3 className="hero-text font-semibold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-foreground transition-colors">
          {displayTitle}
        </h3>

        {/* Beskrivning */}
        <p className="hero-text-muted text-xs leading-relaxed line-clamp-2 mb-3">
          {displayDesc}
        </p>

        {/* Botten: rabatt-info + CTA */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Rabatttext */}
          {deal.discount && (
            <span
              className="text-xs font-bold"
              style={{ color: ORANGE }}
            >
              {deal.discount}
            </span>
          )}

          {/* Rabattkod - om tillgänglig */}
          {deal.discountCode ? (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{
                background: `${ORANGE}18`,
                border: `1px solid ${ORANGE}40`,
                color: ORANGE,
              }}
              aria-label={`Kopiera rabattkod: ${deal.discountCode}`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {deals?.codeCopied ?? 'Kopierat!'}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  {deal.discountCode}
                </>
              )}
            </button>
          ) : deal.link ? (
            /* Automatisk deal (t.ex. STUK) - öppna länk */
            <a
              href={deal.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:gap-2 hover:opacity-80"
              style={{ color: ORANGE }}
              onClick={(e) => e.stopPropagation()}
            >
              {deals?.visit ?? 'Besök'}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            /* Automatisk deal utan länk - visa kårlegitimation-info */
            <span className="text-xs hero-text-subtle italic">
              {deals?.showMembership ?? 'Visa kårlegitimation'}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
