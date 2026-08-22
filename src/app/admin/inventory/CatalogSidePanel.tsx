'use client';

import { useEffect } from 'react';
import { House, PackageSearch, X } from 'lucide-react';

import type { LineProblem, StagingSummary } from '@/components/admin/inventory/staging.types';

import ItemDetailPanel from './ItemDetailPanel';
import ProjectWorkspacePanel from './ProjectWorkspacePanel';
import type { CatalogItem, ProjectOption } from './catalog.types';

/**
 * The catalog's third column.
 *
 * From `xl` up it sits in the layout, so the grid keeps scrolling behind whatever is open and there
 * is no scrim to dismiss. Below that width there is not enough room for three columns, so the same
 * panel becomes a slide-over — one component, two wrappers, rather than two implementations that
 * drift apart.
 */
export default function CatalogSidePanel({
    open,
    onOpenChange,
    detailItemId,
    onCloseDetail,
    project,
    projects,
    summary,
    problems,
    committing,
    onQuantityChange,
    onRemove,
    onClear,
    onCommit,
}: {
    /** Only meaningful below `xl`, where the panel is an overlay. */
    open: boolean;
    onOpenChange: (open: boolean) => void;
    detailItemId: string | null;
    onCloseDetail: () => void;
    project: ProjectOption | null;
    projects: ProjectOption[] | undefined;
    summary: StagingSummary<CatalogItem>;
    problems: LineProblem[];
    committing: boolean;
    onQuantityChange: (item: CatalogItem, quantity: number) => void;
    onRemove: (itemId: string) => void;
    onClear: () => void;
    onCommit: () => void;
}) {
    /* Escape closes the overlay at narrow widths. At `xl` the panel is furniture, not a dialog. */
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            if (detailItemId) onCloseDetail();
            else onOpenChange(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, detailItemId, onCloseDetail, onOpenChange]);

    const body = detailItemId ? (
        <ItemDetailPanel itemId={detailItemId} onClose={onCloseDetail} projects={projects} activeProjectId={project?._id ?? null} />
    ) : project ? (
        <ProjectWorkspacePanel
            project={project}
            summary={summary}
            problems={problems}
            committing={committing}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            onClear={onClear}
            onCommit={onCommit}
        />
    ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <House size={26} aria-hidden="true" className="text-body-subtle" />
            <strong className="font-display text-body text-base leading-tight font-normal">No house selected</strong>
            <p className="text-body-muted max-w-[16rem] text-sm">
                Choose a house at the top of the page and the whole catalog becomes a picker for it.
            </p>
            <p className="text-body-subtle max-w-[16rem] text-xs">Or tap any item to see where it is and what it has earned.</p>
            <PackageSearch size={18} aria-hidden="true" className="text-body-subtle mt-1" />
        </div>
    );

    return (
        <>
            {/* Overlay wrapper, below xl only. */}
            {open && (
                <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
                    <button
                        type="button"
                        aria-label="Close panel"
                        onClick={() => onOpenChange(false)}
                        className="bg-ink/70 absolute inset-0"
                    />
                    <aside
                        role="dialog"
                        aria-modal="true"
                        aria-label={detailItemId ? 'Item details' : 'Staging list'}
                        className="border-line bg-surface-raised shadow-overlay relative flex h-full w-full max-w-md flex-col border-l"
                    >
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            aria-label="Close panel"
                            className="border-line bg-surface-raised text-body-muted hover:text-body absolute top-3 -left-11 grid h-9 w-9 place-items-center rounded-md border transition-colors"
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                        {body}
                    </aside>
                </div>
            )}

            {/* In-flow column, xl and up. */}
            <aside
                aria-label={detailItemId ? 'Item details' : 'Staging list'}
                className="border-line bg-surface-raised sticky top-0 hidden max-h-[calc(100dvh-64px)] w-[22rem] shrink-0 flex-col self-start border-l xl:flex 2xl:w-[24rem]"
            >
                {body}
            </aside>
        </>
    );
}
