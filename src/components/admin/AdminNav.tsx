'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { ADMIN_NAVIGATION } from './AdminShell.constants';

/**
 * `/admin` is a prefix of every other admin route, so it only matches exactly.
 * Everything else matches its subtree so nested editors keep their parent highlighted.
 */
function isActive(pathname: string, href: string): boolean {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
    const pathname = usePathname();
    const summary = useQuery(api.dashboard.getDashboardSummary);

    const badgeCounts = {
        inbox: summary?.inbox.unanswered ?? 0,
        inventoryAttention: summary?.inventory.needsAttention ?? 0,
    };

    return (
        <nav aria-label="Admin sections" className="flex flex-col gap-1 overflow-y-auto p-3">
            <span className="text-body-subtle px-3 pb-2 text-[10px] font-extrabold tracking-[0.14em] uppercase">Workspace</span>
            {ADMIN_NAVIGATION.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(pathname, href);
                const count = badge ? badgeCounts[badge] : 0;

                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={`group grid min-h-11 grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                            active
                                ? 'border-line border-l-gold-300 bg-surface-overlay text-body border-l-2'
                                : 'text-body-muted hover:border-line hover:bg-surface-raised hover:text-body border-transparent'
                        }`}
                    >
                        <Icon size={18} aria-hidden="true" />
                        <strong className="truncate text-sm font-bold">{label}</strong>
                        {count > 0 && (
                            <span
                                className="border-gold-400/55 bg-gold-400/10 text-gold-300 inline-grid h-6 min-w-6 place-items-center rounded-full border px-1.5 text-[10px] leading-none font-extrabold"
                                aria-label={`${count} needing attention`}
                            >
                                {count}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
