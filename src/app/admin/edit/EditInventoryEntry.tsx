'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

import EditInventoryClient from './EditInventoryClient';

/**
 * Resolves the URL into an item to edit.
 *
 * `?item=<convexId>` is the current form and is what every link in the console now emits. The
 * document id never changes, so an open editor stays bound to the record it was opened on.
 *
 * `?id=<oId>` is the older catalog-number form, kept working for bookmarks. It is resolved to a
 * document id once and then dropped, because `oId` doubles as display order: reordering the catalog
 * swaps it between two rows, so it is not a stable handle on a record.
 *
 * With neither, the most recently added item is the one to land on — almost always the one just
 * created.
 */
function EditInventoryEntryContent() {
    const searchParams = useSearchParams();

    const itemId = searchParams.get('item');
    const raw = searchParams.get('id');
    const parsed = raw ? Number.parseInt(raw, 10) : null;
    const legacyOId = parsed !== null && Number.isFinite(parsed) ? parsed : null;

    const resolvedId = useQuery(api.inventory.getInventoryIdByOId, itemId === null && legacyOId !== null ? { oId: legacyOId } : 'skip');
    const mostRecentOId = useQuery(api.inventory.getMostRecentOId, itemId === null && legacyOId === null ? {} : 'skip');
    const fallbackId = useQuery(
        api.inventory.getInventoryIdByOId,
        itemId === null && legacyOId === null && typeof mostRecentOId === 'number' ? { oId: mostRecentOId } : 'skip',
    );

    if (itemId !== null) return <EditInventoryClient id={itemId as Id<'inventory'>} />;

    if (legacyOId !== null) {
        if (resolvedId === undefined) return <p className="text-body-muted p-6 text-sm">Loading item…</p>;
        if (resolvedId) return <EditInventoryClient id={resolvedId} />;
        return <p className="text-body-muted p-6 text-sm">That item no longer exists.</p>;
    }

    if (mostRecentOId === undefined) return <p className="text-body-muted p-6 text-sm">Loading item…</p>;

    if (mostRecentOId === null) {
        return (
            <div className="flex flex-col gap-3 p-6">
                <p className="text-body text-sm font-bold">There is nothing in the catalog yet.</p>
                <Link href="/admin/inventory" className="text-gold-300 hover:text-gold-200 text-sm font-bold">
                    Go to the catalog
                </Link>
            </div>
        );
    }

    if (fallbackId === undefined) return <p className="text-body-muted p-6 text-sm">Loading item…</p>;
    if (!fallbackId) return <p className="text-body-muted p-6 text-sm">That item no longer exists.</p>;

    return <EditInventoryClient id={fallbackId} />;
}

export default function EditInventoryEntry() {
    return (
        <Suspense fallback={<p className="text-body-muted p-6 text-sm">Loading item…</p>}>
            <EditInventoryEntryContent />
        </Suspense>
    );
}
