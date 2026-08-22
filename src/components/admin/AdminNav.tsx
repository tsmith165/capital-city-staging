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
            <span className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-body-subtle">Workspace</span>
            {ADMIN_NAVIGATION.map(({ href, label, detail, icon: Icon, badge }) => {
                const active = isActive(pathname, href);
                const count = badge ? badgeCounts[badge] : 0;

                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={`group grid min-h-14 grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                            active
                                ? 'border-line border-l-2 border-l-gold-300 bg-surface-overlay text-body'
                                : 'border-transparent text-body-muted hover:border-line hover:bg-surface-raised hover:text-body'
                        }`}
                    >
                        <Icon size={18} aria-hidden="true" />
                        <span className="flex min-w-0 flex-col">
                            <strong className="truncate text-xs font-bold">{label}</strong>
                            <small className="truncate text-[10px] leading-snug text-body-subtle">{detail}</small>
                        </span>
                        {count > 0 && (
                            <span
                                className="inline-grid h-6 min-w-6 place-items-center rounded-full border border-gold-400/55 bg-gold-400/10 px-1.5 text-[10px] font-extrabold leading-none text-gold-300"
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
