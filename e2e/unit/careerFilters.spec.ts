import { test, expect } from '@playwright/test';
import {
  DEFAULT_FILTERS, parseFilters, serializeFilters, applyFilters,
  deriveOptions, facetCounts, activeFilterCount, orgOf,
} from '../../src/lib/careerFilters';
import type { TKLCareer } from '../../src/lib/schemas/career';

const job = (over: Partial<TKLCareer>): TKLCareer => ({
  id: 'x', title: 'Titel', company: 'Ditwin', type: 'jobb', location: 'Luleå',
  deadline: '2099-01-01T00:00:00.000Z', published: true, createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

const JOBS: TKLCareer[] = [
  job({ id: '1', title: 'Radar-exjobb', company: 'FOI', type: 'exjobb', orgType: 'public', location: 'Linköping' }),
  job({ id: '2', title: 'Webbutvecklare', company: 'Ditwin', type: 'jobb', location: 'Luleå' }),
  job({ id: '3', title: 'Sommarvikarie', company: 'RISE', type: 'sommarjobb', orgType: 'public', location: 'Luleå' }),
  job({ id: '4', title: 'Datalogi-exjobb', company: 'Ditwin', type: 'exjobb', location: 'Luleå' }),
];

test.describe('careerFilters', () => {
  test('orgOf defaultar till company', () => {
    expect(orgOf(JOBS[1])).toBe('company');
    expect(orgOf(JOBS[0])).toBe('public');
  });

  test('parseFilters läser giltiga värden och ignorerar ogiltiga', () => {
    const f = parseFilters(new URLSearchParams('type=exjobb&org=public&company=FOI&location=Luleå&q=radar'));
    expect(f).toEqual({ type: 'exjobb', org: 'public', company: 'FOI', location: 'Luleå', q: 'radar' });
    expect(parseFilters(new URLSearchParams('type=bogus&org=nope'))).toEqual(DEFAULT_FILTERS);
  });

  test('serializeFilters utelämnar standardvärden och bevarar övriga params', () => {
    const base = new URLSearchParams('id=abc');
    const p = serializeFilters({ ...DEFAULT_FILTERS, type: 'exjobb', q: 'radar' }, base);
    expect(p.get('id')).toBe('abc');
    expect(p.get('type')).toBe('exjobb');
    expect(p.get('q')).toBe('radar');
    expect(p.has('org')).toBe(false);
    expect(serializeFilters(DEFAULT_FILTERS, new URLSearchParams('type=jobb')).toString()).toBe('');
  });

  test('applyFilters: typ, org, arbetsgivare, ort och fritext kombineras (AND)', () => {
    expect(applyFilters(JOBS, { ...DEFAULT_FILTERS, type: 'exjobb' }).map(j => j.id)).toEqual(['1', '4']);
    expect(applyFilters(JOBS, { ...DEFAULT_FILTERS, org: 'public' }).map(j => j.id)).toEqual(['1', '3']);
    expect(applyFilters(JOBS, { ...DEFAULT_FILTERS, company: 'Ditwin', location: 'Luleå' }).map(j => j.id)).toEqual(['2', '4']);
    expect(applyFilters(JOBS, { ...DEFAULT_FILTERS, q: 'RADAR' }).map(j => j.id)).toEqual(['1']);
    expect(applyFilters(JOBS, { ...DEFAULT_FILTERS, type: 'exjobb', org: 'public' }).map(j => j.id)).toEqual(['1']);
  });

  test('deriveOptions ger sorterade unika arbetsgivare och orter', () => {
    expect(deriveOptions(JOBS)).toEqual({
      companies: ['Ditwin', 'FOI', 'RISE'],
      locations: ['Linköping', 'Luleå'],
    });
  });

  test('deriveOptions sorterar svenska tecken efter z och hanterar tom lista', () => {
    const jobs = [job({ id: 'a', location: 'Örebro' }), job({ id: 'b', location: 'Åre' }), job({ id: 'c', location: 'Zürich' })];
    expect(deriveOptions(jobs).locations).toEqual(['Zürich', 'Åre', 'Örebro']);
    expect(deriveOptions([])).toEqual({ companies: [], locations: [] });
  });

  test('sökning täcker engelska fält och beskrivning; blankt q filtrerar inte', () => {
    const jobs = [
      job({ id: 'e', title: 'Utvecklare', titleEn: 'Software engineer' }),
      job({ id: 'd', title: 'Annan', description: 'Arbeta med radarsystem' }),
    ];
    expect(applyFilters(jobs, { ...DEFAULT_FILTERS, q: 'software' }).map(j => j.id)).toEqual(['e']);
    expect(applyFilters(jobs, { ...DEFAULT_FILTERS, q: 'radarsystem' }).map(j => j.id)).toEqual(['d']);
    expect(applyFilters(jobs, { ...DEFAULT_FILTERS, q: '   ' })).toHaveLength(2);
    expect(applyFilters([], DEFAULT_FILTERS)).toEqual([]);
  });

  test('serializeFilters trimmar q', () => {
    expect(serializeFilters({ ...DEFAULT_FILTERS, q: '  radar  ' }).get('q')).toBe('radar');
    expect(serializeFilters({ ...DEFAULT_FILTERS, q: '   ' }).has('q')).toBe(false);
  });

  test('facetCounts räknar varje facett mot övriga aktiva filter', () => {
    const c = facetCounts(JOBS, { ...DEFAULT_FILTERS, org: 'public' });
    expect(c.type.all).toBe(2);
    expect(c.type.exjobb).toBe(1);
    expect(c.type.sommarjobb).toBe(1);
    expect(c.type.jobb).toBe(0);
    // org-facetten ignorerar org-filtret självt men respekterar övriga
    expect(c.org.all).toBe(4);
    expect(c.org.public).toBe(2);
    expect(c.org.company).toBe(2);
  });

  test('activeFilterCount räknar icke-standardfilter', () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...DEFAULT_FILTERS, type: 'jobb', q: 'x', company: 'FOI' })).toBe(3);
  });
});
