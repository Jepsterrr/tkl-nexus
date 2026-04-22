'use client';

import type { User } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import { signOutAdmin } from '@/lib/services/auth';

const TITLE_MAP: Record<string, string> = {
  '/admin/dashboard':     'Dashboard',
  '/admin/events':        'Events',
  '/admin/deals':         'Deals',
  '/admin/opportunities': 'Jobb & Exjobb',
  '/admin/partners':      'Partners',
  '/admin/settings':      'Inställningar',
  '/admin/admins':        'Adminhantering',
};

interface AdminContentHeaderProps {
  user: User;
}

export function AdminContentHeader({ user }: AdminContentHeaderProps) {
  const pathname = usePathname();
  const title = TITLE_MAP[pathname] ?? 'Admin';

  return (
    <header className="admin-content-header">
      <span className="admin-content-header-title">{title}</span>
      <div className="admin-content-header-right">
        <span>{user.email}</span>
        <button
          className="admin-signout"
          onClick={() => { signOutAdmin(); }}
        >
          Logga ut
        </button>
      </div>
    </header>
  );
}
