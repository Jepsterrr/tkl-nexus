'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Copy, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { capture } from '@/lib/analytics';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { TKLDeal } from '@/lib/schemas/deal';
import { EASE_OUT_EXPO } from '@/lib/motion';

const ORANGE = '#F59E0B';

interface DealCardProps {
  deal: TKLDeal;
  idx?: number;
  variant: 'icon' | 'detail';
  onViewDetails?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function DealCard({ deal, idx = 0, variant, onViewDetails }: DealCardProps) {
  const { t, locale } = useLanguage();
  const deals = t.deals;
  const shouldReduceMotion = useReducedMotion();

  const isEnglish = locale === 'en';
  const displayTitle = isEnglish && deal.titleEn ? deal.titleEn : deal.title;
  const displayDesc = isEnglish && deal.descriptionEn ? deal.descriptionEn : deal.description;

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!deal.discountCode) return;
    navigator.clipboard.writeText(deal.discountCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      capture('deal_code_copied', {
        deal_id: deal.id,
        company: deal.company,
        discount: deal.discount,
      });
    }).catch(() => {});
  };

  const avatarLetter = deal.company.charAt(0).toUpperCase();
  const headingId = `deal-title-${deal.id}`;
  const transitionProps = { duration: 0.35, delay: Math.min(idx * 0.04, 0.4), ease: EASE_OUT_EXPO };

  const logoNode = deal.logoUrl ? (
    <img src={deal.logoUrl} alt={deal.company} className="w-full h-full object-contain" />
  ) : (
    <span className="text-2xl font-black select-none" style={{ color: 'var(--text-orange)' }}>
      {avatarLetter}
    </span>
  );

  // Icon variant
  if (variant === 'icon') {
    return (
      <motion.button
        type="button"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={transitionProps}
        whileHover={shouldReduceMotion ? {} : { y: -4, filter: `drop-shadow(0 10px 36px ${ORANGE}28)` }}
        layout
        onClick={onViewDetails}
        className="glass-card group relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center p-4 w-full cursor-pointer"
        aria-label={`${displayTitle}${deal.discount ? ` — ${deal.discount}` : ''}`}
      >
        <div className="flex-1 flex items-center justify-center w-3/5 pointer-events-none">
          {logoNode}
        </div>

        {deal.discount && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{
                background: 'var(--about-card-bg)',
                color: 'var(--text-orange)',
                border: `1px solid ${ORANGE}35`,
              }}
            >
              {deal.discount}
            </span>
          </div>
        )}

        <div
          className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${ORANGE}0e 55%, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      </motion.button>
    );
  }

  // Detail variant
  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={transitionProps}
      whileHover={shouldReduceMotion ? {} : { y: -3 }}
      layout
      className="glass-card group relative overflow-hidden rounded-2xl flex flex-col"
      aria-labelledby={headingId}
    >
      {/* Logo-yta */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: '160px', borderBottom: `1px solid ${ORANGE}1a` }}
      >
        <div className="w-36 h-24 flex items-center justify-center p-2">
          {logoNode}
        </div>

        {deal.discount && (
          <span
            className="absolute bottom-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: 'var(--about-card-bg)',
              color: 'var(--text-orange)',
              border: `1px solid ${ORANGE}35`,
            }}
          >
            {deal.discount}
          </span>
        )}

        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${ORANGE}08 55%, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Innehållsyta */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 id={headingId} className="hero-text font-semibold text-sm leading-snug line-clamp-1">
          {displayTitle}
        </h3>
        <p className="hero-text-muted text-xs leading-relaxed line-clamp-2 flex-1">
          {displayDesc}
        </p>

        <div
          className="flex items-center justify-between pt-2 mt-auto"
          style={{ borderTop: '1px solid var(--about-card-border)' }}
        >
          <div>
            {deal.discountCode ? (
              <button
                onClick={handleCopy}
                disabled={copied}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-95 disabled:cursor-default disabled:active:scale-100"
                style={{
                  background: `${ORANGE}18`,
                  border: `1px solid ${ORANGE}40`,
                  color: 'var(--text-orange)',
                }}
                aria-label={`${deals?.copyCodeAriaLabel ?? 'Kopiera rabattkod:'} ${deal.discountCode}`}
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5" />{deals?.codeCopied ?? 'Kopierat!'}</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" />{deal.discountCode}</>
                )}
              </button>
            ) : deal.link ? (
              <a
                href={deal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 hover:opacity-80"
                style={{ color: 'var(--text-orange)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  capture('deal_link_visited', {
                    deal_id: deal.id,
                    company: deal.company,
                  });
                }}
              >
                {deals?.visit ?? 'Besök'}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs hero-text-subtle italic">
                {deals?.showMembership ?? 'Visa kårlegitimation'}
              </span>
            )}
          </div>

          {onViewDetails && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(e); }}
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 hover:gap-2.5 px-2.5 py-1 rounded-lg hover:brightness-110"
              style={{
                color: 'var(--text-orange)',
                background: `${ORANGE}12`,
                border: `1px solid ${ORANGE}28`,
              }}
            >
              {deals?.visaMer ?? 'Visa mer'}
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
