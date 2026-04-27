'use client';

import { useEffect, useState } from 'react';
import { Mail, KeyRound, Trash2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import {
  getAdmins,
  addAdmin,
  removeAdmin,
  sendInvite,
  sendPasswordReset,
} from '@/lib/services/admins';
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog';
import {
  inputCls,
  labelCls,
  errorCls,
  sectionHdCls,
} from '@/components/admin/shared/formStyles';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type RowStatus = 'idle' | 'sending' | 'sent' | 'error';

export function AdminsContent() {
  const [admins, setAdmins]       = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [fetchKey, setFetchKey]   = useState(0);

  const [newEmail, setNewEmail]     = useState('');
  const [adding, setAdding]         = useState(false);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState<string | null>(null);

  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({});

  const [currentEmail, setCurrentEmail] = useState('');
  useEffect(() => {
    return auth.onAuthStateChanged((u) => setCurrentEmail(u?.email ?? ''));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getAdmins()
      .then((data) => {
        if (!cancelled) { setAdmins(data); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setLoadError(true); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [fetchKey]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);
    const trimmed = newEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setAddError('Ange en giltig e-postadress.');
      return;
    }
    if (admins.includes(trimmed)) {
      setAddError('Den här e-postadressen är redan admin.');
      return;
    }
    setAdding(true);
    try {
      await addAdmin(trimmed);
      await sendInvite(trimmed, window.location.origin);
      setAddSuccess(`Inbjudan skickad till ${trimmed}.`);
      setNewEmail('');
      setFetchKey((k) => k + 1);
    } catch {
      setAddError('Något gick fel. Försök igen.');
    } finally {
      setAdding(false);
    }
  };

  const handleRowAction = async (email: string, action: 'invite' | 'reset') => {
    setRowStatus((s) => ({ ...s, [email]: 'sending' }));
    try {
      if (action === 'invite') await sendInvite(email, window.location.origin);
      else await sendPasswordReset(email);
      setRowStatus((s) => ({ ...s, [email]: 'sent' }));
      setTimeout(() => setRowStatus((s) => ({ ...s, [email]: 'idle' })), 2000);
    } catch {
      setRowStatus((s) => ({ ...s, [email]: 'error' }));
      setTimeout(() => setRowStatus((s) => ({ ...s, [email]: 'idle' })), 3000);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await removeAdmin(deleteTarget);
      setDeleteTarget(null);
      setFetchKey((k) => k + 1);
    } catch {
      setDeleteError('Kunde inte ta bort. Försök igen.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="p-6 sm:p-8 max-w-2xl animate-pulse space-y-3">
      <div className="h-3 w-28 rounded bg-[oklch(18%_0.012_265)]" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 rounded bg-[oklch(18%_0.012_265)]" />
      ))}
    </div>
  );

  if (loadError) return (
    <div className="p-6 sm:p-8">
      <p className="text-sm text-[oklch(65%_0.2_25)] mb-3">Kunde inte hämta admins.</p>
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
    <div className="p-6 sm:p-8 max-w-2xl">
      <h1 className={sectionHdCls}>Adminhantering</h1>

      {/* Lägg till-formulär */}
      <form onSubmit={handleAdd} noValidate className="mb-6">
        <label htmlFor="new-admin-email" className={labelCls}>
          Lägg till admin
        </label>
        <div className="flex gap-2 mt-1">
          <input
            id="new-admin-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="admin@example.se"
            className={inputCls}
            aria-describedby="add-email-error"
          />
          <button
            type="submit"
            disabled={adding}
            aria-busy={adding}
            className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-[oklch(40%_0.14_265)] text-white hover:bg-[oklch(45%_0.14_265)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {adding ? 'Skickar…' : 'Skicka inbjudan'}
          </button>
        </div>
        <p id="add-email-error" className={`${errorCls} empty:mt-0`} role="alert">
          {addError ?? ''}
        </p>
        <p
          className="mt-1 text-xs text-[oklch(65%_0.17_163)]"
          role="status"
          aria-live="polite"
        >
          {addSuccess ?? ''}
        </p>
      </form>

      {/* Lista */}
      <ul aria-label="Adminlista">
        {admins.map((email) => {
          const isSelf  = email === currentEmail;
          const status  = rowStatus[email] ?? 'idle';
          return (
            <li
              key={email}
              className="flex items-center gap-2 py-3 border-b border-[oklch(18%_0.012_265)]"
            >
              <span className="flex-1 text-sm text-[oklch(75%_0.01_265)] truncate">
                {email}
                {isSelf && (
                  <span className="ml-2 text-[10px] font-semibold text-[oklch(58%_0.02_265)] uppercase tracking-widest">
                    (du)
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={`text-xs mr-1 w-4 text-center ${
                    status === 'sent'
                      ? 'text-[oklch(65%_0.17_163)]'
                      : status === 'error'
                        ? 'text-[oklch(65%_0.2_25)]'
                        : 'text-transparent'
                  }`}
                  role="status"
                  aria-live="polite"
                  aria-label={status === 'sent' ? 'Åtgärd lyckades' : status === 'error' ? 'Åtgärd misslyckades' : ''}
                >
                  {status === 'sent' ? '✓' : status === 'error' ? '✗' : '·'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRowAction(email, 'invite')}
                  disabled={status === 'sending'}
                  className="p-3 rounded text-[oklch(45%_0.02_265)] hover:text-[oklch(65%_0.12_265)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Skicka inbjudningslänk till ${email}`}
                  title="Skicka inbjudningslänk"
                >
                  <Mail className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRowAction(email, 'reset')}
                  disabled={status === 'sending'}
                  className="p-3 rounded text-[oklch(45%_0.02_265)] hover:text-[oklch(65%_0.12_265)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Skicka lösenordsåterställning till ${email}`}
                  title="Återställ lösenord"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { if (!isSelf) setDeleteTarget(email); }}
                  disabled={isSelf}
                  className="p-3 rounded text-[oklch(45%_0.02_265)] hover:text-[oklch(65%_0.2_25)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={isSelf ? 'Kan inte ta bort dig själv' : `Ta bort ${email}`}
                  title={isSelf ? 'Kan inte ta bort dig själv' : 'Ta bort admin'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {admins.length === 0 && (
        <p className="text-sm text-[oklch(56%_0.02_265)] py-4">Inga admins.</p>
      )}

      {deleteError && (
        <p className="mt-3 text-xs text-[oklch(65%_0.2_25)]" role="alert">{deleteError}</p>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Ta bort admin?"
        description={`${deleteTarget ?? ''} tas bort permanent och förlorar adminåtkomst.`}
        confirmLabel={deleting ? 'Tar bort…' : 'Ta bort'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
