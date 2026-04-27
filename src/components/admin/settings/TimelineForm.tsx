"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getTimelineItem,
  createTimelineItem,
  saveTimelineItem,
} from "@/lib/services/settings";
import { TimelineItemDataSchema } from "@/lib/schemas/settings";
import { inputCls, inputClsNumeric, labelCls, errorCls, sectionHdCls } from "@/components/admin/shared/formStyles";

interface TimelineFormProps {
  mode: "create" | "edit";
  id?: string;
}

export function TimelineForm({ mode, id: idProp }: TimelineFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = idProp ?? searchParams.get('id') ?? undefined;
  const [year, setYear] = useState("");
  const [order, setOrder] = useState("0");
  const [titleSv, setTitleSv] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descSv, setDescSv] = useState("");
  const [descEn, setDescEn] = useState("");

  const [loading, setLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    let cancelled = false;
    getTimelineItem(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setLoadError(true);
          setLoading(false);
          return;
        }
        setYear(data.year);
        setOrder(String(data.order));
        setTitleSv(data.titleSv);
        setTitleEn(data.titleEn);
        setDescSv(data.descSv);
        setDescEn(data.descEn);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const r = TimelineItemDataSchema.safeParse({
      year,
      order: Number(order),
      titleSv,
      titleEn,
      descSv,
      descEn,
    });
    if (!r.success) {
      setSubmitError(r.error.issues[0]?.message ?? "Ogiltiga värden.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createTimelineItem(r.data);
      } else {
        if (!id) {
          setSubmitError("Internt fel: post-ID saknas.");
          return;
        }
        await saveTimelineItem(id, r.data);
      }
      router.push("/admin/settings/timeline");
    } catch {
      setSubmitError("Något gick fel. Försök igen.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 sm:p-8 max-w-2xl animate-pulse space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 rounded bg-[oklch(18%_0.012_265)]" />
        ))}
      </div>
    );

  if (loadError)
    return (
      <div className="p-6 sm:p-8">
        <p className="text-sm text-[oklch(65%_0.2_25)] mb-3">
          Posten hittades inte.
        </p>
        <Link
          href="/admin/settings/timeline"
          className="text-xs text-[oklch(55%_0.12_265)] hover:text-[oklch(70%_0.12_265)] transition-colors"
        >
          ← Tillbaka
        </Link>
      </div>
    );

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <Link
        href="/admin/settings/timeline"
        className="text-xs text-[oklch(56%_0.02_265)] hover:text-[oklch(70%_0.02_265)] transition-colors mb-3 flex items-center gap-1"
      >
        ← Tillbaka till tidslinje
      </Link>
      <h1 className={sectionHdCls}>
        {mode === "create" ? "Ny tidslinjpost" : "Redigera post"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tl-year" className={labelCls}>
              År
            </label>
            <input
              id="tl-year"
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2026"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="tl-order" className={labelCls}>
              Ordning
            </label>
            <input
              id="tl-order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className={inputClsNumeric}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tl-tsv" className={labelCls}>
              Titel (sv)
            </label>
            <input
              id="tl-tsv"
              type="text"
              value={titleSv}
              onChange={(e) => setTitleSv(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="tl-ten" className={labelCls}>
              Titel (en)
            </label>
            <input
              id="tl-ten"
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tl-dsv" className={labelCls}>
              Beskrivning (sv)
            </label>
            <textarea
              id="tl-dsv"
              value={descSv}
              onChange={(e) => setDescSv(e.target.value)}
              rows={4}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="tl-den" className={labelCls}>
              Beskrivning (en)
            </label>
            <textarea
              id="tl-den"
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              rows={4}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[oklch(28%_0.015_265)]">
          <div>
            {submitError && (
              <p className={errorCls} role="alert">
                {submitError}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/settings/timeline"
              className="px-4 py-2 text-sm font-medium text-[oklch(58%_0.02_265)] hover:text-[oklch(80%_0.01_265)] transition-colors rounded-lg"
            >
              Avbryt
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[oklch(40%_0.14_265)] text-white hover:bg-[oklch(45%_0.14_265)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting
                ? "Sparar…"
                : mode === "create"
                  ? "Skapa post"
                  : "Spara ändringar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
