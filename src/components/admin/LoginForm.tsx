'use client';

import { useState, useTransition } from 'react';
import { signInAdmin } from '@/lib/services/auth';

interface LoginFormProps {
  onSuccess: () => void;
  errorOverride?: string;
}

export function LoginForm({ onSuccess, errorOverride }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await signInAdmin(email, password);
        onSuccess();
      } catch {
        setError('Felaktiga inloggningsuppgifter.');
      }
    });
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-login-logo">TKL</span>
          <p className="admin-login-sub">Adminpanel</p>
        </div>

        {errorOverride && (
          <p className="admin-error" role="alert" style={{ marginBottom: 'var(--space-6)' }}>
            {errorOverride}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-field">
            <label htmlFor="admin-email" className="admin-label">
              E-post
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              placeholder="din@email.se"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password" className="admin-label">
              Lösenord
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="admin-submit"
            aria-busy={isPending}
          >
            {isPending ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>
      </div>
    </div>
  );
}
