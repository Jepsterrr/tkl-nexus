'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin/settings/stats',    label: 'Statistik'  },
  { href: '/admin/settings/contact',  label: 'Kontakt'    },
  { href: '/admin/settings/about',    label: 'Om oss'     },
  { href: '/admin/settings/services', label: 'Tjänster'   },
  { href: '/admin/settings/links',    label: 'Länkar'     },
  { href: '/admin/settings/timeline', label: 'Tidslinje'  },
  { href: '/admin/settings/banner',   label: 'Banner'     },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Inställningar-navigering"
      className="flex sm:flex-col overflow-x-auto scrollbar-none shrink-0 sm:w-40 border-b sm:border-b-0 sm:border-r border-[oklch(20%_0.012_265)]"
    >
      {LINKS.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'block px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-[oklch(22%_0.012_265)] border-b sm:border-b-0 sm:border-l border-[oklch(55%_0.12_265)] text-[oklch(88%_0.01_265)]'
                : 'text-[oklch(58%_0.02_265)] hover:text-[oklch(75%_0.015_265)]',
            ].join(' ')}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
