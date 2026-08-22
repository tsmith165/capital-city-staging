'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { ChevronLeft, PackageOpen } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminHeading, AdminStatus } from '@/components/admin/AdminPrimitives';
import { SkeletonBlock, SkeletonTiles } from '@/components/admin/AdminSkeleton';
import InventoryCard from '@/components/admin/inventory/InventoryCard';
import InventoryFilterBar from '@/components/admin/inventory/InventoryFilterBar';
import PhotoLightbox from '@/components/admin/inventory/PhotoLightbox';
import QuantityStepper from '@/components/admin/inventory/QuantityStepper';
import { INVENTORY_GRID_CLASSES } from '@/components/admin/inventory/inventory.constants';
import { useInventoryFilters } from '@/components/admin/inventory/useInventoryFilters';

import StagingListTray from './StagingListTray';
import { useStagingList } from './useStagingList';
import type { LineProblem, PickerItem } from './picker.types';

/**
 * Pick furniture for one house.
 *
 * The screen is a selection layer over a photo grid, committed as a single transaction. Previously
 * every card carried its own quantity field and its own "Add to Project" button, so a twenty-item
 * house meant twenty round trips with no review step and no way to back out — and because each add
 * was independent, a mistake halfway through left the job half-staged.
 *
 * Items already at this house stay in the grid with an "At this house" badge instead of being
 * filtered out, which is what the old `count - inUse > 0` filter did: it hid the item she had just
 * assigned, so the chair appeared to vanish from the catalog.
 */

