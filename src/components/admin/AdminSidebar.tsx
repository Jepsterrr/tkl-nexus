'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Tag,
  Briefcase,
  Handshake,
  Settings,
  Shield,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',      icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Events',         icon: Calendar,        href: '/admin/events' },
  { label: 'Deals',          icon: Tag,             href: '/admin/deals' },
  { label: 'Jobb & Exjobb',  icon: Briefcase,       href: '/admin/career' },
  { label: 'Partners',       icon: Handshake,       href: '/admin/partners' },
  { label: 'Inställningar',  icon: Settings,        href: '/admin/settings' },
  { label: 'Adminhantering', icon: Shield,          href: '/admin/admins' },
] as const;

const LS_KEY = 'admin-sidebar-collapsed';

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration-safe: läs localStorage efter mount
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(LS_KEY) === 'true');
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(LS_KEY, String(next));
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden md:flex flex-col shrink-0
          bg-[oklch(10%_0.01_265)] border-r border-[oklch(22%_0.015_265)]
          overflow-y-auto overflow-x-hidden
          transition-[width] duration-200 ease-in-out
          ${mounted ? (collapsed ? 'w-14' : 'w-56') : 'w-56'}
        `}
        aria-label="Admin-navigation"
      >
        {/* Logo */}
        <div className={`shrink-0 border-b border-[oklch(22%_0.015_265)] ${collapsed ? 'px-3 py-5 flex items-center justify-center' : 'px-5 py-6'}`}>
          {collapsed ? (
            <span
              className="font-(family-name:--font-heading) text-sm font-extrabold tracking-[-0.02em] text-[oklch(72%_0.12_265)]"
              title="TKL Admin"
            >
              TKL
            </span>
          ) : (
            <>
              <div className="font-(family-name:--font-heading) text-base font-extrabold tracking-[-0.02em] text-[oklch(72%_0.12_265)]">
                TKL Admin
              </div>
              <div className="text-[0.6875rem] font-medium text-[oklch(45%_0.02_265)] uppercase tracking-[0.08em] mt-1">
                Adminpanel
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5" aria-label="Admin-navigation">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-3 px-5 py-3 text-[0.8125rem] font-medium no-underline
                  transition-colors duration-150 rounded-sm
                  ${isActive
                    ? 'bg-[oklch(55%_0.12_265/15%)] text-[oklch(80%_0.08_265)]'
                    : 'text-[oklch(55%_0.02_265)] hover:bg-[oklch(20%_0.012_265)] hover:text-[oklch(80%_0.01_265)]'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
              >
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`shrink-0 border-t border-[oklch(22%_0.015_265)] mt-auto ${collapsed ? 'p-2 flex flex-col items-center gap-2' : 'px-5 py-4 flex flex-col gap-2'}`}>
          {/* Tillbaka till sajten */}
          <Link
            href="/"
            title="Tillbaka till sajten"
            className={`
              flex items-center gap-2 text-xs font-medium no-underline
              text-[oklch(45%_0.02_265)] rounded-md transition-colors duration-150
              hover:bg-[oklch(20%_0.012_265)] hover:text-[oklch(72%_0.08_265)]
              ${collapsed ? 'p-2 justify-center w-full' : 'px-3 py-2'}
            `}
          >
            <ArrowLeft size={14} aria-hidden="true" className="shrink-0" />
            {!collapsed && <span>Tillbaka till sajten</span>}
          </Link>

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={toggleCollapse}
            title={collapsed ? 'Expandera sidebar' : 'Fäll ihop sidebar'}
            aria-label={collapsed ? 'Expandera sidebar' : 'Fäll ihop sidebar'}
            className={`
              flex items-center gap-2 text-xs font-medium
              text-[oklch(35%_0.015_265)] rounded-md transition-colors duration-150
              hover:bg-[oklch(20%_0.012_265)] hover:text-[oklch(55%_0.02_265)]
              ${collapsed ? 'p-2 justify-center w-full' : 'px-3 py-2'}
            `}
          >
            {collapsed
              ? <ChevronRight size={14} aria-hidden="true" />
              : <><ChevronLeft size={14} aria-hidden="true" /><span>Fäll ihop</span></>
            }
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] flex items-center justify-around bg-[oklch(10%_0.01_265)] border-t border-[oklch(22%_0.015_265)] z-50"
        aria-label="Admin-navigation (mobil)"
      >
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center p-1 transition-colors ${
                isActive ? 'text-[oklch(72%_0.12_265)]' : 'text-[oklch(45%_0.02_265)]'
              }`}
            >
              <Icon size={20} aria-hidden="true" />
            </Link>
          );
        })}
        <Link
          href="/"
          aria-label="Tillbaka till sajten"
          title="Tillbaka till sajten"
          className="flex flex-col items-center justify-center p-1 text-[oklch(45%_0.02_265)] transition-colors"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
      </nav>
    </>
  );
}
