'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { inputCls, labelCls, errorCls, sectionHdCls } from '@/components/admin/shared/formStyles';
import { createDeal, updateDeal } from '@/lib/services/deals';
import { DealFormSchema } from '@/lib/schemas/deal';
import type { TKLDeal, DealFormData } from '@/lib/schemas/deal';

interface DealFormProps {
  mode: 'create' | 'edit';
  initialData?: TKLDeal;
}

type FormErrors = Partial<Record<keyof DealFormData, string>>;

export function DealForm({ mode, initialData }: DealFormProps) {
  const router = useRouter();

  const [company, setCompany]             = useState(initialData?.company ?? '');
  const [title, setTitle]                 = useState(initialData?.title ?? '');
  const [titleEn, setTitleEn]             = useState(initialData?.titleEn ?? '');
  const [logoUrl, setLogoUrl]             = useState(initialData?.logoUrl ?? '');
  const [description, setDescription]     = useState(initialData?.description ?? '');
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn ?? '');
  const [link, setLink]                   = useState(initialData?.link ?? '');
  const [discountCode, setDiscountCode]   = useState(initialData?.discountCode ?? '');
  const [discount, setDiscount]           = useState(initialData?.discount ?? '');
  const [published, setPublished]         = useState(initialData?.published ?? false);

  const [errors, setErrors]           = useState<FormErrors>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (mode === 'edit' && !initialData) {
      setSubmitError('Deal-data saknas — ladda om sidan och försök igen.');
      return;
    }

    const formData = {
      company,
      title,
      titleEn: titleEn || undefined,
      logoUrl: logoUrl || undefined,
      description,
      descriptionEn: descriptionEn || undefined,
      link: link || undefined,
      discountCode: discountCode || undefined,
      discount: discount || undefined,
      published,
    };

    const result = DealFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const err of result.error.issues) {
        const field = err.path[0] as keyof DealFormData;
        if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await createDeal(result.data);
      } else {
        await updateDeal(initialData!.id, result.data);
      }
      router.push('/admin/deals');
    } catch {
      setSubmitError('Något gick fel. Försök igen.');
    } finally {
      setSubmitting(false);
    }
  };

  const reqMark = <span className="text-[oklch(65%_0.2_25)]" aria-hidden="true">*</span>;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Form header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link
            href="/admin/deals"
            className="text-xs text-[oklch(40%_0.02_265)] hover:text-[oklch(60%_0.02_265)] transition-colors mb-2 flex items-center gap-1"
          >
            ← Tillbaka till deals
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[oklch(88%_0.01_265)]">
            {mode === 'create' ? 'Ny deal' : 'Redigera deal'}
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

        {/* Identitet */}
        <section>
          <h2 className={sectionHdCls}>Identitet</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="df-company" className={labelCls}>
                  Företag {reqMark}
                </label>
                <input
                  id="df-company"
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className={inputCls}
                />
                {errors.company && <p className={errorCls}>{errors.company}</p>}
              </div>
              <div>
                <label htmlFor="df-logo-url" className={labelCls}>Logotyp-URL (valfritt)</label>
                <input
                  id="df-logo-url"
                  type="url"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="https://"
                  className={inputCls}
                />
                {errors.logoUrl && <p className={errorCls}>{errors.logoUrl}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="df-title" className={labelCls}>
                  Titel (sv) {reqMark}
                </label>
                <input
                  id="df-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={inputCls}
                />
                {errors.title && <p className={errorCls}>{errors.title}</p>}
              </div>
              <div>
                <label htmlFor="df-title-en" className={labelCls}>Titel (en, valfritt)</label>
                <input
                  id="df-title-en"
                  type="text"
                  value={titleEn}
                  onChange={e => setTitleEn(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Innehåll */}
        <section>
          <h2 className={sectionHdCls}>Innehåll</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="df-description" className={labelCls}>
                Beskrivning (sv) {reqMark}
              </label>
              <textarea
                id="df-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className={inputCls}
              />
              {errors.description && <p className={errorCls}>{errors.description}</p>}
            </div>
            <div>
              <label htmlFor="df-description-en" className={labelCls}>Beskrivning (en, valfritt)</label>
              <textarea
                id="df-description-en"
                value={descriptionEn}
                onChange={e => setDescriptionEn(e.target.value)}
                rows={4}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Erbjudande */}
        <section>
          <h2 className={sectionHdCls}>Erbjudande</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="df-link" className={labelCls}>Länk (valfritt)</label>
              <input
                id="df-link"
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://"
                className={inputCls}
              />
              {errors.link && <p className={errorCls}>{errors.link}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="df-discount-code" className={labelCls}>Rabattkod (valfritt)</label>
                <input
                  id="df-discount-code"
                  type="text"
                  value={discountCode}
                  onChange={e => setDiscountCode(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="df-discount" className={labelCls}>Rabatt (valfritt)</label>
                <input
                  id="df-discount"
                  type="text"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  placeholder="t.ex. 20%"
                  className={inputCls}
                />
              </div>
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
            href="/admin/deals"
            className="px-4 py-2 text-sm font-medium text-[oklch(50%_0.02_265)] hover:text-[oklch(80%_0.01_265)] transition-colors rounded-lg"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-[oklch(55%_0.12_265)] text-white hover:bg-[oklch(60%_0.12_265)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Sparar…' : (mode === 'create' ? 'Skapa deal' : 'Spara ändringar')}
          </button>
        </div>
      </div>
    </form>
  );
}