export default function ProjectInventoryClient({ projectId }: { projectId: string }) {
    const data = useQuery(api.assignments.getPickerData, { projectId: projectId as Id<'projects'> });
    const assignItems = useMutation(api.assignments.assignItemsToProject);

    const items = data?.items as PickerItem[] | undefined;
    const { filters, update, visible, categories, locations, counts } = useInventoryFilters(items);
    const { toggle, setQuantity, remove, clear, summary } = useStagingList(items);

    const [expanded, setExpanded] = useState(false);
    const [problems, setProblems] = useState<LineProblem[]>([]);
    const [committing, setCommitting] = useState(false);
    const [flash, setFlash] = useState<string | null>(null);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

    const searchRef = useRef<HTMLInputElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLElement | null)[]>([]);

    const handleCommit = async () => {
        if (summary.lines.length === 0) return;

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
                setExpanded(false);
                const parts = [
                    result.added && `${result.added} added`,
                    result.updated && `${result.updated} changed`,
                    result.removed && `${result.removed} taken off`,
                ].filter(Boolean);
                setFlash(parts.length ? `Saved — ${parts.join(', ')}.` : 'Nothing needed changing.');
            } else {
                /* Nothing was written, so keep the list intact and mark only the lines that blocked it. */
                setProblems(result.problems);
                setExpanded(true);
            }
        } catch (error) {
            setProblems([]);
            setFlash(error instanceof Error ? error.message : 'Could not save this list. Try again.');
        } finally {
            setCommitting(false);
        }
    };

    const currentQuantity = (item: PickerItem) => {
        const line = [...summary.adding, ...summary.changing, ...summary.removing].find((candidate) => candidate.item._id === item._id);
        return line ? line.desired : item.assignedHere;
    };

    /**
     * Arrow keys walk the grid; Space toggles selection natively because every card is a button.
     * The column count is measured rather than assumed, because the grid is responsive.
     */
    const handleGridKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const focusedIndex = cardRefs.current.findIndex((node) => node?.contains(document.activeElement));
        if (focusedIndex === -1) return;

        const columns = gridRef.current
            ? window.getComputedStyle(gridRef.current).gridTemplateColumns.split(' ').filter(Boolean).length
            : 1;

        const focusCard = (target: number) => {
            const node = cardRefs.current[Math.max(0, Math.min(target, visible.length - 1))];
            const button = node?.querySelector('button');
            if (button instanceof HTMLElement) {
                event.preventDefault();
                button.focus();
            }
        };

        const item = visible[focusedIndex];

        switch (event.key) {
            case 'ArrowRight':
                return focusCard(focusedIndex + 1);
            case 'ArrowLeft':
                return focusCard(focusedIndex - 1);
            case 'ArrowDown':
                return focusCard(focusedIndex + columns);
            case 'ArrowUp':
                return focusCard(focusedIndex - columns);
            case '+':
            case '=':
                event.preventDefault();
                return setQuantity(item, currentQuantity(item) + 1);
            case '-':
                event.preventDefault();
                return setQuantity(item, currentQuantity(item) - 1);
            case 'Escape':
                event.preventDefault();
                return searchRef.current?.focus();
            default:
                return;
        }
    };

    /**
     * Whole-screen shortcuts. `/` jumps to search and Cmd+Enter commits, so a house can be picked
     * without leaving the keyboard: search, space, search, space, commit.
     */
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';

            if (event.key === '/' && !typing) {
                event.preventDefault();
                searchRef.current?.focus();
                return;
            }

            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                void handleCommit();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
        /* Rebound whenever the pending list changes, so Cmd+Enter always commits the current list. */
    }, [handleCommit]);

    if (data === undefined) {
        return (
            <div className="flex flex-col gap-6 p-5 sm:p-8">
                <SkeletonBlock className="h-8 w-64" />
                <SkeletonBlock className="h-10 w-full max-w-2xl" />
                <SkeletonTiles count={10} label="Loading the catalog" />
            </div>
        );
    }

    if (data === null) {
        return (
            <div className="p-5 sm:p-8">
                <p className="border-line bg-surface-raised text-body-muted rounded-lg border px-5 py-8 text-center text-sm">
                    That project could not be found.
                </p>
            </div>
        );
    }

    const { project } = data;

    return (
        <div className="flex min-h-full flex-col xl:flex-row xl:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-5 p-5 sm:p-8">
                <AdminHeading
                    eyebrow={project.name}
                    title="Choose furniture"
                    description="Tap items to build a list, adjust how many of each, then add the whole list to this house in one go."
                    action={
                        <Link
                            href={`/admin/projects/${projectId}/edit`}
                            className="border-line text-body-muted hover:bg-surface-raised hover:text-body inline-flex shrink-0 items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <ChevronLeft size={16} aria-hidden="true" /> Back to project
                        </Link>
                    }
                />

                <div className="border-line bg-ink/95 sticky top-0 z-20 -mx-5 border-b px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
                    <InventoryFilterBar
                        ref={searchRef}
                        filters={filters}
                        onChange={update}
                        categories={categories}
                        locations={locations}
                        counts={counts}
                        availabilityOptions={['all', 'free', 'out']}
                        showSort={false}
                        summary={`${visible.length} of ${items?.length ?? 0} items`}
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
                            {filters.availability === 'free'
                                ? 'Every item matching the rest of your filters is already out on a job.'
                                : 'Try a different category or clear the search.'}
                        </p>
                    </div>
                ) : (
                    <div ref={gridRef} onKeyDown={handleGridKeyDown} className={INVENTORY_GRID_CLASSES}>
                        {visible.map((item, index) => {
                            const selected = summary.selectedIds.has(item._id);
                            const quantity = currentQuantity(item);
                            const problem = problems.find((candidate) => candidate.inventoryId === item._id);

                            return (
                                <div
                                    key={item._id}
                                    ref={(node) => {
                                        cardRefs.current[index] = node;
                                    }}
                                >
                                    <InventoryCard
                                        name={item.name}
                                        category={item.category}
                                        price={item.price}
                                        thumbnail={item.smallImagePath}
                                        availability={{
                                            owned: item.owned,
                                            out: item.out,
                                            awaitingCheckIn: item.awaitingCheckIn,
                                            free: item.free,
                                            holderName: item.holders[0]?.projectName ?? null,
                                            holderCount: item.holders.length,
                                        }}
                                        selected={selected}
                                        actionLabel={`${selected ? 'Remove' : 'Add'} ${item.name}${
                                            item.assignedHere ? `, ${item.assignedHere} already at this house` : ''
                                        }`}
                                        onActivate={item.maxForThisProject > 0 ? () => toggle(item) : undefined}
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
                                                    {problem && (
                                                        <small className="text-danger text-[11px] font-bold">{problem.message}</small>
                                                    )}
                                                </div>
                                            ) : item.maxForThisProject === 0 ? (
                                                <small className="text-body-subtle block px-1 text-[11px]">
                                                    {item.awaitingCheckIn > 0
                                                        ? 'Still checked out to a finished job'
                                                        : 'All units are out on another house'}
                                                </small>
                                            ) : undefined
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Hides itself below `xl` while the list is empty; the desktop rail is always there. */}
            <StagingListTray
                summary={summary}
                projectName={project.name}
                expanded={expanded}
                problems={problems}
                committing={committing}
                onToggleExpanded={() => setExpanded((open) => !open)}
                onQuantityChange={setQuantity}
                onRemove={remove}
                onClear={() => {
                    clear();
                    setProblems([]);
                    setExpanded(false);
                }}
                onCommit={handleCommit}
            />

            {lightbox && <PhotoLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
        </div>
    );
}
