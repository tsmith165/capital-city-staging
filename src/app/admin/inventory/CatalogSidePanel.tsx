'use client';

import { useCallback } from 'react';
import { House, PackageSearch } from 'lucide-react';

import AdminSidePanel from '@/components/admin/AdminSidePanel';

import type { LineProblem, StagingSummary } from '@/components/admin/inventory/staging.types';

import ItemDetailPanel from './ItemDetailPanel';
import ProjectWorkspacePanel from './ProjectWorkspacePanel';
import type { CatalogItem, ProjectOption } from './catalog.types';

/** The catalog's third column: what it shows, over the shared responsive panel that positions it. */
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
    /* Escape steps back out of an item before it closes the panel itself. */
    const handleEscape = useCallback(() => {
        if (detailItemId) onCloseDetail();
        else onOpenChange(false);
    }, [detailItemId, onCloseDetail, onOpenChange]);

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
        <AdminSidePanel
            open={open}
            onOpenChange={onOpenChange}
            label={detailItemId ? 'Item details' : 'Staging list'}
            onEscape={handleEscape}
        >
            {body}
        </AdminSidePanel>
    );
}
