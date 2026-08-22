'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { AlertCircle, Loader2, X } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

import { PAYMENT_METHODS, exactMoney, fromDateInput, toDateInput } from './payments.constants';
import type { PaymentState } from './payments.types';

/**
 * What she is asked when a job gets marked paid.
 *
 * A checkbox would record that money arrived and lose everything worth knowing about it — when, how
 * much, and whether the balance is still outstanding. Staging jobs are routinely settled in two
 * parts, so "partial" has to be a first-class answer rather than a note someone remembers to write.
 *
 * The amount is authoritative: entering the full invoice while "Partial" is selected settles the
 * job, because the number is a fact and the radio button is an intention.
 */

const FIELD =
    'border-line bg-surface text-body placeholder:text-body-subtle focus-visible:border-gold-300 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors';
const LABEL = 'text-body-muted text-xs font-bold';

export default function ProjectPaymentDialog({
    projectId,
    projectName,
    payment,
    onClose,
}: {
    projectId: string;
    projectName: string;
    payment: PaymentState;
    onClose: () => void;
}) {
    const recordPayment = useMutation(api.projects.recordProjectPayment);

    const invoiced = payment.invoiced;
    const alreadyPaid = payment.amountPaid;

    const [paidOn, setPaidOn] = useState(() => toDateInput(payment.paidOn));
    const [intent, setIntent] = useState<'partial' | 'paid'>(payment.status === 'partial' ? 'partial' : 'paid');
    /* Defaults to what is still owed, which is the amount being recorded far more often than not. */
    const [amount, setAmount] = useState(() => {
        const suggested = payment.status === 'partial' ? payment.outstanding : invoiced;
        return suggested > 0 ? String(suggested) : '';
    });
    const [method, setMethod] = useState(payment.method ?? '');
    const [notes, setNotes] = useState(payment.notes ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        closeRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    /*
     * A partial payment adds to what has already been recorded; the field asks for this payment, not
     * the running total, because that is what the cheque in her hand says.
     */
    const entered = Number(amount || 0);
    const isTopUp = payment.status === 'partial';
    const total = isTopUp ? alreadyPaid + entered : entered;
    const settles = invoiced > 0 ? total >= invoiced : intent === 'paid';
    const remaining = Math.max(0, invoiced - total);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!amount.trim() || Number.isNaN(entered)) return setError('Enter the amount received.');
        if (entered < 0) return setError('A payment cannot be negative.');

        setSaving(true);
        setError(null);
        try {
            await recordPayment({
                projectId: projectId as Id<'projects'>,
                paidOn: fromDateInput(paidOn),
                amountPaid: total,
                intent,
                method: method || undefined,
                notes: notes || undefined,
            });
            onClose();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not record that payment.');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" aria-label="Cancel" onClick={onClose} className="bg-ink/70 absolute inset-0" />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-dialog-title"
                className="border-line bg-surface-raised shadow-overlay relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-y-auto rounded-lg border"
            >
                <header className="border-line flex items-start justify-between gap-3 border-b px-5 py-4">
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">Payment</span>
                        <h2 id="payment-dialog-title" className="font-display text-body truncate text-lg leading-tight font-normal">
                            {projectName}
                        </h2>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Cancel"
                        className="border-line text-body-muted hover:bg-surface-hover hover:text-body grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-colors"
                    >
                        <X size={15} aria-hidden="true" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
                    <dl className="border-line bg-surface flex items-center justify-between gap-3 rounded-md border px-3.5 py-2.5">
                        <div className="flex flex-col gap-0.5">
                            <dt className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">Invoiced</dt>
                            <dd className="text-body text-sm font-bold">{invoiced > 0 ? exactMoney.format(invoiced) : 'No revenue set'}</dd>
                        </div>
                        {isTopUp && (
                            <div className="flex flex-col gap-0.5 text-right">
                                <dt className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">
                                    Already recorded
                                </dt>
                                <dd className="text-body-muted text-sm font-bold">{exactMoney.format(alreadyPaid)}</dd>
                            </div>
                        )}
                    </dl>

                    <fieldset className="flex flex-col gap-2">
                        <legend className={LABEL}>How much of it arrived?</legend>
                        <div className="grid grid-cols-2 gap-2">
                            {(
                                [
                                    { value: 'paid', label: 'In full', hint: 'Nothing outstanding' },
                                    { value: 'partial', label: 'Part of it', hint: 'Balance still owed' },
                                ] as const
                            ).map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex cursor-pointer flex-col gap-0.5 rounded-md border px-3.5 py-2.5 transition-colors ${
                                        intent === option.value ? 'border-gold-300/60 bg-gold-400/5' : 'border-line hover:bg-surface-hover'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="payment-intent"
                                            value={option.value}
                                            checked={intent === option.value}
                                            onChange={() => {
                                                setIntent(option.value);
                                                if (option.value === 'paid' && invoiced > 0) {
                                                    setAmount(String(isTopUp ? Math.max(0, invoiced - alreadyPaid) : invoiced));
                                                }
                                            }}
                                            className="accent-gold-400 h-3.5 w-3.5"
                                        />
                                        <span className="text-body text-sm font-bold">{option.label}</span>
                                    </span>
                                    <span className="text-body-subtle pl-[1.375rem] text-xs">{option.hint}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className={LABEL}>{isTopUp ? 'This payment' : 'Amount received'} *</span>
                            <div className="relative">
                                <span className="text-body-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={amount}
                                    onChange={(event) => setAmount(event.target.value)}
                                    placeholder="0.00"
                                    className={`${FIELD} pl-7`}
                                />
                            </div>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className={LABEL}>Date received *</span>
                            <input
                                type="date"
                                required
                                value={paidOn}
                                onChange={(event) => setPaidOn(event.target.value)}
                                className={FIELD}
                            />
                        </label>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className={LABEL}>How was it paid?</span>
                        <div className="flex flex-wrap gap-1.5">
                            {PAYMENT_METHODS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setMethod(method === option ? '' : option)}
                                    aria-pressed={method === option}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                                        method === option
                                            ? 'border-gold-300/60 bg-gold-400/10 text-gold-200'
                                            : 'border-line text-body-muted hover:bg-surface-hover hover:text-body'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={method}
                            onChange={(event) => setMethod(event.target.value)}
                            placeholder="Or type something else"
                            className={FIELD}
                        />
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className={LABEL}>Notes</span>
                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows={2}
                            placeholder="Check number, who paid, anything to remember."
                            className={`${FIELD} resize-y`}
                        />
                    </label>

                    <p
                        aria-live="polite"
                        className={`rounded-md border px-3.5 py-2.5 text-sm ${
                            settles ? 'border-success/40 bg-success-soft text-success' : 'border-warning/40 bg-warning-soft text-warning'
                        }`}
                    >
                        {invoiced === 0
                            ? 'No revenue is set on this project, so nothing can be reconciled against it.'
                            : settles
                              ? `Recording ${exactMoney.format(total)} settles this job in full.`
                              : `${exactMoney.format(remaining)} will still be outstanding.`}
                    </p>

                    {error && (
                        <p
                            role="alert"
                            className="border-danger/40 bg-danger-soft text-danger flex items-start gap-2 rounded-md border px-3.5 py-2.5 text-sm"
                        >
                            <AlertCircle size={14} aria-hidden="true" className="mt-0.5 shrink-0" /> {error}
                        </p>
                    )}

                    <div className="border-line flex items-center justify-end gap-2 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border-line text-body-muted hover:bg-surface-hover hover:text-body rounded-md border px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving && <Loader2 size={15} aria-hidden="true" className="animate-spin" />}
                            Record payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
