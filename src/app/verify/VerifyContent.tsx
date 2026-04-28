'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

type Phase = 'loading' | 'confirm-email' | 'set-password' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_CLS  = 'flex flex-col gap-2 mb-5';
const LABEL_CLS  = 'font-(family-name:--font-body) text-xs font-medium text-[oklch(65%_0.02_265)] tracking-[0.05em]';
const INPUT_CLS  = 'w-full bg-[oklch(19%_0.012_265)] border border-[oklch(28%_0.015_265)] rounded px-4 py-3 font-(family-name:--font-body) text-sm text-[oklch(90%_0.01_265)] placeholder:text-[oklch(40%_0.01_265)] outline-none transition-colors focus:border-[oklch(55%_0.12_265)]';
const SUBMIT_CLS = 'w-full py-3 px-4 bg-[oklch(55%_0.12_265)] text-[oklch(95%_0.01_265)] border-none rounded font-(family-name:--font-body) text-sm font-semibold cursor-pointer transition-colors hover:bg-[oklch(60%_0.12_265)] disabled:opacity-50 disabled:cursor-not-allowed';
const ERROR_CLS  = 'text-[0.8125rem] text-[oklch(65%_0.18_25)] mb-4';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-action-code': 'Länken är ogiltig eller har redan använts.',
  'auth/expired-action-code': 'Länken har gått ut. Begär en ny inbjudan från webmastern.',
  'auth/invalid-email':       'E-postadressen matchar inte inbjudan.',
};

function Card({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100svh-var(--navbar-height,72px))] flex items-center justify-center bg-[oklch(12%_0.01_265)] p-6">
      <div className="w-full max-w-88 bg-[oklch(16%_0.012_265)] border border-[oklch(28%_0.015_265)] rounded-md p-8 shadow-[0_0_0_1px_oklch(28%_0.015_265),0_8px_32px_oklch(8%_0.01_265/0.8)]">
        <div className="mb-8 text-center">
          <span className="font-(family-name:--font-heading) text-2xl font-extrabold tracking-[-0.04em] text-[oklch(72%_0.12_265)]">
            TKL
          </span>
          <p className="font-(family-name:--font-body) text-xs font-medium text-[oklch(55%_0.02_265)] uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function VerifyContent() {
  const router = useRouter();

  const [phase, setPhase]       = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [signedInAs, setSignedInAs] = useState('');

  const [emailInput, setEmailInput] = useState('');
  const [pw, setPw]                 = useState('');
  const [pwConfirm, setPwConfirm]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  useEffect(() => {
    const href = window.location.href;
    if (!isSignInWithEmailLink(auth, href)) {
      router.replace('/admin');
      return;
    }
    setPhase('confirm-email');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeSignIn = async (email: string) => {
    setSubmitting(true);
    try {
      await signInWithEmailLink(auth, email.trim().toLowerCase(), window.location.href);
      setSignedInAs(email.trim().toLowerCase());
      setPhase('set-password');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setErrorMsg(ERROR_MESSAGES[code] ?? 'Något gick fel. Begär en ny inbjudan från webmastern.');
      setPhase('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const trimmed = emailInput.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setFormError('Ange en giltig e-postadress.');
      return;
    }
    completeSignIn(trimmed);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (pw.length < 8) {
      setFormError('Lösenordet måste vara minst 8 tecken.');
      return;
    }
    if (pw !== pwConfirm) {
      setFormError('Lösenorden matchar inte.');
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setFormError('Sessionen har gått ut. Klicka på länken igen.');
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(user, pw);
      router.replace('/admin/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setFormError(
        code === 'auth/requires-recent-login'
          ? 'Klicka på inbjudningslänken igen för att fortsätta.'
          : 'Kunde inte spara lösenordet. Försök igen.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'loading') {
    return (
      <Card subtitle="Adminpanel">
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <svg
            className="animate-spin w-4 h-4 text-[oklch(55%_0.12_265)] shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-[oklch(55%_0.02_265)]">Verifierar länk…</p>
        </div>
      </Card>
    );
  }

  if (phase === 'error') {
    return (
      <Card subtitle="Adminpanel">
        <p className={ERROR_CLS} role="alert">
          {errorMsg}
        </p>
        <a href="/admin" className="text-xs text-[oklch(55%_0.12_265)] hover:text-[oklch(70%_0.12_265)] transition-colors">
          ← Tillbaka till inloggning
        </a>
      </Card>
    );
  }

  if (phase === 'confirm-email') {
    return (
      <Card subtitle="Bekräfta identitet">
        <form onSubmit={handleEmailSubmit} noValidate>
          <div className={FIELD_CLS}>
            <label htmlFor="verify-email" className={LABEL_CLS}>
              Ange din e-postadress
            </label>
            <input
              id="verify-email"
              type="email"
              autoComplete="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className={INPUT_CLS}
              placeholder="din@email.se"
              aria-describedby={formError ? 'verify-email-error' : undefined}
            />
          </div>
          {formError && (
            <p id="verify-email-error" className={ERROR_CLS} role="alert">{formError}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className={SUBMIT_CLS}
            aria-busy={submitting}
          >
            {submitting ? 'Verifierar…' : 'Fortsätt'}
          </button>
        </form>
      </Card>
    );
  }

  // phase === 'set-password'
  return (
    <Card subtitle="Välj lösenord">
      <p className="text-xs text-[oklch(58%_0.02_265)] mb-5" role="status" aria-live="polite">
        Inloggad som {signedInAs}
      </p>
      <form onSubmit={handlePasswordSubmit} noValidate>
        <div className={FIELD_CLS}>
          <label htmlFor="verify-pw" className={LABEL_CLS}>Lösenord</label>
          <input
            id="verify-pw"
            type="password"
            autoComplete="new-password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={INPUT_CLS}
            placeholder="Minst 8 tecken"
            aria-describedby={formError ? 'pw-error' : 'pw-hint'}
          />
          <p id="pw-hint" className="text-[0.6875rem] text-[oklch(42%_0.015_265)]">
            Minst 8 tecken
          </p>
        </div>
        <div className={FIELD_CLS}>
          <label htmlFor="verify-pw2" className={LABEL_CLS}>Bekräfta lösenord</label>
          <input
            id="verify-pw2"
            type="password"
            autoComplete="new-password"
            required
            value={pwConfirm}
            onChange={(e) => setPwConfirm(e.target.value)}
            className={INPUT_CLS}
            placeholder="Upprepa lösenordet"
            aria-describedby={formError ? 'pw-error' : undefined}
          />
        </div>
        {formError && (
          <p id="pw-error" className={ERROR_CLS} role="alert">{formError}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className={SUBMIT_CLS}
          aria-busy={submitting}
        >
          {submitting ? 'Skapar konto…' : 'Skapa konto'}
        </button>
      </form>
    </Card>
  );
}
