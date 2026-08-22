'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { PackageOpen, Plus, Undo2, Wrench } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import { AdminHeading, AdminMetric } from '@/components/admin/AdminPrimitives';
import { SkeletonBlock, SkeletonMetricGrid, SkeletonTiles } from '@/components/admin/AdminSkeleton';
import AddInventoryOverlay from '@/components/AddInventoryOverlay';
import InventoryCard from '@/components/admin/inventory/InventoryCard';
import InventoryFilterBar from '@/components/admin/inventory/InventoryFilterBar';
import PhotoLightbox from '@/components/admin/inventory/PhotoLightbox';
import { INVENTORY_GRID_CLASSES } from '@/components/admin/inventory/inventory.constants';
import { useInventoryFilters } from '@/components/admin/inventory/useInventoryFilters';
import type { AvailabilityFilter, InventoryFilterState } from '@/components/admin/inventory/inventory.types';

import ItemDetailSheet from './ItemDetailSheet';
import type { CatalogItem } from './catalog.types';

/**
 * The catalog.
 *
 * 413 items is a small dataset that used to feel enormous because the page offered no way to slice it
 * and the cards answered none of the questions being asked of them. Filters are the navigation, not
 * pagination — pagination breaks browsing by eye, which is the whole point of a photo grid — and at
 * this size `next/image` lazy loading covers the render cost without a virtualization dependency.
 *
 * The card now leads with availability, which was previously `count - inUse` and therefore always
 * reported the full stock as free.
 */

const number = new Intl.NumberFormat('en-US');

