export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

/** Payment as every admin surface reads it, derived server-side by `paymentState`. */
export interface PaymentState {
    status: PaymentStatus;
    paidOn?: number;
    amountPaid: number;
    invoiced: number;
    outstanding: number;
    method?: string;
    notes?: string;
}
