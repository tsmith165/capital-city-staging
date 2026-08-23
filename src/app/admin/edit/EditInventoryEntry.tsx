'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';

import EditInventoryClient from './EditInventoryClient';

/**
 * Resolves `?id=<oId>` into an item to edit.
 *
 * The id in the URL is the original catalog number, not a Convex id, because that is what every
 * link into this page has carried since the migration. With no id, the most recently added item is
 * the one to land on — that is almost always the one just created.
 */
function EditInventoryEntryContent() {
    const searchParams = useSearchParams();
    const raw = searchParams.get('id');
    const parsed = raw ? Number.parseInt(raw, 10) : null;
    const oId = parsed !== null && Number.isFinite(parsed) ? parsed : null;

    const mostRecentOId = useQuery(api.inventory.getMostRecentOId, oId === null ? {} : 'skip');

    if (oId !== null) return <EditInventoryClient oId={oId} />;
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

    return <EditInventoryClient oId={mostRecentOId} />;
}

export default function EditInventoryEntry() {
    return (
        <Suspense fallback={<p className="text-body-muted p-6 text-sm">Loading item…</p>}>
            <EditInventoryEntryContent />
        </Suspense>
    );
}
