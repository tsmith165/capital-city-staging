'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ExternalLink, ImageOff, Pencil, X } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminStatus } from '@/components/admin/AdminPrimitives';
import { SkeletonBlock, SkeletonListRows } from '@/components/admin/AdminSkeleton';
import AvailabilityBadge from '@/components/admin/inventory/AvailabilityBadge';

/**
 * Everything about one item, in a sheet over the catalog.
 *
 * This is where the detail that used to be crammed onto the back of a flipped photo card lives, plus
 * the thing the console could never answer before: which house is holding this, and has it ever
 * earned anything. The second question is what makes a sell-or-keep decision possible.
 */

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">{label}</span>
            <span className="text-body text-sm">{value}</span>
        </div>
    );
}

export default function ItemDetailSheet({ itemId, onClose }: { itemId: string; onClose: () => void }) {
    const detail = useQuery(api.inventory.getInventoryDetail, { id: itemId as Id<'inventory'> });
    const history = useQuery(api.assignments.getItemHistory, { inventoryId: itemId as Id<'inventory'> });

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const lifetimeEarned = (history ?? []).reduce((total, row) => total + row.quantity * row.pricePerItem, 0);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button type="button" aria-label="Close item details" onClick={onClose} className="bg-ink/70 absolute inset-0" />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label={detail?.name ?? 'Item details'}
                className="border-line bg-surface-raised shadow-overlay relative flex h-full w-full flex-col border-l sm:w-[28rem]"
            >
                <header className="border-line flex items-start gap-3 border-b px-5 py-4">
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-gold-300 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                            {detail?.category || 'Item'}
                        </span>
                        <h2 className="font-display text-body text-xl leading-tight font-normal">
                            {detail ? detail.name : <SkeletonBlock className="h-6 w-48" />}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close item details"
                        className="border-line text-body-muted hover:bg-surface-hover hover:text-body ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-md border transition-colors"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                </header>

                <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
                    {detail === undefined ? (
                        <>
                            <SkeletonBlock className="aspect-square w-full rounded-lg" />
                            <SkeletonBlock className="h-24 w-full rounded-lg" />
                        </>
                    ) : detail === null ? (
                        <p className="text-body-muted text-sm">That item could not be found.</p>
                    ) : (
                        <>
                            <div className="border-line bg-surface relative aspect-square w-full overflow-hidden rounded-lg border">
                                {detail.imagePath ? (
                                    <Image src={detail.imagePath} alt={detail.name} fill className="object-cover" sizes="28rem" />
                                ) : (
                                    <span className="grid h-full w-full place-items-center">
                                        <ImageOff size={24} aria-hidden="true" className="text-body-subtle" />
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <AvailabilityBadge
                                    availability={{
                                        owned: detail.availability.owned,
                                        out: detail.availability.out,
                                        awaitingCheckIn: detail.availability.awaitingCheckIn,
                                        free: detail.availability.free,
                                        holderName: detail.availability.holders[0]?.projectName ?? null,
                                        holderCount: detail.availability.holders.length,
                                    }}
                                />
                                {!detail.active && <AdminStatus tone="neutral">Inactive</AdminStatus>}
                                {detail.attention.map((reason) => (
                                    <AdminStatus key={reason.code} tone={reason.tier === 'fix-now' ? 'danger' : 'warning'}>
                                        {reason.label}
                                    </AdminStatus>
                                ))}
                            </div>

                            {detail.availability.holders.length > 0 && (
                                <section className="border-line bg-surface flex flex-col gap-2 rounded-lg border p-4">
                                    <h3 className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">
                                        Where it is right now
                                    </h3>
                                    <ul className="flex flex-col gap-2">
                                        {detail.availability.holders.map((holder) => (
                                            <li key={holder.assignmentId} className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/projects/${holder.projectId}/edit`}
                                                    className="text-gold-300 hover:text-gold-200 inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
                                                >
                                                    {holder.projectName} <ExternalLink size={12} aria-hidden="true" />
                                                </Link>
                                                <span className="text-body-muted text-xs">× {holder.quantity}</span>
                                                {holder.awaitingCheckIn && <AdminStatus tone="warning">Not checked in</AdminStatus>}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Rental price" value={detail.price ? money.format(detail.price) : 'Not set'} />
                                <Field label="What it cost" value={detail.cost ? money.format(detail.cost) : 'Not recorded'} />
                                <Field label="Units owned" value={String(detail.count)} />
                                <Field label="Stored at" value={detail.location || 'Not recorded'} />
                                <Field
                                    label="Size (W × H × D)"
                                    value={
                                        detail.realWidth && detail.realHeight && detail.realDepth
                                            ? `${detail.realWidth}" × ${detail.realHeight}" × ${detail.realDepth}"`
                                            : 'Not measured'
                                    }
                                />
                                <Field label="Vendor" value={detail.vendor || 'Not recorded'} />
                            </div>

                            {detail.description && (
                                <section className="flex flex-col gap-1.5">
                                    <h3 className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">Notes</h3>
                                    <p className="text-body-muted text-sm">{detail.description}</p>
                                </section>
                            )}

                            <section className="flex flex-col gap-2">
                                <h3 className="text-body-subtle flex items-baseline justify-between gap-2 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                                    Staging history
                                    {history && history.length > 0 && (
                                        <span className="text-body-muted text-[11px] font-bold tracking-normal normal-case">
                                            {money.format(lifetimeEarned)} across {history.length} {history.length === 1 ? 'job' : 'jobs'}
                                        </span>
                                    )}
                                </h3>

                                {history === undefined ? (
                                    <SkeletonListRows rows={3} label="Loading history" />
                                ) : history.length === 0 ? (
                                    <p className="border-line bg-surface text-body-subtle rounded-md border px-4 py-4 text-sm">
                                        This has never been on a job. Worth asking whether it should be in the catalog at all.
                                    </p>
                                ) : (
                                    <ul className="divide-line border-line bg-surface divide-y rounded-md border">
                                        {history.map((row) => (
                                            <li key={row._id} className="flex items-center gap-3 px-4 py-2.5">
                                                <span className="flex min-w-0 flex-col">
                                                    <Link
                                                        href={`/admin/projects/${row.projectId}/edit`}
                                                        className="text-body hover:text-gold-300 truncate text-sm font-bold transition-colors"
                                                    >
                                                        {row.projectName}
                                                    </Link>
                                                    <small className="text-body-subtle text-[11px]">
                                                        {shortDate.format(new Date(row.assignedAt))}
                                                        {row.returnedAt
                                                            ? ` → ${shortDate.format(new Date(row.returnedAt))}`
                                                            : ' → still out'}
                                                    </small>
                                                </span>
                                                <span className="text-body ml-auto shrink-0 text-sm font-bold">
                                                    {money.format(row.quantity * row.pricePerItem)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </>
                    )}
                </div>

                {detail && (
                    <footer className="border-line border-t p-4">
                        <Link
                            href={`/admin/edit?id=${detail.oId}`}
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <Pencil size={15} aria-hidden="true" /> Edit this item
                        </Link>
                    </footer>
                )}
            </aside>
        </div>
    );
}
