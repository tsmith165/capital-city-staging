'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { Check, Loader2, Send } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import QuantityStepper from '@/components/admin/inventory/QuantityStepper';

import type { ProjectOption } from './catalog.types';

/**
 * Send this one item somewhere other than the house currently being staged.
 *
 * The pending list is deliberately bound to one project, because a list that could scatter across
 * several houses is a list nobody can review. But "that lamp belongs at the other job" is a real
 * thought that arrives mid-browse, and making her switch houses, add it, and switch back loses the
 * filters and the list she was building. So this commits on its own, immediately, for one item.
 */

const number = new Intl.NumberFormat('en-US');

export default function QuickAssignToProject({
    itemId,
    itemName,
    free,
    projects,
    excludeProjectId,
    holders,
}: {
    itemId: string;
    itemName: string;
    free: number;
    projects: ProjectOption[] | undefined;
    /** The house being staged in the main panel — it already has the pending list. */
    excludeProjectId: string | null;
    holders: { projectId: string; quantity: number }[];
}) {
    const assign = useMutation(api.assignments.assignItemsToProject);

    const [targetId, setTargetId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const options = (projects ?? []).filter((project) => project._id !== excludeProjectId);
    const alreadyThere = holders.find((holder) => holder.projectId === targetId)?.quantity ?? 0;

    const handleSend = async () => {
        if (!targetId || quantity < 1) return;

        setSaving(true);
        setError(null);
        setResult(null);
        try {
            /* The mutation takes the desired TOTAL at that house, so add to what is already there. */
            const outcome = await assign({
                projectId: targetId as Id<'projects'>,
                lines: [{ inventoryId: itemId as Id<'inventory'>, quantity: alreadyThere + quantity }],
            });

            if (outcome.ok) {
                const target = options.find((project) => project._id === targetId);
                setResult(`Sent ${number.format(quantity)} to ${target?.name ?? 'that house'}.`);
                setQuantity(1);
            } else {
                setError(outcome.problems[0]?.message ?? 'That did not fit.');
            }
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not assign that.');
        } finally {
            setSaving(false);
        }
    };

    if (free === 0 && alreadyThere === 0) return null;

    return (
        <section className="border-line bg-surface flex flex-col gap-3 rounded-lg border p-4">
            <h3 className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">Send to another house</h3>

            <select
                value={targetId}
                onChange={(event) => {
                    setTargetId(event.target.value);
                    setResult(null);
                    setError(null);
                }}
                aria-label={`House to send ${itemName} to`}
                className="border-line bg-surface-raised text-body focus-visible:border-gold-300 w-full rounded-md border px-3 py-2.5 text-sm outline-none"
            >
                <option value="">Choose a house…</option>
                {options.map((project) => (
                    <option key={project._id} value={project._id}>
                        {project.name}
                        {project.status !== 'active' ? ` (${project.status})` : ''}
                    </option>
                ))}
            </select>

            {targetId && (
                <>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-body-muted text-xs">
                            {alreadyThere > 0
                                ? `${number.format(alreadyThere)} already there · ${number.format(free)} free`
                                : `${number.format(free)} free to send`}
                        </span>
                        <QuantityStepper value={quantity} max={Math.max(1, free)} label={`${itemName} to send`} onChange={setQuantity} />
                    </div>

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={saving || free === 0}
                        className="border-line-strong text-body hover:bg-surface-hover inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={15} aria-hidden="true" className="animate-spin" /> : <Send size={15} aria-hidden="true" />}
                        Send {number.format(quantity)} now
                    </button>
                </>
            )}

            <p aria-live="polite" className="empty:hidden">
                {result && (
                    <span className="text-success inline-flex items-center gap-1.5 text-xs font-bold">
                        <Check size={13} aria-hidden="true" /> {result}
                    </span>
                )}
                {error && <span className="text-danger text-xs font-bold">{error}</span>}
            </p>
        </section>
    );
}
