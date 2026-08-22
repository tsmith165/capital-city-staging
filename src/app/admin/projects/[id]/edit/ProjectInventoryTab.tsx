'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { Loader2, PackagePlus, Undo2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminEmpty, AdminPanel, AdminStatus } from '@/components/admin/AdminPrimitives';
import { SkeletonListRows } from '@/components/admin/AdminSkeleton';
import AssignmentRow from '@/components/admin/inventory/AssignmentRow';

/**
 * What is at this house, as a manifest.
 *
 * This used to be a third photo grid with its own info-flip. A list is the right form: these rows get
 * read top to bottom and acted on one at a time, so the width is better spent on quantities, line
 * totals and a check-in control than on a fourth copy of a photo the picker already showed.
 */

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function ProjectInventoryTab({ projectId }: { projectId: string }) {
    const data = useQuery(api.assignments.getProjectAssignments, { projectId: projectId as Id<'projects'> });
    const checkIn = useMutation(api.assignments.checkInAssignments);

    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheckIn = async (assignmentId: string) => {
        setBusyId(assignmentId);
        setError(null);
        try {
            await checkIn({ assignmentIds: [assignmentId as Id<'projectInventory'>] });
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not check that item in.');
        } finally {
            setBusyId(null);
        }
    };

    if (data === undefined) {
        return (
            <AdminPanel eyebrow="This house" title="Furniture on site">
                <SkeletonListRows rows={5} label="Loading assigned inventory" />
            </AdminPanel>
        );
    }

    if (data === null) return <AdminEmpty>That project could not be found.</AdminEmpty>;

    return (
        <div className="flex flex-col gap-5">
            {error && (
                <p role="alert" className="border-danger/40 bg-danger-soft text-danger rounded-md border px-4 py-2.5 text-sm">
                    {error}
                </p>
            )}

            <AdminPanel
                eyebrow="This house"
                title={data.open.length === 0 ? 'Nothing on site' : `Furniture on site · ${data.openUnits} units`}
                href={`/admin/projects/${projectId}/inventory`}
                linkLabel="Add furniture"
            >
                {data.open.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                        <PackagePlus size={24} aria-hidden="true" className="text-body-subtle" />
                        <p className="text-body-muted text-sm">No furniture is assigned to this house yet.</p>
                        <Link
                            href={`/admin/projects/${projectId}/inventory`}
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <PackagePlus size={15} aria-hidden="true" /> Choose furniture
                        </Link>
                    </div>
                ) : (
                    <>
                        <ul className="divide-line divide-y">
                            {data.open.map((line) => (
                                <AssignmentRow
                                    key={line._id}
                                    name={line.name}
                                    category={line.category}
                                    thumbnail={line.smallImagePath}
                                    quantity={line.quantity}
                                    pricePerItem={line.pricePerItem}
                                    note={`assigned ${shortDate.format(new Date(line.assignedAt))}`}
                                    problem={
                                        line.pricePerItem === 0 && line.currentPrice > 0
                                            ? `Recorded at $0 — this item now lists at ${money.format(line.currentPrice)}`
                                            : undefined
                                    }
                                    action={
                                        <button
                                            type="button"
                                            onClick={() => handleCheckIn(line._id)}
                                            disabled={busyId === line._id}
                                            className="border-line-strong text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-bold transition-colors disabled:opacity-60"
                                        >
                                            {busyId === line._id ? (
                                                <Loader2 size={13} aria-hidden="true" className="animate-spin" />
                                            ) : (
                                                <Undo2 size={13} aria-hidden="true" />
                                            )}
                                            Check in
                                        </button>
                                    }
                                />
                            ))}
                        </ul>
                        <footer className="border-line flex items-center justify-between gap-3 border-t px-4 py-3">
                            <span className="text-body text-sm font-bold">Rental value on site</span>
                            <strong className="font-display text-body text-lg font-normal">{money.format(data.openValue)}</strong>
                        </footer>
                    </>
                )}
            </AdminPanel>

            {data.returned.length > 0 && (
                <AdminPanel eyebrow="History" title={`Checked back in · ${data.returned.length}`}>
                    <ul className="divide-line divide-y opacity-80">
                        {data.returned.slice(0, 12).map((line) => (
                            <AssignmentRow
                                key={line._id}
                                name={line.name}
                                category={line.category}
                                thumbnail={line.smallImagePath}
                                quantity={line.quantity}
                                pricePerItem={line.pricePerItem}
                                note={line.returnedAt ? `back ${shortDate.format(new Date(line.returnedAt))}` : undefined}
                                action={<AdminStatus tone="good">Returned</AdminStatus>}
                            />
                        ))}
                    </ul>
                </AdminPanel>
            )}
        </div>
    );
}
