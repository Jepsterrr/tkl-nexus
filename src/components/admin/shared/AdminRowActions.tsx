'use client';

import Link from 'next/link';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';

interface AdminRowActionsProps {
  published: boolean;
  toggling: boolean;
  deleting: boolean;
  editHref: string;
  /** Titel på resursen — används i aria-labels */
  title: string;
  /** Etikett för resursen, t.ex. "annons", "event", "deal" */
  resourceLabel: string;
  onToggle: () => void;
  onDelete: () => void;
}

const baseBtnCls =
  'p-1.5 rounded-md text-[oklch(50%_0.02_265)] hover:bg-[oklch(18%_0.012_265)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

export function AdminRowActions({
  published,
  toggling,
  deleting,
  editHref,
  title,
  resourceLabel,
  onToggle,
  onDelete,
}: AdminRowActionsProps) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        title={published ? 'Avpublicera — dölj för användare' : 'Publicera — visa för användare'}
        aria-label={published ? `Avpublicera ${resourceLabel}` : `Publicera ${resourceLabel}`}
        disabled={toggling}
        onClick={onToggle}
        className={`${baseBtnCls} hover:text-[oklch(80%_0.01_265)]`}
      >
        {published
          ? <Eye size={15} aria-hidden="true" />
          : <EyeOff size={15} aria-hidden="true" />}
      </button>

      <Link
        href={editHref}
        title={`Redigera ${resourceLabel}`}
        aria-label={`Redigera ${resourceLabel}: ${title}`}
        className={`${baseBtnCls} hover:text-[oklch(80%_0.01_265)]`}
      >
        <Pencil size={15} aria-hidden="true" />
      </Link>

      <button
        type="button"
        title={`Radera ${resourceLabel} permanent`}
        aria-label={`Radera ${resourceLabel}: ${title}`}
        disabled={deleting}
        onClick={onDelete}
        className={`${baseBtnCls} hover:text-[oklch(65%_0.2_25)]`}
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
