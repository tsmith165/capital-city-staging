import { render } from '@react-email/render';
import { NextResponse } from 'next/server';
import ContactFormEmail from '@/utils/emails/templates/contactFormEmail';
import { getEmailsSentToday } from '@/utils/emails/resend_utils';
import 'dotenv/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    const emailsSentToday = await getEmailsSentToday();

    if (emailsSentToday >= 100) {
      throw new Error('Daily email limit reached. Please try again tomorrow.');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'your-email@example.com',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  square_ft: number | null;
  staging_type: string;
  message: string;
}

export async function sendContactFormEmail(formData: ContactFormData) {
  'use server';

  const { square_ft, ...rest } = formData;
  const contactFormEmail = <ContactFormEmail {...rest} square_ft={square_ft ?? 0} />;
  const emailHtml = render(contactFormEmail);

  const users_to_send_email_to = [
    'mdofflemyer.realestate@gmail.com',
    'torreysmith165@gmail.com',
  ];

  try {
    for (const user of users_to_send_email_to) {
      console.log(`Sending email to ${user}`);
      await sendEmail({
        to: user,
        subject: 'New Contact Form Submission',
        html: emailHtml,
      });
    }
    return NextResponse.json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}