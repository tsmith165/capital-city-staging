'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { AlertTriangle, ArchiveRestore, Loader2, PackageOpen, Trash2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminPanel } from '@/components/admin/AdminPrimitives';

import { ATTENTION_TONES, money } from './inventory.editor.constants';
import type { EditorItem } from './inventory.editor.types';

/**
 * Where this item is and whether it is still in service.
 *
 * The old editor showed none of this, so the count could be edited without knowing that eight of
 * them were sitting in a finished job nobody had checked in. Retiring and deleting live here too,
 * away from the save button, because neither is an edit you make by accident.
 */

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function InventoryStatusPanel({ item }: { item: EditorItem }) {
    const setActive = useMutation(api.inventory.setInventoryActive);
    const deleteItem = useMutation(api.inventory.deleteInventory);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const { availability } = item;
    const committed = availability.out + availability.awaitingCheckIn;

    const run = async (action: () => Promise<unknown>) => {
        setBusy(true);
        setError(null);
        try {
            await action();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'That did not work.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <AdminPanel eyebrow="Right now" title={`${availability.free} of ${availability.owned} free to stage`}>
                <div className="flex flex-col gap-4 p-4">
                    <dl className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Owned', value: availability.owned, tone: 'text-body' },
                            { label: 'At houses', value: availability.out, tone: availability.out > 0 ? 'text-warning' : 'text-body' },
                            { label: 'Free', value: availability.free, tone: 'text-success' },
                        ].map((stat) => (
                            <div key={stat.label} className="border-line bg-surface flex flex-col gap-0.5 rounded-md border px-3 py-2">
                                <dt className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">{stat.label}</dt>
                                <dd className={`font-display text-xl leading-none font-normal ${stat.tone}`}>{stat.value}</dd>
                            </div>
                        ))}
                    </dl>

                    {availability.awaitingCheckIn > 0 && (
                        <p className="border-warning/40 bg-warning-soft text-warning flex items-start gap-2 rounded-md border px-3.5 py-2.5 text-xs">
                            <AlertTriangle size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                            <span>
                                {availability.awaitingCheckIn} are still assigned to a job that is already finished, so the catalog counts
                                them as unavailable.{' '}
                                <Link href="/admin/inventory/check-in" className="font-bold underline">
                                    Check them in
                                </Link>
                                .
                            </span>
                        </p>
                    )}

                    {availability.holders.length > 0 && (
                        <ul className="divide-line border-line divide-y rounded-md border">
                            {availability.holders.map((holder) => (
                                <li key={holder.assignmentId} className="flex items-center justify-between gap-3 px-3 py-2.5">
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <Link
                                            href={`/admin/projects/${holder.projectId}/edit`}
                                            className="text-body hover:text-gold-300 truncate text-sm font-bold transition-colors"
                                        >
                                            {holder.projectName}
                                        </Link>
                                        <span className="text-body-subtle text-xs">
                                            since {shortDate.format(new Date(holder.assignedAt))}
                                            {holder.awaitingCheckIn && ' · job finished'}
                                        </span>
                                    </div>
                                    <span className="text-body-muted shrink-0 text-sm font-bold">
                                        {holder.quantity} × {money.format(holder.pricePerItem)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {availability.holders.length === 0 && (
                        <p className="text-body-subtle inline-flex items-center gap-1.5 text-xs">
                            <PackageOpen size={12} aria-hidden="true" /> Not on any job right now.
                        </p>
                    )}

                    {item.attention.length > 0 && (
                        <ul className="flex flex-col gap-2">
                            {item.attention.map((reason) => (
                                <li
                                    key={reason.code}
                                    className={`flex flex-col gap-0.5 rounded-md border px-3.5 py-2.5 text-xs ${ATTENTION_TONES[reason.tier]}`}
                                >
                                    <strong className="font-bold">{reason.label}</strong>
                                    <span className="opacity-90">{reason.detail}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </AdminPanel>

            <AdminPanel eyebrow="Lifecycle" title={item.active ? 'In service' : 'Retired'}>
                <div className="flex flex-col gap-3 p-4">
                    <p className="text-body-muted text-sm">
                        {item.active
                            ? 'Retiring hides it from the catalog and the picker. Its staging history stays intact, and it can come back.'
                            : 'This item is hidden from the catalog and the picker. Nothing about its history was lost.'}
                    </p>

                    {error && (
                        <p role="alert" className="border-danger/40 bg-danger-soft text-danger rounded-md border px-3.5 py-2.5 text-sm">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => void run(() => setActive({ id: item._id as Id<'inventory'>, active: !item.active }))}
                            disabled={busy || (item.active && committed > 0)}
                            className="border-line-strong text-body hover:bg-surface-hover inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {busy ? (
                                <Loader2 size={14} aria-hidden="true" className="animate-spin" />
                            ) : (
                                <ArchiveRestore size={14} aria-hidden="true" />
                            )}
                            {item.active ? 'Retire this item' : 'Bring it back'}
                        </button>
                        {item.active && committed > 0 && (
                            <span className="text-body-subtle text-xs">{committed} are at houses — check them in first.</span>
                        )}
                    </div>

                    {confirmingDelete ? (
                        <div className="border-danger/40 bg-danger-soft flex flex-col gap-2 rounded-md border p-3.5">
                            <p className="text-danger text-sm font-bold">
                                Delete {item.name} for good? Its photos and every record of it being staged go with it. Retiring keeps all
                                of that.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => void run(() => deleteItem({ id: item._id as Id<'inventory'> }))}
                                    disabled={busy}
                                    className="bg-danger text-body-inverse inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold disabled:opacity-50"
                                >
                                    {busy && <Loader2 size={12} aria-hidden="true" className="animate-spin" />} Delete for good
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmingDelete(false)}
                                    className="border-line text-body-muted hover:text-body rounded-md border px-3.5 py-2 text-xs font-bold"
                                >
                                    Keep it
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmingDelete(true)}
                            className="text-body-subtle hover:text-danger inline-flex w-fit items-center gap-1.5 text-xs font-bold transition-colors"
                        >
                            <Trash2 size={12} aria-hidden="true" /> Delete permanently
                        </button>
                    )}
                </div>
            </AdminPanel>
        </div>
    );
}
