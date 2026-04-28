'use client';

import { useState } from 'react';
import type { User } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import { signOutAdmin } from '@/lib/services/auth';

const TITLE_MAP: Record<string, string> = {
  '/admin/dashboard':     'Dashboard',
  '/admin/events':        'Events',
  '/admin/deals':         'Deals',
  '/admin/career': 'Jobb & Exjobb',
  '/admin/partners':      'Partners',
  '/admin/settings':      'Inställningar',
  '/admin/admins':        'Adminhantering',
};

const PREFIX_MAP: [string, string][] = [
  ['/admin/events',        'Events'],
  ['/admin/deals',         'Deals'],
  ['/admin/career', 'Jobb & Exjobb'],
  ['/admin/partners',      'Partners'],
  ['/admin/admins',        'Adminhantering'],
];

interface AdminContentHeaderProps {
  user: User;
}

export function AdminContentHeader({ user }: AdminContentHeaderProps) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutAdmin();
    } catch {
      // AuthGuard handles auth state — sign-out failure is non-critical
    } finally {
      setSigningOut(false);
    }
  };
  const title =
    TITLE_MAP[pathname] ??
    PREFIX_MAP.find(([prefix]) => pathname.startsWith(prefix + '/'))?.[1] ??
    'Admin';

  return (
    <header className="h-[52px] shrink-0 flex items-center justify-between px-8 bg-[oklch(14%_0.012_265)] border-b border-[oklch(22%_0.015_265)]">
      <span className="text-[0.8125rem] font-semibold text-[oklch(65%_0.02_265)] uppercase tracking-[0.08em]">
        {title}
      </span>
      <div className="flex items-center gap-4 text-[0.8125rem] text-[oklch(45%_0.02_265)]">
        <span>{user.email ?? ''}</span>
        <button
          type="button"
          title="Logga ut från adminpanelen"
          disabled={signingOut}
          className="border border-[oklch(28%_0.015_265)] rounded px-3 py-1 text-xs text-[oklch(55%_0.02_265)] font-(family-name:--font-body) cursor-pointer transition-colors hover:border-[oklch(55%_0.12_265)] hover:text-[oklch(80%_0.02_265)] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSignOut}
        >
          {signingOut ? 'Loggar ut…' : 'Logga ut'}
        </button>
      </div>
    </header>
  );
}
