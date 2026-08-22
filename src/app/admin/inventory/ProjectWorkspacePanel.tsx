'use client';

import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { ExternalLink, Loader2, PackageOpen, Trash2, Undo2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminStatus } from '@/components/admin/AdminPrimitives';
import { SkeletonListRows } from '@/components/admin/AdminSkeleton';
import AssignmentRow from '@/components/admin/inventory/AssignmentRow';
import QuantityStepper from '@/components/admin/inventory/QuantityStepper';
import type { LineProblem, StagingSummary } from '@/components/admin/inventory/staging.types';

import type { CatalogItem, ProjectOption } from './catalog.types';

/**
 * The house she is staging, held open beside the grid.
 *
 * Two sections that answer different questions. The pending list is what this visit will change and
 * is not written until she commits; below it, the manifest is what is already on site, which is the
 * context that stops her adding a second coffee table to a room that has one.
 */

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US');

export default function ProjectWorkspacePanel({
    project,
    summary,
    problems,
    committing,
    onQuantityChange,
    onRemove,
    onClear,
    onCommit,
}: {
    project: ProjectOption;
    summary: StagingSummary<CatalogItem>;
    problems: LineProblem[];
    committing: boolean;
    onQuantityChange: (item: CatalogItem, quantity: number) => void;
    onRemove: (itemId: string) => void;
    onClear: () => void;
    onCommit: () => void;
}) {
    const assignments = useQuery(api.assignments.getProjectAssignments, {
        projectId: project._id as Id<'projects'>,
    });
    const checkIn = useMutation(api.assignments.checkInAssignments);

    const problemsById = new Map(problems.map((problem) => [problem.inventoryId, problem] as const));
    const touched = [...summary.adding, ...summary.changing, ...summary.removing];
    const onSite = assignments?.open ?? [];
    const manifest = assignments ?? null;

    return (
        <>
            <header className="border-line flex flex-col gap-2 border-b px-4 py-3.5">
                <span className="text-gold-300 text-[10px] font-extrabold tracking-[0.14em] uppercase">Staging for</span>
                <Link
                    href={`/admin/projects/${project._id}/edit`}
                    className="font-display text-body hover:text-gold-300 inline-flex items-center gap-1.5 text-lg leading-tight font-normal transition-colors"
                >
                    {project.name} <ExternalLink size={13} aria-hidden="true" className="shrink-0" />
                </Link>
                {project.address && <small className="text-body-subtle truncate text-[11px]">{project.address}</small>}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <section>
                    <h3 className="border-line bg-surface-raised text-body-subtle sticky top-0 z-10 border-b px-4 py-2.5 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                        {touched.length === 0 ? 'Pending' : `Pending · ${touched.length}`}
                    </h3>

                    {problems.length > 0 && (
                        <p role="alert" className="border-danger/40 bg-danger-soft text-danger border-b px-4 py-3 text-sm">
                            Nothing was saved. {problems.length === 1 ? 'One item' : `${problems.length} items`} would need more units than
                            you have free — adjust the highlighted lines and try again.
                        </p>
                    )}

                    {touched.length === 0 ? (
                        <p className="text-body-subtle px-4 py-6 text-center text-sm">
                            Tap items in the grid to build a list for this house. Nothing is saved until you commit.
                        </p>
                    ) : (
                        <ul className="divide-line divide-y">
                            {touched.map(({ item, desired, delta }) => (
                                <AssignmentRow
                                    key={item._id}
                                    name={item.name}
                                    category={item.category}
                                    thumbnail={item.smallImagePath}
                                    quantity={desired}
                                    pricePerItem={item.price}
                                    note={
                                        item.assignedHere > 0 ? `was ${item.assignedHere} · ${delta > 0 ? `+${delta}` : delta}` : undefined
                                    }
                                    problem={problemsById.get(item._id)?.message}
                                    action={
                                        <span className="flex items-center gap-1">
                                            <QuantityStepper
                                                value={desired}
                                                max={item.maxForThisProject}
                                                label={item.name}
                                                onChange={(next) => onQuantityChange(item, next)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => onRemove(item._id)}
                                                aria-label={`Remove ${item.name} from this list`}
                                                className="border-line-strong text-body-subtle hover:border-danger/50 hover:bg-danger-soft hover:text-danger grid h-10 w-10 place-items-center rounded-md border transition-colors"
                                            >
                                                <Trash2 size={15} aria-hidden="true" />
                                            </button>
                                        </span>
                                    }
                                />
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h3 className="border-line bg-surface-raised text-body-subtle sticky top-0 z-10 border-y px-4 py-2.5 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                        Already on site
                        {manifest && ` · ${number.format(manifest.openUnits)} units`}
                    </h3>

                    {assignments === undefined ? (
                        <SkeletonListRows rows={3} label="Loading what is on site" />
                    ) : manifest === null || onSite.length === 0 ? (
                        <div className="text-body-subtle flex flex-col items-center gap-2 px-4 py-6 text-center">
                            <PackageOpen size={20} aria-hidden="true" />
                            <p className="text-sm">Nothing is at this house yet.</p>
                        </div>
                    ) : (
                        <>
                            <ul className="divide-line divide-y">
                                {onSite.map((line) => (
                                    <AssignmentRow
                                        key={line._id}
                                        name={line.name}
                                        category={line.category}
                                        thumbnail={line.smallImagePath}
                                        quantity={line.quantity}
                                        pricePerItem={line.pricePerItem}
                                        action={
                                            <button
                                                type="button"
                                                onClick={() => checkIn({ assignmentIds: [line._id as Id<'projectInventory'>] })}
                                                aria-label={`Check ${line.name} back in`}
                                                className="border-line-strong text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-bold transition-colors"
                                            >
                                                <Undo2 size={13} aria-hidden="true" /> In
                                            </button>
                                        }
                                    />
                                ))}
                            </ul>
                            <p className="border-line flex items-center justify-between gap-3 border-t px-4 py-3">
                                <span className="text-body text-sm font-bold">Rental value on site</span>
                                <strong className="font-display text-body text-base font-normal">
                                    {money.format(manifest?.openValue ?? 0)}
                                </strong>
                            </p>
                        </>
                    )}
                </section>
            </div>

            <footer className="border-line flex shrink-0 flex-col gap-2 border-t p-3">
                {touched.length > 0 && (
                    <p className="text-body-muted flex items-center justify-between gap-2 text-[11px]">
                        <span>
                            {summary.unitsAdded > 0 && `${summary.unitsAdded} in`}
                            {summary.unitsAdded > 0 && summary.unitsRemoved > 0 && ' · '}
                            {summary.unitsRemoved > 0 && `${summary.unitsRemoved} out`}
                        </span>
                        <span>{money.format(summary.valueAdded)} rental value</span>
                    </p>
                )}

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onClear}
                        disabled={touched.length === 0}
                        className="border-line text-body-muted hover:bg-surface-hover hover:text-body rounded-md border px-3 py-2.5 text-xs font-bold transition-colors disabled:opacity-40"
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        onClick={onCommit}
                        disabled={committing || touched.length === 0}
                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {committing && <Loader2 size={15} aria-hidden="true" className="animate-spin" />}
                        {touched.length === 0
                            ? 'Nothing to save'
                            : summary.unitsRemoved > 0 && summary.unitsAdded === 0
                              ? `Take ${summary.unitsRemoved} off`
                              : `Save ${summary.unitsAdded || summary.unitsRemoved} ${
                                    (summary.unitsAdded || summary.unitsRemoved) === 1 ? 'unit' : 'units'
                                }`}
                    </button>
                </div>

                {manifest?.project.status && ['completed', 'cancelled'].includes(manifest.project.status) && (
                    <AdminStatus tone="warning">This job is {manifest.project.status}</AdminStatus>
                )}
            </footer>
        </>
    );
}
