'use client';

import { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Ta bort',
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm mx-4 p-6 rounded-xl bg-[oklch(14%_0.012_265)] border border-[oklch(28%_0.015_265)]">
        <h2
          id="confirm-dialog-title"
          className="font-[family-name:var(--font-heading)] text-sm font-bold text-[oklch(88%_0.01_265)] mb-2"
        >
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="text-sm text-[oklch(57%_0.02_265)] mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[oklch(55%_0.02_265)] hover:text-[oklch(80%_0.01_265)] transition-colors rounded-lg"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              destructive
                ? 'bg-[oklch(38%_0.18_25)] text-[oklch(88%_0.06_25)] hover:bg-[oklch(43%_0.2_25)]'
                : 'bg-[oklch(40%_0.14_265)] text-white hover:bg-[oklch(45%_0.14_265)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
