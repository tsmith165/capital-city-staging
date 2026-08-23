'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { ClipboardList, PackageOpen, Plus, Undo2, Wrench } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminHeading, AdminMetric, AdminStatus } from '@/components/admin/AdminPrimitives';
import { SkeletonBlock, SkeletonMetricGrid, SkeletonTiles } from '@/components/admin/AdminSkeleton';
import AddInventoryOverlay from '@/components/AddInventoryOverlay';
import InventoryCard from '@/components/admin/inventory/InventoryCard';
import InventoryFilterBar from '@/components/admin/inventory/InventoryFilterBar';
import PhotoLightbox from '@/components/admin/inventory/PhotoLightbox';
import QuantityStepper from '@/components/admin/inventory/QuantityStepper';
import { INVENTORY_GRID_CLASSES } from '@/components/admin/inventory/inventory.constants';
import { useInventoryFilters } from '@/components/admin/inventory/useInventoryFilters';
import { useStagingList } from '@/components/admin/inventory/useStagingList';
import type { AvailabilityFilter, InventoryFilterState } from '@/components/admin/inventory/inventory.types';
import type { LineProblem } from '@/components/admin/inventory/staging.types';

import CatalogSidePanel from './CatalogSidePanel';
import ProjectPicker from './ProjectPicker';
import type { CatalogItem } from './catalog.types';

/**
 * The catalog, and — once a house is chosen — the place furniture is picked for it.
 *
 * Picking used to live on a separate screen reached through a project, so browsing the catalog and
 * staging a house were different activities with different filters and no shared state. Holding the
 * target house in the header collapses them: the same grid, the same search, and a third column that
 * shows either what she is about to add or whatever item she just tapped for a closer look.
 */

const number = new Intl.NumberFormat('en-US');

