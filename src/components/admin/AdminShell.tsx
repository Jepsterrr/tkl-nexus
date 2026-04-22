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
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <AdminContentHeader user={user} />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
