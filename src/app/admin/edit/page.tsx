'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import AdminShell from '@/components/admin/AdminShell';
import EditConvex from './EditConvex';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

function EditPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    // Parse the ID as a number (it's the original PostgreSQL ID)
    const oId = id ? parseInt(id, 10) : null;

    // Get the most recent oId if none provided
    const mostRecentOId = useQuery(api.inventory.getMostRecentOId);

    // Get the inventory item by oId
    const inventoryData = useQuery(api.inventory.getInventoryItemByOId, oId ? { oId } : 'skip');

    // Get adjacent oIds for navigation
    const adjacentOIds = useQuery(api.inventory.getAdjacentInventoryOIds, oId ? { oId } : 'skip');

    // Redirect to most recent if no ID provided
    React.useEffect(() => {
        if (!oId && mostRecentOId) {
            router.replace(`/admin/edit?id=${mostRecentOId}`);
        }
    }, [oId, mostRecentOId, router]);

    if (!oId && !mostRecentOId) {
        return (
            <AdminShell title="Edit inventory">
                <p className="p-8 text-center text-sm text-body-subtle">No inventory items found.</p>
            </AdminShell>
        );
    }

    if (inventoryData && oId) {
        return (
            <AdminShell title="Edit inventory">
                <EditConvex
                    inventoryData={inventoryData}
                    currentOId={oId}
                    nextOId={adjacentOIds?.nextOId || null}
                    prevOId={adjacentOIds?.prevOId || null}
                />
            </AdminShell>
        );
    }

    return (
        <AdminShell title="Edit inventory">
            <LoadingSpinner page="Edit" />
        </AdminShell>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<LoadingSpinner page="Edit" />}>
            <EditPageContent />
        </Suspense>
    );
}
