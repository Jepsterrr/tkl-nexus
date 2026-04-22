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
      <div className="admin-login-wrap" aria-busy="true" aria-label="Laddar…">
        <div style={{ color: 'oklch(55% 0.02 265)', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>
          Laddar…
        </div>
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
