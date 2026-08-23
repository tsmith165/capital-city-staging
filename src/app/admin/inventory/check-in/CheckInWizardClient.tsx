'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Loader2, Undo2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import AdminShell from '@/components/admin/AdminShell';
import { AdminHeading, AdminStatus } from '@/components/admin/AdminPrimitives';
import { SkeletonBlock, SkeletonListRows } from '@/components/admin/AdminSkeleton';
import AssignmentRow from '@/components/admin/inventory/AssignmentRow';

/**
 * One-time reconciliation of inventory that was never checked back in.
 *
 * The debt is 65 assignment rows, but it is only five or six houses, and "was everything from Watt
 * Avenue returned?" is a question someone can actually answer — "was row 41 returned?" is not. So the
 * wizard works one project at a time with everything pre-selected, which makes the common case a
 * single tap per house.
 *
 * The return is stamped with the project's end date rather than today. Recording a year-late tap as
 * if the sofa came home this morning would put a year of phantom rental duration into every history
 * figure the app will ever compute.
 */

const number = new Intl.NumberFormat('en-US');
const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

export default function CheckInWizardClient() {
    const groups = useQuery(api.assignments.getAwaitingCheckIn);
    const checkIn = useMutation(api.assignments.checkInAssignments);

    const [skipped, setSkipped] = useState<Set<string>>(new Set());
    const [excluded, setExcluded] = useState<Set<string>>(new Set());
    const [showLines, setShowLines] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkedInUnits, setCheckedInUnits] = useState(0);

    if (groups === undefined) {
        return (
            <AdminShell title="Check in inventory">
                <div className="flex flex-col gap-6 p-5 sm:p-8">
                    <SkeletonBlock className="h-8 w-64" />
                    <div className="border-line bg-surface-raised rounded-lg border">
                        <SkeletonListRows rows={5} label="Loading check-ins" />
                    </div>
                </div>
            </AdminShell>
        );
    }

    const remaining = groups.filter((group) => !skipped.has(group.projectId));
    const current = remaining[0];
    const totalUnits = groups.reduce((total, group) => total + group.units, 0);

    if (!current) {
        return (
            <AdminShell title="Check in inventory">
                <div className="flex flex-col gap-6 p-5 sm:p-8">
                    <div className="border-line bg-surface-raised flex flex-col items-center gap-3 rounded-lg border px-5 py-14 text-center">
                        <CheckCircle2 size={30} aria-hidden="true" className="text-success" />
                        <strong className="font-display text-body text-2xl font-normal">
                            {groups.length === 0 ? 'Everything is accounted for' : 'Nothing left in this pass'}
                        </strong>
                        <p className="text-body-muted max-w-md text-sm">
                            {checkedInUnits > 0
                                ? `${number.format(checkedInUnits)} units are back on the books. Availability across the catalog is now accurate.`
                                : 'No finished job is holding inventory.'}
                        </p>
                        {skipped.size > 0 && (
                            <button
                                type="button"
                                onClick={() => setSkipped(new Set())}
                                className="text-gold-300 hover:text-gold-200 text-xs font-bold transition-colors"
                            >
                                Revisit the {skipped.size} {skipped.size === 1 ? 'house' : 'houses'} you skipped
                            </button>
                        )}
                        <Link
                            href="/admin/inventory"
                            className="border-line text-body-muted hover:bg-surface-hover hover:text-body mt-1 inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <ArrowLeft size={15} aria-hidden="true" /> Back to catalog
                        </Link>
                    </div>
                </div>
            </AdminShell>
        );
    }

    const selectedIds = current.lines.filter((line) => !excluded.has(line._id)).map((line) => line._id);
    const selectedUnits = current.lines.filter((line) => !excluded.has(line._id)).reduce((total, line) => total + line.quantity, 0);

    const closedWhen = current.endDate ?? current.updatedAt;
    const currentProjectId = current.projectId;

    const advance = () => {
        setExcluded(new Set());
        setShowLines(false);
        setError(null);
    };

    const handleCheckIn = async () => {
        if (selectedIds.length === 0) return;

        setSaving(true);
        setError(null);
        try {
            const result = await checkIn({
                assignmentIds: selectedIds as Id<'projectInventory'>[],
                /* Backdated so the history reads as the furniture coming home when the job ended. */
                returnedAt: closedWhen,
            });
            setCheckedInUnits((units) => units + result.units);

            /*
             * Anything deliberately left out keeps this house in the queue, so skip past it — the
             * exceptions were a decision, not an oversight.
             */
            if (excluded.size > 0) setSkipped((ids) => new Set(ids).add(currentProjectId));
            advance();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not record that check-in.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminShell title="Check in inventory">
            <div className="flex flex-col gap-6 p-5 sm:p-8">
                <AdminHeading
                    eyebrow="Inventory"
                    title="Check furniture back in"
                    description="Confirm returns one house at a time."
                    action={
                        <Link
                            href="/admin/inventory"
                            className="border-line text-body-muted hover:bg-surface-raised hover:text-body inline-flex shrink-0 items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <ArrowLeft size={16} aria-hidden="true" /> Catalog
                        </Link>
                    }
                />

                <p className="text-body-muted text-sm">
                    <strong className="text-body">
                        {remaining.length} {remaining.length === 1 ? 'house' : 'houses'} left
                    </strong>{' '}
                    · {number.format(totalUnits)} units across all of them
                    {checkedInUnits > 0 && ` · ${number.format(checkedInUnits)} already brought back`}
                </p>

                <section className="border-line bg-surface-raised flex flex-col gap-4 rounded-lg border p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-col gap-1">
                            <span className="text-gold-300 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                                {current.status === 'cancelled' ? 'Cancelled job' : 'Finished job'}
                            </span>
                            <h2 className="font-display text-body text-2xl leading-tight font-normal">{current.projectName}</h2>
                            <p className="text-body-muted text-sm">
                                {current.address ? `${current.address} · ` : ''}
                                closed {monthYear.format(new Date(closedWhen))}
                            </p>
                        </div>
                        <AdminStatus tone="warning">{number.format(current.units)} units out</AdminStatus>
                    </div>

                    <p className="text-body text-base">
                        Is all {number.format(current.units)} {current.units === 1 ? 'unit' : 'units'} of furniture back from this house?
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCheckIn}
                            disabled={saving || selectedIds.length === 0}
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2 size={15} aria-hidden="true" className="animate-spin" />
                            ) : (
                                <Undo2 size={15} aria-hidden="true" />
                            )}
                            {excluded.size > 0
                                ? `Check in ${number.format(selectedUnits)} of ${number.format(current.units)}`
                                : `Yes — check in all ${number.format(current.units)}`}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setSkipped((skippedIds) => new Set(skippedIds).add(currentProjectId));
                                advance();
                            }}
                            className="border-line text-body-muted hover:bg-surface-hover hover:text-body rounded-md border px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            Not yet — skip this house
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowLines((open) => !open)}
                            aria-expanded={showLines}
                            className="text-gold-300 hover:text-gold-200 inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                        >
                            {showLines ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
                            {showLines ? 'Hide the list' : `Something stayed behind? See all ${current.lines.length} items`}
                        </button>
                    </div>

                    {error && (
                        <p role="alert" className="border-danger/40 bg-danger-soft text-danger rounded-md border px-4 py-2.5 text-sm">
                            {error}
                        </p>
                    )}

                    {showLines && (
                        <div className="border-line overflow-hidden rounded-md border">
                            <p className="border-line bg-surface text-body-muted border-b px-4 py-2.5 text-xs">
                                Untick anything that did not come back — sold with the house, damaged, or left behind. It stays assigned and
                                this house stays on the list.
                            </p>
                            <ul className="divide-line divide-y">
                                {current.lines.map((line) => {
                                    const included = !excluded.has(line._id);
                                    return (
                                        <AssignmentRow
                                            key={line._id}
                                            name={line.name}
                                            category={line.category}
                                            thumbnail={line.smallImagePath}
                                            quantity={line.quantity}
                                            pricePerItem={line.pricePerItem}
                                            leading={
                                                <input
                                                    type="checkbox"
                                                    checked={included}
                                                    onChange={() =>
                                                        setExcluded((ids) => {
                                                            const next = new Set(ids);
                                                            if (included) next.add(line._id);
                                                            else next.delete(line._id);
                                                            return next;
                                                        })
                                                    }
                                                    aria-label={`${line.name} came back from ${current.projectName}`}
                                                    className="accent-gold-400 h-5 w-5 shrink-0"
                                                />
                                            }
                                        />
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </section>

                {remaining.length > 1 && (
                    <section className="flex flex-col gap-2">
                        <h3 className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">Still to confirm</h3>
                        <ul className="divide-line border-line bg-surface-raised divide-y rounded-lg border">
                            {remaining.slice(1).map((group) => (
                                <li key={group.projectId} className="flex items-center gap-3 px-4 py-3">
                                    <span className="flex min-w-0 flex-col">
                                        <strong className="text-body truncate text-sm font-bold">{group.projectName}</strong>
                                        <small className="text-body-subtle text-[11px]">
                                            closed {monthYear.format(new Date(group.endDate ?? group.updatedAt))}
                                        </small>
                                    </span>
                                    <span className="text-body-muted ml-auto shrink-0 text-xs font-bold">
                                        {number.format(group.units)} units
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </AdminShell>
    );
}
