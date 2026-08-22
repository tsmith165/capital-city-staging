import { PAYMENT_LABELS, PAYMENT_TONES, money } from './payments.constants';
import type { PaymentState } from './payments.types';

/** Payment status, carrying the outstanding balance when there is one. */
export default function PaymentBadge({ payment, showBalance = false }: { payment: PaymentState; showBalance?: boolean }) {
    const balance = showBalance && payment.status === 'partial' && payment.outstanding > 0;

    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${PAYMENT_TONES[payment.status]}`}
        >
            {PAYMENT_LABELS[payment.status]}
            {balance && <span className="font-normal opacity-80">{money.format(payment.outstanding)} left</span>}
        </span>
    );
}
