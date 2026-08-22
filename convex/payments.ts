import type { Doc } from "./_generated/dataModel";

/**
 * What a project has been paid.
 *
 * Payment used to be a single nullable timestamp, which could only answer "has any money arrived".
 * A staging job is regularly settled in two parts — a deposit up front, the balance at closing — so
 * the answer has to be a status plus an amount, and "some of it" has to be a state the dashboard can
 * see. Rows predate all of it, so every read goes through here rather than touching the columns.
 */

export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface PaymentState {
  status: PaymentStatus;
  /** When the money arrived. Undefined while unpaid. */
  paidOn?: number;
  amountPaid: number;
  invoiced: number;
  /** Never negative: an overpayment is settled, not owed backwards. */
  outstanding: number;
  method?: string;
  notes?: string;
}

export function paymentState(project: Doc<"projects">): PaymentState {
  /* A legacy row with a receipt date but no status was fully paid — that was all the field could mean. */
  const status: PaymentStatus = project.paymentStatus ?? (project.paymentReceivedAt ? "paid" : "unpaid");
  const invoiced = project.revenue ?? 0;

  /* Same reasoning for the amount: before this existed, paid meant paid in full. */
  const amountPaid = project.amountPaid ?? (status === "paid" ? invoiced : 0);

  return {
    status,
    paidOn: project.paymentReceivedAt,
    amountPaid,
    invoiced,
    outstanding: Math.max(0, invoiced - amountPaid),
    method: project.paymentMethod,
    notes: project.paymentNotes,
  };
}

/** A finished job whose money has not fully arrived. Drives the dashboard's follow-up list. */
export function isAwaitingPayment(project: Doc<"projects">) {
  return project.status === "completed" && paymentState(project).status !== "paid";
}
