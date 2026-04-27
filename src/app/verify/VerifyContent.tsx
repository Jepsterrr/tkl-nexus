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

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-action-code': 'Länken är ogiltig eller har redan använts.',
  'auth/expired-action-code': 'Länken har gått ut. Begär en ny inbjudan från webmastern.',
  'auth/invalid-email':       'E-postadressen matchar inte inbjudan.',
};

function Card({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-login-logo">TKL</span>
          <p className="admin-login-sub">{subtitle}</p>
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
        <p className="text-sm text-[oklch(55%_0.02_265)]" role="status" aria-live="polite">
          Verifierar länk…
        </p>
      </Card>
    );
  }

  if (phase === 'error') {
    return (
      <Card subtitle="Adminpanel">
        <p className="admin-error mb-4" role="alert">
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
          <div className="admin-field">
            <label htmlFor="verify-email" className="admin-label">
              Ange din e-postadress
            </label>
            <input
              id="verify-email"
              type="email"
              autoComplete="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="admin-input"
              placeholder="din@email.se"
              aria-describedby={formError ? 'verify-email-error' : undefined}
            />
          </div>
          {formError && (
            <p id="verify-email-error" className="admin-error" role="alert">{formError}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="admin-submit"
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
        <div className="admin-field">
          <label htmlFor="verify-pw" className="admin-label">Lösenord</label>
          <input
            id="verify-pw"
            type="password"
            autoComplete="new-password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="admin-input"
            placeholder="Minst 8 tecken"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="verify-pw2" className="admin-label">Bekräfta lösenord</label>
          <input
            id="verify-pw2"
            type="password"
            autoComplete="new-password"
            required
            value={pwConfirm}
            onChange={(e) => setPwConfirm(e.target.value)}
            className="admin-input"
            placeholder="Upprepa lösenordet"
          />
        </div>
        {formError && (
          <p className="admin-error" role="alert">{formError}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="admin-submit"
          aria-busy={submitting}
        >
          {submitting ? 'Skapar konto…' : 'Skapa konto'}
        </button>
      </form>
    </Card>
  );
}
