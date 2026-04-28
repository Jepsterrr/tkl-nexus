'use client';

import type { User } from 'firebase/auth';
import { AdminSidebar } from './AdminSidebar';
import { AdminContentHeader } from './AdminContentHeader';

interface AdminShellProps {
  user: User;
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  return (
    <div className="flex h-svh bg-[oklch(12%_0.01_265)] text-[oklch(88%_0.01_265)] font-(family-name:--font-body)">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminContentHeader user={user} />
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
