'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { Undo2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminPanel } from '@/components/admin/AdminPrimitives';
import PaymentBadge from '@/components/admin/projects/PaymentBadge';
import ProjectPaymentDialog from '@/components/admin/projects/ProjectPaymentDialog';
import { exactMoney, money, shortDate } from '@/components/admin/projects/payments.constants';
import type { PaymentState } from '@/components/admin/projects/payments.types';

/**
 * What this job has been paid, on the project itself.
 *
 * Same dialog the list uses. Recording money is a step in its own right rather than four more fields
 * on the details form: it has its own date, its own reconciliation against the invoice, and it is the
 * one edit that gets made months after everything else on the page has stopped changing.
 */
export default function ProjectPaymentSection({
    projectId,
    projectName,
    payment,
}: {
    projectId: string;
    projectName: string;
    payment: PaymentState;
}) {
    const clearPayment = useMutation(api.projects.clearProjectPayment);
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <AdminPanel eyebrow="Money" title="Payment">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <PaymentBadge payment={payment} />
                        <span className="text-body-muted text-sm">
                            {payment.status === 'unpaid'
                                ? payment.invoiced > 0
                                    ? `${money.format(payment.invoiced)} invoiced, nothing received yet.`
                                    : 'No revenue is set on this project yet.'
                                : `${exactMoney.format(payment.amountPaid)} received${
                                      payment.paidOn ? ` on ${shortDate.format(new Date(payment.paidOn))}` : ''
                                  }${payment.method ? ` by ${payment.method.toLowerCase()}` : ''}.`}
                        </span>
                    </div>

                    {payment.outstanding > 0 && payment.status !== 'unpaid' && (
                        <p className="border-warning/40 bg-warning-soft text-warning rounded-md border px-3.5 py-2.5 text-sm">
                            {exactMoney.format(payment.outstanding)} is still outstanding on this job.
                        </p>
                    )}

                    {payment.notes && <p className="text-body-subtle border-line border-t pt-3 text-sm">{payment.notes}</p>}

                    <div className="border-line flex flex-wrap items-center gap-2 border-t pt-4">
                        <button
                            type="button"
                            onClick={() => setDialogOpen(true)}
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 rounded-md px-4 py-2.5 text-sm font-bold transition-colors"
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
                                onClick={() => void clearPayment({ projectId: projectId as Id<'projects'> })}
                                className="border-line text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2.5 text-xs font-bold transition-colors"
                            >
                                <Undo2 size={13} aria-hidden="true" /> Clear payment
                            </button>
                        )}
                    </div>
                </div>
            </AdminPanel>

            {dialogOpen && (
                <ProjectPaymentDialog
                    projectId={projectId}
                    projectName={projectName}
                    payment={payment}
                    onClose={() => setDialogOpen(false)}
                />
            )}
        </>
    );
}
