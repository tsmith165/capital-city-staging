'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { CheckCircle2, Loader2, RefreshCw, Undo2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import { AdminStatus } from '@/components/admin/AdminPrimitives';

/**
 * Repairs the two stored counters that availability used to be read from.
 *
 * `inventory.inUse` and `projects.inventoryAssigned` were written once at creation and never again,
 * which is why the dashboard reported 0% utilisation while 96 units were out. Availability is derived
 * from the assignment table now, so these fields no longer drive any screen — but they are still
 * written on every assignment, and rows that drifted before the change stay wrong until something
 * recomputes them. That is all this does.
 *
 * Idempotent: a second run reports zero corrections.
 */

const number = new Intl.NumberFormat('en-US');

type Result = {
    itemsChecked: number;
    itemsCorrected: number;
    projectsChecked: number;
    projectsCorrected: number;
};

export default function DataHealth() {
    const reconcile = useMutation(api.assignments.reconcileCounters);
    const awaiting = useQuery(api.assignments.getAwaitingCheckIn);

    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRun = async () => {
        setRunning(true);
        setError(null);
        try {
            setResult(await reconcile({}));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not recompute the counters.');
        } finally {
            setRunning(false);
        }
    };

    const strandedUnits = (awaiting ?? []).reduce((total, group) => total + group.units, 0);

    return (
        <div className="flex flex-col gap-5 p-5">
            {strandedUnits > 0 && (
                <div className="border-warning/40 bg-warning-soft flex flex-wrap items-center gap-3 rounded-md border px-4 py-3">
                    <Undo2 size={17} aria-hidden="true" className="text-warning shrink-0" />
                    <span className="flex min-w-0 flex-col">
                        <strong className="text-warning text-sm font-bold">
                            {number.format(strandedUnits)} units are assigned to finished jobs
                        </strong>
                        <small className="text-body-muted text-xs">
                            Recomputing counters will not release these — the assignments are genuinely still open. Check them in first,
                            then the numbers here and in the catalog agree.
                        </small>
                    </span>
                    <Link
                        href="/admin/inventory/check-in"
                        className="border-warning/50 text-warning hover:bg-warning/10 ml-auto shrink-0 rounded-md border px-3 py-2 text-xs font-bold transition-colors"
                    >
                        Check them in
                    </Link>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <h3 className="text-body text-sm font-bold">Recompute inventory counters</h3>
                <p className="text-body-muted max-w-2xl text-sm">
                    Optional cleanup for legacy counters. Availability is already accurate, and it is safe to run more than once.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleRun}
                    disabled={running}
                    className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-70"
                >
                    {running ? (
                        <Loader2 size={15} aria-hidden="true" className="animate-spin" />
                    ) : (
                        <RefreshCw size={15} aria-hidden="true" />
                    )}
                    {running ? 'Recomputing…' : 'Recompute counters'}
                </button>

                {result && result.itemsCorrected === 0 && result.projectsCorrected === 0 && (
                    <AdminStatus tone="good">Nothing to fix</AdminStatus>
                )}
            </div>

            <div aria-live="polite" className="flex flex-col gap-2">
                {error && (
                    <p role="alert" className="border-danger/40 bg-danger-soft text-danger rounded-md border px-4 py-2.5 text-sm">
                        {error}
                    </p>
                )}

                {result && (
                    <div className="border-line bg-surface flex flex-col gap-1.5 rounded-md border px-4 py-3 text-sm">
                        <span className="text-body flex items-center gap-2 font-bold">
                            <CheckCircle2 size={15} aria-hidden="true" className="text-success" /> Done
                        </span>
                        <span className="text-body-muted">
                            {number.format(result.itemsChecked)} items checked ·{' '}
                            <strong className="text-body">{number.format(result.itemsCorrected)} corrected</strong>
                        </span>
                        <span className="text-body-muted">
                            {number.format(result.projectsChecked)} projects checked ·{' '}
                            <strong className="text-body">{number.format(result.projectsCorrected)} corrected</strong>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
