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
