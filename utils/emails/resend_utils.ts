// File: /utils/emails/resend_utils.ts

import { db, resendCoreTable } from '@/db/db';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getEmailsSentToday(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const result = await db.select({
    emails_sent: resendCoreTable.emails_sent,
  })
  .from(resendCoreTable)
  .where(eq(resendCoreTable.date, today))
  .execute();

  return result.length > 0 ? result[0].emails_sent : 0;
}

export async function incrementEmailsSentToday(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const emailsSentToday = await getEmailsSentToday();

  if (emailsSentToday === 0) {
    await db.insert(resendCoreTable)
      .values({ date: today, emails_sent: 1 })
      .execute();
  } else {
    await db.update(resendCoreTable)
      .set({ emails_sent: emailsSentToday + 1 })
      .where(eq(resendCoreTable.date, today))
      .execute();
  }
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    await resend.emails.send({
      from: 'mia@capitalcitystaging.com',
      to,
      subject,
      html,
    });
    await incrementEmailsSentToday();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
