'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TagInput } from '@/components/admin/shared/TagInput';
import { createEvent, updateEvent } from '@/lib/services/events';
import { EventFormSchema } from '@/lib/schemas/event';
import type { TKLEvent, EventFormData } from '@/lib/schemas/event';

interface EventFormProps {
  mode: 'create' | 'edit';
  initialData?: TKLEvent;
}

type FormErrors = Partial<Record<keyof EventFormData, string>>;

const SECTIONS = [
  { value: 'data' as const,    label: 'Datasektionen' },
  { value: 'geo' as const,     label: 'Geosektionen' },
  { value: 'i' as const,       label: 'I-sektionen' },
  { value: 'maskin' as const,  label: 'Maskinsektionen' },
  { value: 'general' as const, label: 'Allmänt' },
];

function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromDatetimeLocal(local: string): string {
  if (!local) return '';
  const d = new Date(local);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
}

export function EventForm({ mode, initialData }: EventFormProps) {
  const router = useRouter();

  const [title, setTitle]                 = useState(initialData?.title ?? '');
  const [titleEn, setTitleEn]             = useState(initialData?.titleEn ?? '');
  const [date, setDate]                   = useState(toDatetimeLocal(initialData?.date));
  const [endDate, setEndDate]             = useState(toDatetimeLocal(initialData?.endDate));
  const [location, setLocation]           = useState(initialData?.location ?? '');
  const [section, setSection]             = useState<EventFormData['section']>(initialData?.section ?? 'general');
  const [tags, setTags]                   = useState<string[]>(initialData?.tags ?? []);
  const [imageUrl, setImageUrl]           = useState(initialData?.imageUrl ?? '');
  const [description, setDescription]     = useState(initialData?.description ?? '');
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn ?? '');
  const [published, setPublished]         = useState(initialData?.published ?? false);

  const [errors, setErrors]           = useState<FormErrors>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (mode === 'edit' && !initialData) {
      setSubmitError('Eventdata saknas — ladda om sidan och försök igen.');
      return;
    }

    const formData = {
      title,
      titleEn: titleEn || undefined,
      date: fromDatetimeLocal(date),
      endDate: endDate ? fromDatetimeLocal(endDate) : undefined,
      location,
      section,
      tags,
      imageUrl: imageUrl || undefined,
      description,
      descriptionEn: descriptionEn || undefined,
      published,
    };

    const result = EventFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const err of result.error.issues) {
        const field = err.path[0] as keyof EventFormData;
        if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await createEvent(result.data);
      } else {
        await updateEvent(initialData!.id, result.data);
      }
      router.push('/admin/events');
    } catch {
      setSubmitError('Något gick fel. Försök igen.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = [
    'w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors',
    'bg-[oklch(18%_0.012_265)] border border-[oklch(28%_0.015_265)]',
    'text-[oklch(88%_0.01_265)] placeholder:text-[oklch(38%_0.02_265)]',
    'focus:border-[oklch(55%_0.12_265)]',
  ].join(' ');

  const labelCls = 'block text-[10px] font-semibold text-[oklch(48%_0.02_265)] uppercase tracking-widest mb-1.5';
  const errorCls = 'mt-1 text-xs text-[oklch(65%_0.2_25)]';
  const reqMark  = <span className="text-[oklch(65%_0.2_25)]" aria-hidden="true">*</span>;
  const sectionHdCls = [
    'font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-widest',
    'text-[oklch(48%_0.02_265)] mb-4 pb-2 border-b border-[oklch(20%_0.012_265)]',
  ].join(' ');

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Form header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link
            href="/admin/events"
            className="text-xs text-[oklch(40%_0.02_265)] hover:text-[oklch(60%_0.02_265)] transition-colors mb-2 flex items-center gap-1"
          >
            ← Tillbaka till events
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[oklch(88%_0.01_265)]">
            {mode === 'create' ? 'Nytt event' : 'Redigera event'}
          </h1>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center gap-2.5 mt-6 shrink-0">
          <span className="text-xs font-medium text-[oklch(50%_0.02_265)]">
            {published ? 'Publicerad' : 'Utkast'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={published}
            aria-label={published ? 'Avpublicera' : 'Publicera'}
            onClick={() => setPublished((v) => !v)}
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

        {/* Identitet */}
        <section>
          <h2 className={sectionHdCls}>Identitet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ef-title" className={labelCls}>
                Titel (sv) {reqMark}
              </label>
              <input
                id="ef-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
              />
              {errors.title && <p className={errorCls}>{errors.title}</p>}
            </div>
            <div>
              <label htmlFor="ef-title-en" className={labelCls}>Titel (en)</label>
              <input
                id="ef-title-en"
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Tid & Plats */}
        <section>
          <h2 className={sectionHdCls}>Tid & Plats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="ef-date" className={labelCls}>
                Startdatum {reqMark}
              </label>
              <input
                id="ef-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
              {errors.date && <p className={errorCls}>{errors.date}</p>}
            </div>
            <div>
              <label htmlFor="ef-end-date" className={labelCls}>Slutdatum (valfritt)</label>
              <input
                id="ef-end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label htmlFor="ef-location" className={labelCls}>
              Plats {reqMark}
            </label>
            <input
              id="ef-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputCls}
            />
            {errors.location && <p className={errorCls}>{errors.location}</p>}
          </div>
        </section>

        {/* Innehåll */}
        <section>
          <h2 className={sectionHdCls}>Innehåll</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="ef-description" className={labelCls}>
                Beskrivning (sv) {reqMark}
              </label>
              <textarea
                id="ef-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={inputCls}
              />
              {errors.description && <p className={errorCls}>{errors.description}</p>}
            </div>
            <div>
              <label htmlFor="ef-description-en" className={labelCls}>Beskrivning (en, valfritt)</label>
              <textarea
                id="ef-description-en"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={5}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Metadata */}
        <section>
          <h2 className={sectionHdCls}>Metadata</h2>
          <div className="space-y-4">
            <div>
              <p id="ef-section-label" className={labelCls}>
                Sektion {reqMark}
              </p>
              <div role="group" aria-labelledby="ef-section-label" className="flex flex-wrap gap-2">
                {SECTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    aria-pressed={section === s.value}
                    onClick={() => setSection(s.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      section === s.value
                        ? 'bg-[oklch(55%_0.12_265)] text-white'
                        : 'bg-[oklch(18%_0.012_265)] border border-[oklch(28%_0.015_265)] text-[oklch(52%_0.02_265)] hover:text-[oklch(80%_0.01_265)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="ef-tags" className={labelCls}>Taggar</label>
              <TagInput id="ef-tags" value={tags} onChange={setTags} />
            </div>
            <div>
              <label htmlFor="ef-image-url" className={labelCls}>Bild-URL (valfritt)</label>
              <input
                id="ef-image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://"
                className={inputCls}
              />
              {errors.imageUrl && <p className={errorCls}>{errors.imageUrl}</p>}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-[oklch(20%_0.012_265)] max-w-3xl">
        <div>
          {submitError && <p className={errorCls} role="alert">{submitError}</p>}
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/events"
            className="px-4 py-2 text-sm font-medium text-[oklch(50%_0.02_265)] hover:text-[oklch(80%_0.01_265)] transition-colors rounded-lg"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Sparar…' : (mode === 'create' ? 'Skapa event' : 'Spara ändringar')}
          </button>
        </div>
      </div>
    </form>
  );
}
