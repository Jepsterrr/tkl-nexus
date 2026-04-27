'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { inputCls, labelCls, errorCls, sectionHdCls } from '@/components/admin/shared/formStyles';
import { createCareer, updateCareer } from '@/lib/services/career';
import { CareerFormSchema } from '@/lib/schemas/career';
import type { TKLCareer, CareerFormData, CareerType } from '@/lib/schemas/career';

interface CareerFormProps {
  mode: 'create' | 'edit';
  initialData?: TKLCareer;
}

type FormErrors = Partial<Record<keyof CareerFormData, string>>;

const TYPES: { value: CareerType; label: string }[] = [
  { value: 'exjobb',  label: 'Exjobb'   },
  { value: 'jobb',    label: 'Jobb'     },
  { value: 'praktik', label: 'Praktik'  },
  { value: 'trainee', label: 'Trainee'  },
];

function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(local: string): string {
  if (!local) return '';
  const d = new Date(local);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
}

export function CareerForm({ mode, initialData }: CareerFormProps) {
  const router = useRouter();

  const [title, setTitle]                   = useState(initialData?.title ?? '');
  const [titleEn, setTitleEn]               = useState(initialData?.titleEn ?? '');
  const [company, setCompany]               = useState(initialData?.company ?? '');
  const [type, setType]                     = useState<CareerType>(initialData?.type ?? 'exjobb');
  const [location, setLocation]             = useState(initialData?.location ?? '');
  const [description, setDescription]       = useState(initialData?.description ?? '');
  const [descriptionEn, setDescriptionEn]   = useState(initialData?.descriptionEn ?? '');
  const [startDate, setStartDate]           = useState(initialData?.startDate ?? '');
  const [startDateEn, setStartDateEn]       = useState(initialData?.startDateEn ?? '');
  const [deadline, setDeadline]             = useState(toDatetimeLocal(initialData?.deadline));
  const [applyUrl, setApplyUrl]             = useState(initialData?.applyUrl ?? '');
  const [published, setPublished]           = useState(initialData?.published ?? false);

  const [errors, setErrors]           = useState<FormErrors>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (mode === 'edit' && !initialData) {
      setSubmitError('Annonsdata saknas — ladda om sidan och försök igen.');
      return;
    }

    const formData = {
      title,
      titleEn: titleEn || undefined,
      company,
      type,
      location,
      description: description || undefined,
      descriptionEn: descriptionEn || undefined,
      startDate: startDate || undefined,
      startDateEn: startDateEn || undefined,
      deadline: deadline ? fromDatetimeLocal(deadline) : undefined,
      applyUrl: applyUrl || undefined,
      published,
    };

    const result = CareerFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const err of result.error.issues) {
        const field = err.path[0] as keyof CareerFormData;
        if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await createCareer(result.data);
      } else {
        await updateCareer(initialData!.id, result.data);
      }
      router.push('/admin/career');
    } catch {
      setSubmitError('Något gick fel. Försök igen.');
    } finally {
      setSubmitting(false);
    }
  };

  const reqMark = <span className="text-[oklch(65%_0.2_25)]" aria-hidden="true">*</span>;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link
            href="/admin/career"
            className="text-xs text-[oklch(40%_0.02_265)] hover:text-[oklch(60%_0.02_265)] transition-colors mb-2 flex items-center gap-1"
          >
            ← Tillbaka till annonser
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[oklch(88%_0.01_265)]">
            {mode === 'create' ? 'Ny annons' : 'Redigera annons'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 mt-6 shrink-0">
          <span className="text-xs font-medium text-[oklch(50%_0.02_265)]">
            {published ? 'Publicerad' : 'Utkast'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={published}
            aria-label={published ? 'Avpublicera' : 'Publicera'}
            onClick={() => setPublished(v => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
              published ? 'bg-[oklch(55%_0.12_265)]' : 'bg-[oklch(28%_0.015_265)]'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                published ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-10 max-w-3xl">
        <section>
          <h2 className={sectionHdCls}>Identitet</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cf-title" className={labelCls}>Titel (sv) {reqMark}</label>
                <input id="cf-title" type="text" value={title}
                  onChange={e => setTitle(e.target.value)} className={inputCls} />
                {errors.title && <p className={errorCls}>{errors.title}</p>}
              </div>
              <div>
                <label htmlFor="cf-title-en" className={labelCls}>Titel (en, valfritt)</label>
                <input id="cf-title-en" type="text" value={titleEn}
                  onChange={e => setTitleEn(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cf-company" className={labelCls}>Företag {reqMark}</label>
                <input id="cf-company" type="text" value={company}
                  onChange={e => setCompany(e.target.value)} className={inputCls} />
                {errors.company && <p className={errorCls}>{errors.company}</p>}
              </div>
              <div>
                <label htmlFor="cf-location" className={labelCls}>Ort {reqMark}</label>
                <input id="cf-location" type="text" value={location}
                  onChange={e => setLocation(e.target.value)} className={inputCls} />
                {errors.location && <p className={errorCls}>{errors.location}</p>}
              </div>
            </div>
            <div>
              <p id="cf-type-label" className={labelCls}>Typ {reqMark}</p>
              <div role="group" aria-labelledby="cf-type-label" className="flex flex-wrap gap-2">
                {TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    aria-pressed={type === t.value}
                    onClick={() => setType(t.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      type === t.value
                        ? 'bg-[oklch(55%_0.12_265)] text-white'
                        : 'bg-[oklch(18%_0.012_265)] border border-[oklch(28%_0.015_265)] text-[oklch(52%_0.02_265)] hover:text-[oklch(80%_0.01_265)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className={sectionHdCls}>Innehåll</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="cf-description" className={labelCls}>Beskrivning (sv, valfritt)</label>
              <textarea id="cf-description" value={description}
                onChange={e => setDescription(e.target.value)} rows={5} className={inputCls} />
            </div>
            <div>
              <label htmlFor="cf-description-en" className={labelCls}>Beskrivning (en, valfritt)</label>
              <textarea id="cf-description-en" value={descriptionEn}
                onChange={e => setDescriptionEn(e.target.value)} rows={5} className={inputCls} />
            </div>
          </div>
        </section>

        <section>
          <h2 className={sectionHdCls}>Datum & Ansökan</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cf-start-date" className={labelCls}>Startperiod (sv, valfritt)</label>
                <input id="cf-start-date" type="text" value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  placeholder="t.ex. VT26" className={inputCls} />
              </div>
              <div>
                <label htmlFor="cf-start-date-en" className={labelCls}>Startperiod (en, valfritt)</label>
                <input id="cf-start-date-en" type="text" value={startDateEn}
                  onChange={e => setStartDateEn(e.target.value)}
                  placeholder="e.g. Spring 2026" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cf-deadline" className={labelCls}>Deadline (valfritt)</label>
                <input id="cf-deadline" type="datetime-local" value={deadline}
                  onChange={e => setDeadline(e.target.value)} className={inputCls} />
                {errors.deadline && <p className={errorCls}>{errors.deadline}</p>}
              </div>
              <div>
                <label htmlFor="cf-apply-url" className={labelCls}>Ansökningslänk (valfritt)</label>
                <input id="cf-apply-url" type="url" value={applyUrl}
                  onChange={e => setApplyUrl(e.target.value)}
                  placeholder="https://" className={inputCls} />
                {errors.applyUrl && <p className={errorCls}>{errors.applyUrl}</p>}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-[oklch(20%_0.012_265)] max-w-3xl">
        <div>
          {submitError && <p className={errorCls} role="alert">{submitError}</p>}
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/career"
            className="px-4 py-2 text-sm font-medium text-[oklch(50%_0.02_265)] hover:text-[oklch(80%_0.01_265)] transition-colors rounded-lg"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Sparar…' : (mode === 'create' ? 'Skapa annons' : 'Spara ändringar')}
          </button>
        </div>
      </div>
    </form>
  );
}
