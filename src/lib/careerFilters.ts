import { z } from 'zod';
import { CareerTypeSchema, OrgTypeSchema, type TKLCareer, type CareerType, type OrgType } from './schemas/career';

export type CareerFilters = {
  type: CareerType | 'all';
  org: OrgType | 'all';
  /** Tom sträng = alla arbetsgivare */
  company: string;
  /** Tom sträng = alla orter */
  location: string;
  q: string;
};

export const DEFAULT_FILTERS: CareerFilters = { type: 'all', org: 'all', company: '', location: '', q: '' };

const TYPE_VALUES: readonly string[] = CareerTypeSchema.options;
const ORG_VALUES: readonly string[] = OrgTypeSchema.options;

/** Annonser utan orgType räknas som företag. */
export function orgOf(job: TKLCareer): OrgType {
  return job.orgType ?? 'company';
}

export function parseFilters(params: URLSearchParams): CareerFilters {
  const type = params.get('type') ?? '';
  const org = params.get('org') ?? '';
  return {
    type: TYPE_VALUES.includes(type) ? (type as CareerType) : 'all',
    org: ORG_VALUES.includes(org) ? (org as OrgType) : 'all',
    company: params.get('company') ?? '',
    location: params.get('location') ?? '',
    q: params.get('q') ?? '',
  };
}

/** Skriver filter till params; standardvärden tas bort, övriga params (t.ex. `id`) bevaras. */
export function serializeFilters(f: CareerFilters, base: URLSearchParams = new URLSearchParams()): URLSearchParams {
  const p = new URLSearchParams(base);
  const put = (key: string, value: string, empty: string) => {
    if (value === empty) p.delete(key);
    else p.set(key, value);
  };
  put('type', f.type, 'all');
  put('org', f.org, 'all');
  put('company', f.company, '');
  put('location', f.location, '');
  put('q', f.q.trim(), '');
  return p;
}

type Skip = 'type' | 'org' | null;

function matches(job: TKLCareer, f: CareerFilters, skip: Skip): boolean {
  if (skip !== 'type' && f.type !== 'all' && job.type !== f.type) return false;
  if (skip !== 'org' && f.org !== 'all' && orgOf(job) !== f.org) return false;
  if (f.company && job.company !== f.company) return false;
  if (f.location && job.location !== f.location) return false;
  const q = f.q.trim().toLowerCase();
  if (q) {
    const hay = [job.title, job.titleEn ?? '', job.company, job.location, job.description ?? '', job.descriptionEn ?? '']
      .join(' ')
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function applyFilters(jobs: TKLCareer[], f: CareerFilters): TKLCareer[] {
  return jobs.filter((j) => matches(j, f, null));
}

export function deriveOptions(jobs: TKLCareer[]): { companies: string[]; locations: string[] } {
  const uniq = (values: string[]) =>
    Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'sv'));
  return { companies: uniq(jobs.map((j) => j.company)), locations: uniq(jobs.map((j) => j.location)) };
}

// Uttömmande record-scheman (Zod v4: enum-nycklar kräver ALLA nycklar) — nollobjekten
// byggs från schemats options, så en ny annonstyp kan aldrig saknas i räkningen.
const TypeCountsSchema = z.record(CareerTypeSchema.or(z.literal('all')), z.number());
const OrgCountsSchema = z.record(OrgTypeSchema.or(z.literal('all')), z.number());

export type FacetCounts = {
  type: z.infer<typeof TypeCountsSchema>;
  org: z.infer<typeof OrgCountsSchema>;
};

const zeros = (keys: readonly string[]) => Object.fromEntries(['all', ...keys].map((k) => [k, 0]));

/** Antal per facettvärde, där facetten själv ignoreras men övriga filter gäller. */
export function facetCounts(jobs: TKLCareer[], f: CareerFilters): FacetCounts {
  const type = TypeCountsSchema.parse(zeros(CareerTypeSchema.options));
  const org = OrgCountsSchema.parse(zeros(OrgTypeSchema.options));
  for (const j of jobs) {
    if (matches(j, f, 'type')) {
      type.all += 1;
      type[j.type] += 1;
    }
    if (matches(j, f, 'org')) {
      org.all += 1;
      org[orgOf(j)] += 1;
    }
  }
  return { type, org };
}

export function activeFilterCount(f: CareerFilters): number {
  return [f.type !== 'all', f.org !== 'all', !!f.company, !!f.location, !!f.q.trim()].filter(Boolean).length;
}
