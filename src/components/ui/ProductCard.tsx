'use client';

import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { TKLProduct } from '@/lib/schemas/product';

interface ProductCardProps {
  product: TKLProduct;
  accentColor?: string;
}

export function ProductCard({ product, accentColor = '#8B5CF6' }: ProductCardProps) {
  const { locale, t } = useLanguage();
  const name = locale === 'en' && product.nameEn ? product.nameEn : product.name;
  const description = locale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  const highlights = locale === 'en' && product.highlightsEn.length > 0 ? product.highlightsEn : product.highlights;
  const price = locale === 'en' && product.priceEn ? product.priceEn : product.price;

  return (
    <article className="glass-card rounded-2xl p-5 flex flex-col gap-3 h-full">
      {/* Accent dot + name */}
      <div className="flex items-start gap-2.5">
        <span
          className="mt-1 shrink-0 w-2 h-2 rounded-full"
          style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}60` }}
          aria-hidden="true"
        />
        <h3 className="text-sm font-bold hero-text leading-snug">
          {name}
        </h3>
      </div>

      {description && (
        <p className="text-sm hero-text-muted leading-relaxed flex-1">{description}</p>
      )}

      {highlights.length > 0 && (
        <ul className="space-y-1.5 pt-1">
          {highlights.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-xs hero-text-muted">
              <CheckCircle2
                className="w-3.5 h-3.5 mt-0.5 shrink-0"
                style={{ color: accentColor }}
                aria-hidden="true"
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {price && (
        <p
          className="text-xs font-semibold hero-text-muted mt-auto pt-3"
          style={{ borderTop: '1px solid var(--glass-border-subtle)' }}
        >
          {t.services.costLabel}{' '}
          <span className="hero-text">{price}</span>
        </p>
      )}
    </article>
  );
}
