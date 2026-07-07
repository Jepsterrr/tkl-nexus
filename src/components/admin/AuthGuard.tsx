'use client';

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase-auth';
import { checkAdminAccess, signOutAdmin } from '@/lib/services/auth';
import { LoginForm } from './LoginForm';
import { AdminShell } from './AdminShell';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized'; email: string }
  | { status: 'error' }
  | { status: 'authorized'; user: User };

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });
  const [retryKey, setRetryKey] = useState(0);
  // signOutAdmin() triggar ett null-event i onAuthStateChanged som annars
  // skriver över 'unauthorized'-staten — null-eventet läser refen istället
  // så felmeddelandet överlever utloggningen.
  const deniedEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.email) {
        const deniedEmail = deniedEmailRef.current;
        deniedEmailRef.current = null;
        setAuthState(
          deniedEmail
            ? { status: 'unauthorized', email: deniedEmail }
            : { status: 'unauthenticated' }
        );
        return;
      }

      try {
        const isAdmin = await checkAdminAccess(user.email);
        if (isAdmin) {
          setAuthState({ status: 'authorized', user });
        } else {
          deniedEmailRef.current = user.email;
          await signOutAdmin();
        }
      } catch {
        // Nätverksfel eller oväntat Firestore-fel — visa retry istället
        // för att fastna i evig laddning.
        deniedEmailRef.current = null;
        setAuthState({ status: 'error' });
      }
    });

    return unsubscribe;
  }, [retryKey]);

  if (authState.status === 'loading') {
    return (
      <div className="min-h-[calc(100svh-var(--navbar-height,72px))] flex items-center justify-center bg-[oklch(12%_0.01_265)] p-6" role="status" aria-busy="true" aria-label="Laddar…">
        <p className="font-(family-name:--font-body) text-sm text-[oklch(55%_0.02_265)]">
          Laddar…
        </p>
      </div>
    );
  }

  if (authState.status === 'error') {
    return (
      <div className="min-h-[calc(100svh-var(--navbar-height,72px))] flex flex-col items-center justify-center gap-3 bg-[oklch(12%_0.01_265)] p-6">
        <p className="font-(family-name:--font-body) text-sm text-[oklch(65%_0.2_25)]" role="alert">
          Kunde inte verifiera adminbehörighet. Kontrollera din anslutning.
        </p>
        <button
          type="button"
          onClick={() => { setAuthState({ status: 'loading' }); setRetryKey((k) => k + 1); }}
          className="text-xs text-[oklch(55%_0.12_265)] hover:text-[oklch(70%_0.12_265)] transition-colors cursor-pointer"
        >
          Försök igen
        </button>
      </div>
    );
  }

  if (authState.status === 'unauthorized') {
    return (
      <LoginForm
        onSuccess={() => setAuthState({ status: 'loading' })}
        errorOverride={`${authState.email} har inte adminbehörighet.`}
      />
    );
  }

  if (authState.status === 'unauthenticated') {
    return <LoginForm onSuccess={() => setAuthState({ status: 'loading' })} />;
  }

  return (
    <AdminShell user={authState.user}>
      {children}
    </AdminShell>
  );
}