export default function InventoryConvexClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const items = useQuery(api.inventory.getCatalog, {}) as CatalogItem[] | null | undefined;

    /*
     * Seeded from the URL once so the dashboard can deep-link into a slice of the catalog. The
     * handlers below write the URL, so re-reading `searchParams` on every render would feed the
     * component its own output.
     */
    const { filters, update, visible, categories, locations, counts } = useInventoryFilters(items ?? undefined, {
        search: searchParams.get('search') ?? '',
        category: searchParams.get('category') ?? '',
        availability: (searchParams.get('availability') as AvailabilityFilter | null) ?? 'all',
    });

    const [showAddOverlay, setShowAddOverlay] = useState(false);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

    /** Filter changes are pushed to the URL from the handler, so no effect watches the state. */
    const handleFilterChange = <K extends keyof InventoryFilterState>(key: K, value: InventoryFilterState[K]) => {
        update(key, value);

        const next = { ...filters, [key]: value };
        const params = new URLSearchParams();
        if (next.search) params.set('search', next.search);
        if (next.category) params.set('category', next.category);
        if (next.availability !== 'all') params.set('availability', next.availability);

        const query = params.toString();
        router.replace(query ? `/admin/inventory?${query}` : '/admin/inventory', { scroll: false });
    };

    const awaitingCheckIn = (items ?? []).reduce((total, item) => total + item.awaitingCheckIn, 0);
    const totals = (items ?? []).reduce(
        (accumulator, item) => ({
            owned: accumulator.owned + item.owned,
            free: accumulator.free + item.free,
            out: accumulator.out + item.out,
        }),
        { owned: 0, free: 0, out: 0 },
    );

    if (items === undefined) {
        return (
            <div className="flex flex-col gap-6 p-5 sm:p-8">
                <SkeletonBlock className="h-8 w-56" />
                <SkeletonMetricGrid count={3} columns={3} label="Loading catalog totals" />
                <SkeletonBlock className="h-10 w-full max-w-2xl" />
                <SkeletonTiles count={10} label="Loading inventory" />
            </div>
        );
    }

    /* The query returns null rather than throwing while Clerk is still handing over the token. */
    if (items === null) {
        return (
            <div className="p-5 sm:p-8">
                <p className="border-line bg-surface-raised text-body-muted rounded-lg border px-5 py-8 text-center text-sm">
                    You do not have access to the catalog.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-5 sm:p-8">
            <AdminHeading
                eyebrow="Inventory"
                title="Catalog"
                description="Everything you own, what is free to stage, and which house is holding the rest."
                action={
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                            href="/admin/inventory/attention"
                            className="border-line text-body-muted hover:bg-surface-raised hover:text-body inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <Wrench size={15} aria-hidden="true" /> Fix queue
                            {counts.attention > 0 && (
                                <span className="bg-warning-soft text-warning rounded-full px-1.5 text-[11px]">{counts.attention}</span>
                            )}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowAddOverlay(true)}
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <Plus size={16} aria-hidden="true" /> Add item
                        </button>
                    </div>
                }
            />

            {awaitingCheckIn > 0 && (
                <Link
                    href="/admin/inventory/check-in"
                    className="border-warning/40 bg-warning-soft hover:border-warning/70 flex items-center gap-3 rounded-lg border px-4 py-3.5 transition-colors"
                >
                    <Undo2 size={18} aria-hidden="true" className="text-warning shrink-0" />
                    <span className="flex min-w-0 flex-col">
                        <strong className="text-warning text-sm font-bold">
                            {number.format(awaitingCheckIn)} {awaitingCheckIn === 1 ? 'unit is' : 'units are'} still checked out to finished
                            jobs
                        </strong>
                        <small className="text-body-muted text-xs">
                            Until they are checked in, everything below understates what you have free.
                        </small>
                    </span>
                    <span className="text-warning ml-auto shrink-0 text-xs font-bold">Check them in</span>
                </Link>
            )}

            <div className="grid gap-3 sm:grid-cols-3" aria-label="Catalog totals">
                <AdminMetric
                    label="Free to stage"
                    value={`${number.format(totals.free)} units`}
                    hint={`of ${number.format(totals.owned)} owned`}
                />
                <AdminMetric label="Out staging" value={`${number.format(totals.out)} units`} hint="At a house being staged now" />
                <AdminMetric
                    label="Items in the catalog"
                    value={number.format(items.length)}
                    hint={`${number.format(categories.length)} categories`}
                />
            </div>

            <InventoryFilterBar
                filters={filters}
                onChange={handleFilterChange}
                categories={categories}
                locations={locations}
                counts={counts}
                summary={`${visible.length} of ${items.length} items`}
            />

            {visible.length === 0 ? (
                <div className="border-line bg-surface-raised flex flex-col items-center gap-3 rounded-lg border px-5 py-14 text-center">
                    <PackageOpen size={26} aria-hidden="true" className="text-body-subtle" />
                    <strong className="font-display text-body text-lg font-normal">Nothing matches those filters</strong>
                    <p className="text-body-muted max-w-sm text-sm">
                        {items.length === 0
                            ? 'The catalog is empty. Add your first piece of furniture to get started.'
                            : 'Try a different category, or clear the filters to see everything.'}
                    </p>
                    {items.length === 0 && (
                        <button
                            type="button"
                            onClick={() => setShowAddOverlay(true)}
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 mt-1 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <Plus size={16} aria-hidden="true" /> Add the first item
                        </button>
                    )}
                </div>
            ) : (
                <div className={INVENTORY_GRID_CLASSES}>
                    {visible.map((item) => (
                        <InventoryCard
                            key={item._id}
                            name={item.name}
                            category={item.category}
                            price={item.price}
                            thumbnail={item.smallImagePath}
                            inactive={!item.active}
                            availability={{
                                owned: item.owned,
                                out: item.out,
                                awaitingCheckIn: item.awaitingCheckIn,
                                free: item.free,
                                holderName: item.holderName,
                                holderCount: item.holderCount,
                            }}
                            actionLabel={`Open details for ${item.name}`}
                            onActivate={() => setDetailId(item._id)}
                            onZoom={item.imagePath ? () => setLightbox({ src: item.imagePath, alt: item.name }) : undefined}
                        />
                    ))}
                </div>
            )}

            {detailId && <ItemDetailSheet itemId={detailId} onClose={() => setDetailId(null)} />}
            {lightbox && <PhotoLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}

            {showAddOverlay && (
                <AddInventoryOverlay
                    onClose={() => setShowAddOverlay(false)}
                    onSuccess={() => setShowAddOverlay(false)}
                    defaultAction="stay"
                />
            )}
        </div>
    );
}
