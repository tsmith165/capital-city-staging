'use client';

import { useCallback, useState } from 'react';
import { Loader2, Undo2, X } from 'lucide-react';

import AssignmentRow from '@/components/admin/inventory/AssignmentRow';
import { useDialogFocus } from '@/hooks/useDialogFocus';

import type { ProjectAssignmentLine } from '@/components/admin/projects/project.types';

/**
 * The step between "mark this job finished" and the job actually being finished.
 *
 * Check-in has no natural moment of its own, which is why nobody ever did it and why 75 units ended
 * up stranded across five closed jobs. Attaching it to the status change gives it one, and
 * pre-selecting every line makes the ordinary case — everything came back — a single tap.
 *
 * Deliberately not a silent auto-release. Sometimes an item genuinely stays behind: sold with the
 * house, damaged, left for the buyer. Marking those returned would corrupt the catalog in the
 * opposite direction, claiming a sofa is free while it sits in someone's living room. So the default
 * is generous and the exceptions are one untick away.
 */

const number = new Intl.NumberFormat('en-US');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function CheckInDialog({
    projectName,
    status,
    lines,
    saving,
    onCancel,
    onConfirm,
}: {
    projectName: string;
    status: 'completed' | 'cancelled';
    lines: ProjectAssignmentLine[];
    saving: boolean;
    onCancel: () => void;
    /** Receives the assignment ids confirmed as physically back. Empty means "complete anyway". */
    onConfirm: (checkInIds: string[]) => void;
}) {
    const [excluded, setExcluded] = useState<Set<string>>(new Set());

    /* Escape is ignored mid-save: the mutation is already in flight and cannot be taken back. */
    const close = useCallback(() => {
        if (!saving) onCancel();
    }, [onCancel, saving]);
    const dialogRef = useDialogFocus<HTMLDivElement>(true, close);

    const included = lines.filter((line) => !excluded.has(line._id));
    const units = included.reduce((total, line) => total + line.quantity, 0);
    const totalUnits = lines.reduce((total, line) => total + line.quantity, 0);
    const value = included.reduce((total, line) => total + line.quantity * line.pricePerItem, 0);

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <button type="button" aria-label="Cancel" onClick={() => !saving && onCancel()} className="bg-ink/80 absolute inset-0" />

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="check-in-title"
                tabIndex={-1}
                className="border-line bg-surface-raised shadow-overlay relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border"
            >
                <header className="border-line flex items-start gap-3 border-b px-5 py-4">
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-gold-300 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                            {status === 'cancelled' ? 'Cancelling' : 'Completing'} {projectName}
                        </span>
                        <h2 id="check-in-title" className="font-display text-body text-xl leading-tight font-normal">
                            Is the furniture back?
                        </h2>
                        <p className="text-body-muted text-sm">
                            {number.format(totalUnits)} {totalUnits === 1 ? 'unit is' : 'units are'} still assigned to this house. Checking
                            them in puts them back on the books as free to stage.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        aria-label="Cancel"
                        className="border-line text-body-muted hover:bg-surface-hover hover:text-body ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-md border transition-colors disabled:opacity-50"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <p className="border-line bg-surface text-body-muted border-b px-5 py-2.5 text-xs">
                        Untick anything that stayed behind — sold with the house, damaged, or left for the buyer. It keeps its assignment.
                    </p>
                    <ul className="divide-line divide-y">
                        {lines.map((line) => {
                            const keep = !excluded.has(line._id);
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
                                            checked={keep}
                                            onChange={() =>
                                                setExcluded((ids) => {
                                                    const next = new Set(ids);
                                                    if (keep) next.add(line._id);
                                                    else next.delete(line._id);
                                                    return next;
                                                })
                                            }
                                            aria-label={`${line.name} came back`}
                                            className="accent-gold-400 h-5 w-5 shrink-0"
                                        />
                                    }
                                />
                            );
                        })}
                    </ul>
                </div>

                <footer className="border-line flex flex-col gap-2 border-t p-4">
                    <button
                        type="button"
                        onClick={() => onConfirm(included.map((line) => line._id))}
                        disabled={saving}
                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-70"
                    >
                        {saving ? (
                            <Loader2 size={15} aria-hidden="true" className="animate-spin" />
                        ) : (
                            <Undo2 size={15} aria-hidden="true" />
                        )}
                        {included.length === lines.length
                            ? `Check in all ${number.format(units)} units and save`
                            : `Check in ${number.format(units)} of ${number.format(totalUnits)} and save`}
                    </button>

                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => onConfirm([])}
                            disabled={saving}
                            className="text-body-muted hover:text-body text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            Save without checking anything in
                        </button>
                        <span className="text-body-subtle text-xs">{money.format(value)} coming back</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
