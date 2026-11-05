'use client';

import { useId } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { CAREER_TYPES, TYPE_COLORS } from '@/lib/careerTypes';
import type { CareerFilters, FacetCounts } from '@/lib/careerFilters';
import type { CareerType, OrgType } from '@/lib/schemas/career';

interface CareerFilterPanelProps {
  filters: CareerFilters;
  onChange: (patch: Partial<CareerFilters>) => void;
  /** Sökfältet tappar fokus — spolar en väntande (debouncad) URL-skrivning */
  onSearchBlur?: () => void;
  onReset: () => void;
  options: { companies: string[]; locations: string[] };
  counts: FacetCounts;
  activeCount: number;
}

const BLUE = '#3B82F6';

const fieldCls =
  'w-full min-h-11 rounded-xl px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] ' +
  'bg-(--glass-bg-subtle) border border-(--input-border) text-(--foreground) ' +
  'focus:ring-2 focus:ring-(--text-blue)';

const labelCls = 'block text-xs font-semibold tracking-wide hero-text-muted mb-1.5';

interface ChipProps {
  active: boolean;
  label: string;
  count: number;
  color: string;
  onClick: () => void;
}

// Modulnivå — en komponent definierad inuti panelen får ny identitet per render,
// vilket remountar knapparna och tappar fokus vid klick.
// Text och räknare använder alltid neutrala text-tokens (≥4,5:1 i båda teman, även på
// accent-tinten); typfärgen bärs av punkt + kant, aldrig av texten.
function Chip({ active, label, count, color, onClick }: ChipProps) {
  const empty = count === 0 && !active;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-between gap-3 w-full min-h-11 px-3 rounded-xl text-sm text-left cursor-pointer transition-[background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue) ${active ? 'font-semibold' : 'font-medium'}`}
      style={{
        background: active ? `color-mix(in srgb, ${color} 14%, transparent)` : 'transparent',
        border: `1px solid ${active ? `color-mix(in srgb, ${color} 55%, transparent)` : 'var(--glass-border-subtle)'}`,
        color: active ? 'var(--hero-text)' : 'var(--hero-text-muted)',
      }}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: color, opacity: active ? 1 : empty ? 0.3 : 0.65 }}
          aria-hidden="true"
        />
        <span className="truncate">{label}</span>
      </span>
      <span className="text-xs tabular-nums hero-text-subtle">{count}</span>
    </button>
  );
}

/** Lägger till ett valt värde som saknas i datan (t.ex. från en delad URL) så att selecten visar det. */
function withSelected(values: string[], selected: string): string[] {
  return selected && !values.includes(selected) ? [selected, ...values] : values;
}

export function CareerFilterPanel({ filters, onChange, onSearchBlur, onReset, options, counts, activeCount }: CareerFilterPanelProps) {
  const { t } = useLanguage();
  const o = t.opportunities;
  const uid = useId();

  const orgs: { value: OrgType | 'all'; label: string }[] = [
    { value: 'all', label: o.anyOption },
    { value: 'company', label: o.orgCompany },
    { value: 'public', label: o.orgPublic },
  ];
  const companies = withSelected(options.companies, filters.company);
  const locations = withSelected(options.locations, filters.location);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor={`${uid}-q`} className={labelCls}>
          {o.searchLabel}
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--hero-text-subtle)' }}
            aria-hidden="true"
          />
          <input
            id={`${uid}-q`}
            type="text"
            enterKeyHint="search"
            autoComplete="off"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            onBlur={onSearchBlur}
            placeholder={o.searchPlaceholder}
            className={`${fieldCls} pl-9 pr-11`}
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => onChange({ q: '' })}
              aria-label={o.clearSearch}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full cursor-pointer hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue)"
            >
              <X className="w-3.5 h-3.5" style={{ color: 'var(--hero-text-subtle)' }} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div role="group" aria-label={o.filterAriaLabel}>
        <p className="text-xs font-semibold tracking-wide hero-text-muted mb-2" aria-hidden="true">{o.filterType}</p>
        <div className="space-y-1.5">
          <Chip
            active={filters.type === 'all'}
            label={o.filters.all}
            count={counts.type.all}
            color={BLUE}
            onClick={() => onChange({ type: 'all' })}
          />
          {CAREER_TYPES.map((type: CareerType) => (
            <Chip
              key={type}
              active={filters.type === type}
              label={o.filters[type]}
              count={counts.type[type]}
              color={TYPE_COLORS[type]}
              onClick={() => onChange({ type })}
            />
          ))}
        </div>
      </div>

      <div role="group" aria-label={o.filterOrg}>
        <p className="text-xs font-semibold tracking-wide hero-text-muted mb-2" aria-hidden="true">{o.filterOrg}</p>
        <div className="space-y-1.5">
          {orgs.map(({ value, label }) => (
            <Chip
              key={value}
              active={filters.org === value}
              label={label}
              count={counts.org[value]}
              color={BLUE}
              onClick={() => onChange({ org: value })}
            />
          ))}
        </div>
      </div>

      <div>
        {/* aria-labelledby i stället för htmlFor: etiketten ska inte vara ett klickmål —
            bara själva selecten är interaktiv. */}
        <label id={`${uid}-co-label`} className={labelCls}>{o.filterEmployer}</label>
        <select
          id={`${uid}-co`}
          aria-labelledby={`${uid}-co-label`}
          className={`${fieldCls} cursor-pointer`}
          value={filters.company}
          onChange={(e) => onChange({ company: e.target.value })}
        >
          <option value="">{o.anyOption}</option>
          {companies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label id={`${uid}-loc-label`} className={labelCls}>{o.filterLocation}</label>
        <select
          id={`${uid}-loc`}
          aria-labelledby={`${uid}-loc-label`}
          className={`${fieldCls} cursor-pointer`}
          value={filters.location}
          onChange={(e) => onChange({ location: e.target.value })}
        >
          <option value="">{o.anyOption}</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="w-full min-h-11 rounded-xl text-sm font-semibold cursor-pointer transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--text-blue)"
          style={{
            color: 'var(--hero-text)',
            background: `color-mix(in srgb, ${BLUE} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${BLUE} 45%, transparent)`,
          }}
        >
          {o.resetFilters}
        </button>
      )}
    </div>
  );
}
