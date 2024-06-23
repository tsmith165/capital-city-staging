import { pgTable, text, integer, date, serial } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

export const resendCoreTable = pgTable('resendCoreTable', {
    id: serial('id').notNull().primaryKey(),
    date: date('date').notNull().unique(),
    emails_sent: integer('emails_sent').notNull().default(0),
});

export type ResendCore = InferSelectModel<typeof resendCoreTable>;
export type InsertResendCore = InferInsertModel<typeof resendCoreTable>;