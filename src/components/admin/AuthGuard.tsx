'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { checkAdminAccess, signOutAdmin } from '@/lib/services/auth';
import { LoginForm } from './LoginForm';
import { AdminShell } from './AdminShell';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized'; email: string }
  | { status: 'authorized'; user: User };

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.email) {
        setAuthState({ status: 'unauthenticated' });
        return;
      }

      const isAdmin = await checkAdminAccess(user.email);
      if (isAdmin) {
        setAuthState({ status: 'authorized', user });
      } else {
        await signOutAdmin();
        setAuthState({ status: 'unauthorized', email: user.email });
      }
    });

    return unsubscribe;
  }, []);

  if (authState.status === 'loading') {
    return (
      <div className="min-h-[calc(100svh-var(--navbar-height,72px))] flex items-center justify-center bg-[oklch(12%_0.01_265)] p-6" aria-busy="true" aria-label="Laddar…">
        <p className="font-(family-name:--font-body) text-sm text-[oklch(55%_0.02_265)]">
          Laddar…
        </p>
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
