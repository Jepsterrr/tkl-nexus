'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Tag,
  Briefcase,
  Handshake,
  Settings,
  Shield,
  ArrowLeft,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',      icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Events',         icon: Calendar,        href: '/admin/events' },
  { label: 'Deals',          icon: Tag,             href: '/admin/deals' },
  { label: 'Jobb & Exjobb',  icon: Briefcase,       href: '/admin/opportunities' },
  { label: 'Partners',       icon: Handshake,       href: '/admin/partners' },
  { label: 'Inställningar',  icon: Settings,        href: '/admin/settings' },
  { label: 'Adminhantering', icon: Shield,          href: '/admin/admins' },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-text">TKL Admin</div>
          <div className="admin-sidebar-logo-sub">Adminpanel</div>
        </div>
        <nav className="admin-nav" aria-label="Admin-navigation">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`admin-nav-item${isActive ? ' admin-nav-item-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-back-link">
            <ArrowLeft size={14} aria-hidden="true" />
            Tillbaka till sajten
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav — visas via CSS endast på < 768px */}
      <nav className="admin-bottom-nav" aria-label="Admin-navigation (mobil)">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`admin-bottom-nav-item${isActive ? ' admin-bottom-nav-item-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <Icon size={20} aria-hidden="true" />
            </Link>
          );
        })}
        <Link href="/" className="admin-bottom-nav-item" aria-label="Tillbaka till sajten">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
      </nav>
    </>
  );
}