export default function InventoryConvexClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    /*
     * Seeded from the URL once, then written by the handlers below. Re-reading `searchParams` every
     * render would feed the component its own output.
     */
    const [projectId, setProjectId] = useState<string | null>(searchParams.get('project'));

    const projects = useQuery(api.projects.getProjectOptions);
    const items = useQuery(api.inventory.getCatalog, projectId ? { projectId: projectId as Id<'projects'> } : {}) as
        CatalogItem[] | null | undefined;
    const assignItems = useMutation(api.assignments.assignItemsToProject);

    const { filters, update, visible, categories, locations, counts } = useInventoryFilters(items ?? undefined, {
        search: searchParams.get('search') ?? '',
        category: searchParams.get('category') ?? '',
        availability: (searchParams.get('availability') as AvailabilityFilter | null) ?? 'all',
    });

    const { toggle, setQuantity, remove, clear, summary } = useStagingList(items ?? undefined, projectId ?? undefined);

    const [showAddOverlay, setShowAddOverlay] = useState(false);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
    const [problems, setProblems] = useState<LineProblem[]>([]);
    const [committing, setCommitting] = useState(false);
    const [flash, setFlash] = useState<string | null>(null);

    const activeProject = projects?.find((project) => project._id === projectId) ?? null;

    /** Filters and the selected house both live in the URL, so a view can be reloaded or shared. */
    const writeUrl = (next: InventoryFilterState & { project: string | null }) => {
        const params = new URLSearchParams();
        if (next.search) params.set('search', next.search);
        if (next.category) params.set('category', next.category);
        if (next.availability !== 'all') params.set('availability', next.availability);
        if (next.project) params.set('project', next.project);

        const query = params.toString();
        router.replace(query ? `/admin/inventory?${query}` : '/admin/inventory', { scroll: false });
    };

    const handleFilterChange = <K extends keyof InventoryFilterState>(key: K, value: InventoryFilterState[K]) => {
        update(key, value);
        writeUrl({ ...filters, [key]: value, project: projectId });
    };

    const handleProjectChange = (nextProjectId: string | null) => {
        setProjectId(nextProjectId);
        /* The pending list belongs to the house it was built for. */
        clear();
        setProblems([]);
        setFlash(null);
        writeUrl({ ...filters, project: nextProjectId });
    };

    const handleCommit = async () => {
        if (!projectId || summary.lines.length === 0) return;

        setCommitting(true);
        setFlash(null);
        try {
            const result = await assignItems({
                projectId: projectId as Id<'projects'>,
                lines: summary.lines.map((line) => ({
                    inventoryId: line.inventoryId as Id<'inventory'>,
                    quantity: line.quantity,
                })),
            });

            if (result.ok) {
                setProblems([]);
                clear();
                const parts = [
                    result.added && `${result.added} added`,
                    result.updated && `${result.updated} changed`,
                    result.removed && `${result.removed} taken off`,
                ].filter(Boolean);
                setFlash(
                    parts.length ? `Saved to ${activeProject?.name ?? 'the house'} — ${parts.join(', ')}.` : 'Nothing needed changing.',
                );
            } else {
                /* Nothing was written, so keep the list and mark only the lines that blocked it. */
                setProblems(result.problems);
                setPanelOpen(true);
            }
        } catch (error) {
            setProblems([]);
            setFlash(error instanceof Error ? error.message : 'Could not save this list. Try again.');
        } finally {
            setCommitting(false);
        }
    };

    const openDetail = (itemId: string) => {
        setDetailId(itemId);
        setPanelOpen(true);
    };

    const currentQuantity = (item: CatalogItem) => {
        const line = [...summary.adding, ...summary.changing, ...summary.removing].find((candidate) => candidate.item._id === item._id);
        return line ? line.desired : item.assignedHere;
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

    const staging = Boolean(activeProject);

    return (
        <div className="flex min-h-full flex-col xl:flex-row xl:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-6 p-5 sm:p-8">
                <AdminHeading
                    eyebrow="Inventory"
                    title="Catalog"
                    description={
                        staging
                            ? 'Tap items to build a list for the selected house. Nothing is saved until you commit it.'
                            : 'Everything you own, what is free to stage, and which house is holding the rest.'
                    }
                    action={
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <ProjectPicker projects={projects} selectedId={projectId} onSelect={handleProjectChange} />
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
                                {number.format(awaitingCheckIn)} {awaitingCheckIn === 1 ? 'unit is' : 'units are'} still checked out to
                                finished jobs
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

                <div className="bg-ink/95 border-line sticky top-0 z-20 -mx-5 border-b px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
                    <InventoryFilterBar
                        filters={filters}
                        onChange={handleFilterChange}
                        categories={categories}
                        locations={locations}
                        counts={counts}
                        summary={`${visible.length} of ${items.length} items`}
                    />
                </div>

                <p aria-live="polite" className="sr-only">
                    {flash ?? ''}
                </p>
                {flash && <p className="border-success/40 bg-success-soft text-success rounded-md border px-4 py-2.5 text-sm">{flash}</p>}

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
                        {visible.map((item) => {
                            const selected = summary.selectedIds.has(item._id);
                            const quantity = currentQuantity(item);
                            const problem = problems.find((candidate) => candidate.inventoryId === item._id);
                            const pickable = staging && item.maxForThisProject > 0;

                            return (
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
                                    selected={selected}
                                    actionLabel={
                                        staging
                                            ? `${selected ? 'Remove' : 'Add'} ${item.name}${
                                                  item.assignedHere ? `, ${item.assignedHere} already at this house` : ''
                                              }`
                                            : `Open details for ${item.name}`
                                    }
                                    /* With a house selected the tap is worth more as "pick this"; detail
                                       moves to its own control so both stay one gesture away. */
                                    onActivate={staging ? (pickable ? () => toggle(item) : undefined) : () => openDetail(item._id)}
                                    onInspect={staging ? () => openDetail(item._id) : undefined}
                                    onZoom={item.imagePath ? () => setLightbox({ src: item.imagePath, alt: item.name }) : undefined}
                                    badge={
                                        item.assignedHere > 0 ? (
                                            <AdminStatus tone="info">At this house · {item.assignedHere}</AdminStatus>
                                        ) : undefined
                                    }
                                    footer={
                                        selected ? (
                                            <div className="flex flex-col gap-1.5">
                                                <QuantityStepper
                                                    value={quantity}
                                                    max={item.maxForThisProject}
                                                    label={item.name}
                                                    onChange={(next) => setQuantity(item, next)}
                                                />
                                                {problem && <small className="text-danger text-[11px] font-bold">{problem.message}</small>}
                                            </div>
                                        ) : staging && item.maxForThisProject === 0 ? (
                                            <small className="text-body-subtle block px-1 text-[11px]">
                                                {item.awaitingCheckIn > 0
                                                    ? 'Still checked out to a finished job'
                                                    : 'All units are out on another house'}
                                            </small>
                                        ) : undefined
                                    }
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <CatalogSidePanel
                open={panelOpen}
                onOpenChange={(next) => {
                    setPanelOpen(next);
                    if (!next) setDetailId(null);
                }}
                detailItemId={detailId}
                onCloseDetail={() => setDetailId(null)}
                project={activeProject}
                projects={projects}
                summary={summary}
                problems={problems}
                committing={committing}
                onQuantityChange={setQuantity}
                onRemove={remove}
                onClear={() => {
                    clear();
                    setProblems([]);
                }}
                onCommit={handleCommit}
            />

            {/* Below xl the panel is an overlay, so the pending list needs a way back on screen. */}
            {summary.pendingCount > 0 && (
                <button
                    type="button"
                    onClick={() => {
                        setDetailId(null);
                        setPanelOpen(true);
                    }}
                    className="bg-gold-400 text-body-inverse shadow-overlay hover:bg-gold-300 fixed right-5 bottom-5 z-30 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors xl:hidden"
                >
                    <ClipboardList size={16} aria-hidden="true" />
                    {summary.pendingCount} pending
                </button>
            )}

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
