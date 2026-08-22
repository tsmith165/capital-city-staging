import type { PaymentStatus } from './payments.types';

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
    unpaid: 'Unpaid',
    partial: 'Part paid',
    paid: 'Paid',
};

export const PAYMENT_TONES: Record<PaymentStatus, string> = {
    unpaid: 'border-line text-body-subtle',
    partial: 'border-warning/40 bg-warning-soft text-warning',
    paid: 'border-success/40 bg-success-soft text-success',
};

/*
 * The ways a staging client actually pays. Free text is still allowed — this list only exists so the
 * common cases are one tap instead of a spelling decision that makes the records inconsistent.
 */
export const PAYMENT_METHODS = ['Check', 'Bank transfer', 'Card', 'Cash', 'Venmo', 'Zelle'] as const;

export const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const exactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** `<input type="date">` wants a local calendar day, not a UTC slice of a timestamp. */
export function toDateInput(timestamp?: number) {
    const date = timestamp ? new Date(timestamp) : new Date();
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** Noon local, so a payment dated today cannot land on the previous day in another timezone. */
export function fromDateInput(value: string) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12).getTime();
}
