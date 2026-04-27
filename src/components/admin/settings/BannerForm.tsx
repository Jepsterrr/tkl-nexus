"use client";

import { useEffect, useRef, useState } from "react";
import { getBannerSettings, saveBannerSettings } from "@/lib/services/settings";
import { BannerSettingsSchema } from "@/lib/schemas/settings";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SWATCHES = [
  { label: "Blå", value: "#3B82F6" },
  { label: "Röd", value: "#E30613" },
  { label: "Grön", value: "#10B981" },
  { label: "Gul", value: "#F59E0B" },
  { label: "Lila", value: "#8B5CF6" },
];

import { inputCls, labelCls } from "@/components/admin/shared/formStyles";

export function BannerForm() {
  const [active, setActive] = useState(false);
  const [text, setText] = useState("");
  const [color, setColor] = useState(SWATCHES[0].value);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getBannerSettings()
      .then((data) => {
        if (cancelled) return;
        setActive(data?.active ?? false);
        setText(data?.text ?? "");
        setColor(data?.color ?? SWATCHES[0].value);
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
  }, [fetchKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const r = BannerSettingsSchema.safeParse({
      active,
      text: text || undefined,
      color: color || undefined,
    });
    if (!r.success) {
      setSaveError("Ogiltiga värden.");
      return;
    }
    setSaveStatus("saving");
    try {
      await saveBannerSettings(r.data);
      setSaveStatus("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setSaveError("Något gick fel. Försök igen.");
    }
  };

  if (loading)
    return (
      <div className="p-6 sm:p-8 max-w-2xl animate-pulse space-y-4">
        <div className="h-3 w-24 rounded bg-[oklch(18%_0.012_265)]" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded bg-[oklch(18%_0.012_265)]" />
        ))}
      </div>
    );

  if (loadError)
    return (
      <div className="p-6 sm:p-8">
        <p className="text-sm text-[oklch(65%_0.2_25)] mb-3">
          Kunde inte hämta inställningar.
        </p>
        <button
          type="button"
          onClick={() => setFetchKey((k) => k + 1)}
          className="text-xs text-[oklch(55%_0.12_265)] hover:text-[oklch(70%_0.12_265)] transition-colors"
        >
          Försök igen
        </button>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 max-w-2xl">
      <h1 className="font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-widest text-[oklch(48%_0.02_265)] mb-4 pb-2 border-b border-[oklch(20%_0.012_265)]">
        Global Banner
      </h1>

      <div className="mt-4 space-y-5">
        {/* Active toggle */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-[oklch(58%_0.02_265)]">
            {active ? "Aktiv" : "Inaktiv"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={active ? "Deaktivera banner" : "Aktivera banner"}
            onClick={() => setActive((v) => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${active ? "bg-[oklch(55%_0.12_265)]" : "bg-[oklch(28%_0.015_265)]"}`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? "translate-x-4" : ""}`}
            />
          </button>
        </div>

        {/* Text */}
        <div>
          <label htmlFor="bn-text" className={labelCls}>
            Bannertext
          </label>
          <input
            id="bn-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Välkommen till TKL Nexus!"
            className={inputCls}
          />
        </div>

        {/* Color swatches */}
        <div>
          <p className={labelCls}>Färg</p>
          <div
            className="flex gap-3 mt-2"
            role="group"
            aria-label="Välj bannerfärg"
          >
            {SWATCHES.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-label={s.label}
                aria-pressed={color === s.value}
                onClick={() => setColor(s.value)}
                className="w-7 h-7 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.12_265)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(18%_0.012_265)]"
                style={{
                  backgroundColor: s.value,
                  outline:
                    color === s.value ? `2px solid ${s.value}` : undefined,
                  outlineOffset: color === s.value ? "2px" : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        {text && (
          <div
            className="py-2 text-sm text-center text-white rounded"
            style={{ backgroundColor: color }}
          >
            {text}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[oklch(28%_0.015_265)]">
        <div>
          {saveError && (
            <p className="text-xs text-[oklch(65%_0.2_25)]" role="alert">
              {saveError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={saveStatus === "saving"}
          className="px-5 py-2 text-sm font-semibold rounded-lg bg-[oklch(40%_0.14_265)] text-white hover:bg-[oklch(45%_0.14_265)] disabled:opacity-50 transition-colors"
        >
          {saveStatus === "saving"
            ? "Sparar…"
            : saveStatus === "saved"
              ? "Sparat ✓"
              : "Spara inställningar"}
        </button>
      </div>
    </form>
  );
}
