'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { AlertTriangle, BadgeDollarSign, CheckCircle2, Images, Loader2, PackageOpen, Pencil, Trash2, Undo2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import PaymentBadge from '@/components/admin/projects/PaymentBadge';
import { exactMoney, money, shortDate } from '@/components/admin/projects/payments.constants';

import { STATUS_LABELS, STATUS_TONES } from './projects.constants';
import type { ProjectOverviewRow, ProjectStatus } from './projects.types';

/**
 * The selected project, in the column beside the list.
 *
 * Everything here is either a fact worth seeing before deciding to open the project, or an edit
 * small enough that opening it would be the slower path. Anything larger — photos, the furniture
 * manifest — is a link, not a second implementation of the editor.
 */

const FIELD =
    'border-line bg-surface text-body placeholder:text-body-subtle focus-visible:border-gold-300 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors';
const LABEL = 'text-body-muted text-xs font-bold';

const STATUS_ORDER: ProjectStatus[] = ['draft', 'active', 'completed', 'cancelled'];

export default function ProjectDetailPanel({
    project,
    onOpenPayment,
    onDeleted,
}: {
    project: ProjectOverviewRow;
    onOpenPayment: () => void;
    onDeleted: () => void;
}) {
    const updateProject = useMutation(api.projects.updateProject);
    const clearPayment = useMutation(api.projects.clearProjectPayment);
    const deleteProject = useMutation(api.projects.deleteProject);

    const [draft, setDraft] = useState<{ name: string; status: ProjectStatus; revenue: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const payment = project.payment;
    const closing = project.status === 'completed' || project.status === 'cancelled';

    const startEditing = () =>
        setDraft({ name: project.name, status: project.status, revenue: project.revenue ? String(project.revenue) : '' });

    const handleSave = async () => {
        if (!draft) return;
        setSaving(true);
        setError(null);
        try {
            await updateProject({
                projectId: project._id as Id<'projects'>,
                name: draft.name,
                status: draft.status,
                revenue: draft.revenue ? parseFloat(draft.revenue) : undefined,
                /* Required by the mutation and toggled elsewhere on this page; passed through unchanged. */
                highlighted: project.highlighted,
            });
            setDraft(null);
            setSaved(true);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not save those changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        setError(null);
        try {
            await deleteProject({ id: project._id as Id<'projects'> });
            onDeleted();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not delete this project.');
            setSaving(false);
        }
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <header className="border-line flex flex-col gap-2 border-b px-4 py-4">
                <span className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">Project</span>
                <h2 className="font-display text-body text-lg leading-tight font-normal">{project.name}</h2>
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_TONES[project.status]}`}>
                        {STATUS_LABELS[project.status]}
                    </span>
                    <PaymentBadge payment={payment} showBalance />
                </div>
                {project.address && <p className="text-body-subtle text-xs">{project.address}</p>}
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                <dl className="grid grid-cols-2 gap-2">
                    {[
                        { label: 'Revenue', value: project.revenue ? money.format(project.revenue) : '—' },
                        { label: 'Started', value: project.startDate ? shortDate.format(new Date(project.startDate)) : '—' },
                        { label: 'Ended', value: project.endDate ? shortDate.format(new Date(project.endDate)) : '—' },
                        { label: 'On site', value: project.openUnits > 0 ? `${project.openUnits} units` : 'Nothing' },
                    ].map((fact) => (
                        <div key={fact.label} className="border-line bg-surface flex flex-col gap-0.5 rounded-md border px-3 py-2">
                            <dt className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">{fact.label}</dt>
                            <dd className="text-body text-sm font-bold">{fact.value}</dd>
                        </div>
                    ))}
                </dl>

                {closing && project.openUnits > 0 && (
                    <p className="border-warning/40 bg-warning-soft text-warning flex items-start gap-2 rounded-md border px-3.5 py-2.5 text-xs">
                        <AlertTriangle size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                        <span>
                            This job is {STATUS_LABELS[project.status].toLowerCase()} but {project.openUnits} units are still recorded as
                            being at the house.{' '}
                            <Link href={`/admin/projects/${project._id}/edit#inventory`} className="font-bold underline">
                                Check them in
                            </Link>{' '}
                            so the catalog shows them as available.
                        </span>
                    </p>
                )}

                <section className="border-line bg-surface flex flex-col gap-2.5 rounded-md border p-3.5">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-body inline-flex items-center gap-1.5 text-sm font-bold">
                            <BadgeDollarSign size={14} aria-hidden="true" className="text-body-subtle" /> Payment
                        </h3>
                        <PaymentBadge payment={payment} />
                    </div>

                    {payment.status === 'unpaid' ? (
                        <p className="text-body-muted text-xs">
                            {project.revenue
                                ? `${money.format(project.revenue)} invoiced, nothing recorded as received.`
                                : 'No revenue is set on this project yet.'}
                        </p>
                    ) : (
                        <dl className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between gap-3">
                                <dt className="text-body-subtle">Received</dt>
                                <dd className="text-body font-bold">{exactMoney.format(payment.amountPaid)}</dd>
                            </div>
                            {payment.outstanding > 0 && (
                                <div className="flex justify-between gap-3">
                                    <dt className="text-body-subtle">Outstanding</dt>
                                    <dd className="text-warning font-bold">{exactMoney.format(payment.outstanding)}</dd>
                                </div>
                            )}
                            {payment.paidOn && (
                                <div className="flex justify-between gap-3">
                                    <dt className="text-body-subtle">Dated</dt>
                                    <dd className="text-body-muted">{shortDate.format(new Date(payment.paidOn))}</dd>
                                </div>
                            )}
                            {payment.method && (
                                <div className="flex justify-between gap-3">
                                    <dt className="text-body-subtle">Method</dt>
                                    <dd className="text-body-muted">{payment.method}</dd>
                                </div>
                            )}
                            {payment.notes && <p className="text-body-subtle border-line mt-1 border-t pt-2">{payment.notes}</p>}
                        </dl>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={onOpenPayment}
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 rounded-md px-3.5 py-2 text-xs font-bold transition-colors"
                        >
                            {payment.status === 'unpaid'
                                ? 'Mark as paid'
                                : payment.status === 'partial'
                                  ? 'Record another payment'
                                  : 'Edit payment'}
                        </button>
                        {payment.status !== 'unpaid' && (
                            <button
                                type="button"
                                onClick={() => void clearPayment({ projectId: project._id as Id<'projects'> })}
                                className="border-line text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-bold transition-colors"
                            >
                                <Undo2 size={12} aria-hidden="true" /> Clear
                            </button>
                        )}
                    </div>
                </section>

                <section className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-body text-sm font-bold">Quick edit</h3>
                        {!draft && (
                            <button
                                type="button"
                                onClick={startEditing}
                                className="text-gold-300 hover:text-gold-200 inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                            >
                                <Pencil size={12} aria-hidden="true" /> Edit here
                            </button>
                        )}
                    </div>

                    {draft ? (
                        <div className="flex flex-col gap-3">
                            <label className="flex flex-col gap-1.5">
                                <span className={LABEL}>Name</span>
                                <input
                                    type="text"
                                    value={draft.name}
                                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                                    className={FIELD}
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className={LABEL}>Status</span>
                                <select
                                    value={draft.status}
                                    onChange={(event) => setDraft({ ...draft, status: event.target.value as ProjectStatus })}
                                    className={FIELD}
                                >
                                    {STATUS_ORDER.map((status) => (
                                        <option key={status} value={status}>
                                            {STATUS_LABELS[status]}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className={LABEL}>Revenue</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.revenue}
                                    onChange={(event) => setDraft({ ...draft, revenue: event.target.value })}
                                    placeholder="0.00"
                                    className={FIELD}
                                />
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                    {saving && <Loader2 size={12} aria-hidden="true" className="animate-spin" />} Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDraft(null)}
                                    className="border-line text-body-muted hover:bg-surface-hover hover:text-body rounded-md border px-3 py-2 text-xs font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p aria-live="polite" className="text-body-subtle text-xs">
                            {saved ? (
                                <span className="text-success inline-flex items-center gap-1.5 font-bold">
                                    <CheckCircle2 size={12} aria-hidden="true" /> Saved
                                </span>
                            ) : (
                                'Name, status and revenue can be changed without leaving the list.'
                            )}
                        </p>
                    )}
                </section>

                {error && (
                    <p role="alert" className="border-danger/40 bg-danger-soft text-danger rounded-md border px-3.5 py-2.5 text-xs">
                        {error}
                    </p>
                )}
            </div>

            <footer className="border-line flex flex-col gap-2 border-t p-4">
                <div className="grid grid-cols-2 gap-2">
                    <Link
                        href={`/admin/projects/${project._id}/edit`}
                        className="border-line-strong text-body hover:bg-surface-hover inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-xs font-bold transition-colors"
                    >
                        <Pencil size={13} aria-hidden="true" /> Open project
                    </Link>
                    <Link
                        href={`/admin/projects/${project._id}/inventory`}
                        className="border-line-strong text-body hover:bg-surface-hover inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-xs font-bold transition-colors"
                    >
                        <PackageOpen size={13} aria-hidden="true" /> Furniture
                    </Link>
                </div>
                <Link
                    href={`/admin/projects/${project._id}/edit#photos`}
                    className="border-line text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-bold transition-colors"
                >
                    <Images size={13} aria-hidden="true" /> {project.imageCount} photos
                </Link>

                {confirmingDelete ? (
                    <div className="border-danger/40 bg-danger-soft flex flex-col gap-2 rounded-md border p-3">
                        <p className="text-danger text-xs font-bold">Delete {project.name}? Its photos and inventory history go with it.</p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={saving}
                                className="bg-danger text-body-inverse inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                            >
                                {saving && <Loader2 size={12} aria-hidden="true" className="animate-spin" />} Delete
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmingDelete(false)}
                                className="border-line text-body-muted hover:text-body rounded-md border px-3 py-1.5 text-xs font-bold"
                            >
                                Keep
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirmingDelete(true)}
                        className="text-body-subtle hover:text-danger inline-flex items-center justify-center gap-1.5 py-1 text-xs font-bold transition-colors"
                    >
                        <Trash2 size={12} aria-hidden="true" /> Delete project
                    </button>
                )}
            </footer>
        </div>
    );
}
