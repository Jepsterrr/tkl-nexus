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
    <div className="min-h-[calc(100svh-var(--navbar-height,72px))] flex items-center justify-center bg-[oklch(12%_0.01_265)] p-6">
      <div className="w-full max-w-88 bg-[oklch(16%_0.012_265)] border border-[oklch(28%_0.015_265)] rounded-md p-8 shadow-[0_0_0_1px_oklch(28%_0.015_265),0_8px_32px_oklch(8%_0.01_265/0.8)]">
        <div className="mb-8 text-center">
          <span className="font-(family-name:--font-heading) text-2xl font-extrabold tracking-[-0.04em] text-[oklch(72%_0.12_265)]">
            TKL
          </span>
          <p className="font-(family-name:--font-body) text-xs font-medium text-[oklch(55%_0.02_265)] uppercase tracking-widest mt-1">
            Adminpanel
          </p>
        </div>

        {errorOverride && (
          <p className="text-[0.8125rem] text-[oklch(65%_0.18_25)] mb-6" role="alert">
            {errorOverride}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-2 mb-6">
            <label htmlFor="admin-email" className="font-(family-name:--font-body) text-xs font-medium text-[oklch(65%_0.02_265)] tracking-[0.05em]">
              E-post
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.se"
              className="w-full bg-[oklch(19%_0.012_265)] border border-[oklch(28%_0.015_265)] rounded px-4 py-3 font-(family-name:--font-body) text-sm text-[oklch(90%_0.01_265)] placeholder:text-[oklch(40%_0.01_265)] outline-none transition-colors focus:border-[oklch(55%_0.12_265)]"
            />
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label htmlFor="admin-password" className="font-(family-name:--font-body) text-xs font-medium text-[oklch(65%_0.02_265)] tracking-[0.05em]">
              Lösenord
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[oklch(19%_0.012_265)] border border-[oklch(28%_0.015_265)] rounded px-4 py-3 font-(family-name:--font-body) text-sm text-[oklch(90%_0.01_265)] placeholder:text-[oklch(40%_0.01_265)] outline-none transition-colors focus:border-[oklch(55%_0.12_265)]"
            />
          </div>

          {error && (
            <p className="text-[0.8125rem] text-[oklch(65%_0.18_25)] mb-4" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="w-full py-3 px-4 bg-[oklch(55%_0.12_265)] text-[oklch(95%_0.01_265)] border-none rounded font-(family-name:--font-body) text-sm font-semibold cursor-pointer transition-colors hover:bg-[oklch(60%_0.12_265)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>
      </div>
    </div>
  );
}
