'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import AdminShell from '@/components/admin/AdminShell';
import { AdminHeading, AdminPanel } from '@/components/admin/AdminPrimitives';
import { SkeletonListRows } from '@/components/admin/AdminSkeleton';

import AttentionFixRow from './AttentionFixRow';
import type { AttentionItem } from './attention.types';

/**
 * The catalog fix queue.
 *
 * The old version flagged 386 of 413 active items, which is not a queue — it is wallpaper, and a
 * badge that high trains you to ignore it. The rules behind it now separate problems that cost money
 * today from housekeeping (see `convex/inventoryRules.ts`), and the two tiers are shown as separate
 * panels so the top one stays short enough to finish.
 *
 * Progress is counted for the visit rather than read from a stored total: a queue you can watch
 * empty is a queue that gets emptied.
 */
export default function InventoryAttentionClient() {
    const items = useQuery(api.dashboard.getInventoryNeedingAttention) as AttentionItem[] | undefined;
    const [fixedThisVisit, setFixedThisVisit] = useState(0);

    const fixNow = items?.filter((item) => item.tier === 'fix-now') ?? [];
    const later = items?.filter((item) => item.tier === 'later') ?? [];

    return (
        <AdminShell title="Needs attention">
            <div className="flex flex-col gap-6 p-5 sm:p-8">
                <AdminHeading
                    eyebrow="Inventory"
                    title="Fix queue"
                    description="Fix live-job pricing first; handle photos and measurements later."
                    action={
                        <Link
                            href="/admin/inventory"
                            className="border-line text-body-muted hover:bg-surface-raised hover:text-body inline-flex shrink-0 items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <ArrowLeft size={16} aria-hidden="true" /> Back to catalog
                        </Link>
                    }
                />

                {fixedThisVisit > 0 && (
                    <p aria-live="polite" className="border-success/40 bg-success-soft text-success rounded-md border px-4 py-2.5 text-sm">
                        {fixedThisVisit} {fixedThisVisit === 1 ? 'item' : 'items'} fixed in this visit · {fixNow.length + later.length}{' '}
                        left.
                    </p>
                )}

                {items === undefined ? (
                    <AdminPanel eyebrow="Catalog" title="Fix now">
                        <SkeletonListRows rows={5} label="Checking the catalog" />
                    </AdminPanel>
                ) : items.length === 0 ? (
                    <div className="border-line bg-surface-raised flex flex-col items-center gap-3 rounded-lg border px-5 py-14 text-center">
                        <CheckCircle2 size={28} aria-hidden="true" className="text-success" />
                        <strong className="font-display text-body text-xl font-normal">Nothing needs fixing</strong>
                    </div>
                ) : (
                    <>
                        <AdminPanel
                            eyebrow="Costing you money"
                            title={fixNow.length === 0 ? 'Nothing urgent' : `Fix now · ${fixNow.length}`}
                        >
                            {fixNow.length === 0 ? (
                                <p className="text-success flex items-center justify-center gap-2 px-5 py-8 text-center text-sm">
                                    <CheckCircle2 size={16} aria-hidden="true" /> No unpriced items are out on a job, and nothing is
                                    over-assigned.
                                </p>
                            ) : (
                                <ul className="divide-line divide-y">
                                    {fixNow.map((item) => (
                                        <AttentionFixRow
                                            key={item._id}
                                            item={item}
                                            onFixed={() => setFixedThisVisit((count) => count + 1)}
                                        />
                                    ))}
                                </ul>
                            )}
                        </AdminPanel>

                        {later.length > 0 && (
                            <AdminPanel eyebrow="Housekeeping" title={`When you have time · ${later.length}`}>
                                <ul className="divide-line divide-y">
                                    {later.map((item) => (
                                        <AttentionFixRow
                                            key={item._id}
                                            item={item}
                                            onFixed={() => setFixedThisVisit((count) => count + 1)}
                                        />
                                    ))}
                                </ul>
                            </AdminPanel>
                        )}
                    </>
                )}
            </div>
        </AdminShell>
    );
}
