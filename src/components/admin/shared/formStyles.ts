/** Radbakgrund för admin-listor beroende på publicerings- och utgångsstatus. */
export function adminRowCls(opts: { published: boolean; expired?: boolean }): string {
  const base = 'flex items-center gap-4 px-4 py-3 mt-1 rounded-lg border transition-colors';
  if (opts.expired) return `${base} bg-[oklch(55%_0.15_50/6%)] border-[oklch(55%_0.15_50/20%)]`;
  if (opts.published) return `${base} bg-[oklch(55%_0.12_265/8%)] border-[oklch(18%_0.012_265)]`;
  return `${base} bg-[oklch(75%_0.12_60/8%)] border-[oklch(18%_0.012_265)]`;
}

/** Badge-klass för utgångna poster i admin-listor. */
export const expiredBadgeCls =
  'shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ' +
  'bg-[oklch(55%_0.15_50/20%)] text-[oklch(68%_0.18_50)]';

export const inputCls = [
  'w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors',
  'bg-[oklch(18%_0.012_265)] border border-[oklch(28%_0.015_265)]',
  'text-[oklch(88%_0.01_265)] placeholder:text-[oklch(38%_0.02_265)]',
  'focus:border-[oklch(55%_0.12_265)]',
].join(' ');

/** StatsForm variant — adds tabular-nums for numeric inputs */
export const inputClsNumeric = inputCls + ' font-variant-numeric tabular-nums';

export const labelCls =
  'block text-[10px] font-semibold text-[oklch(58%_0.02_265)] uppercase tracking-widest mb-1.5';

export const errorCls = 'mt-1 text-xs text-[oklch(65%_0.2_25)]';

export const sectionHdCls = [
  'font-(family-name:--font-heading) text-[10px] font-bold uppercase tracking-widest',
  'text-[oklch(58%_0.02_265)] mb-4 pb-2 border-b border-[oklch(20%_0.012_265)]',
].join(' ');
