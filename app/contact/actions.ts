'use server';

import React from 'react';
import { render } from '@react-email/render';
import { getEmailsSentToday, sendEmail } from '@/utils/emails/resend_utils';
import ContactFormEmail from '@/utils/emails/templates/contactFormEmail';

export async function sendContactFormEmail(formData: any) {
  const { square_ft: squareFt, ...rest } = formData;
  const contactFormEmail = React.createElement(ContactFormEmail, { ...rest, square_ft: squareFt ?? 0 });
  const emailHtml = render(contactFormEmail);

  const users_to_send_email_to = [
    'mdofflemyer.realestate@gmail.com',
    'torreysmith165@gmail.com',
  ];

  try {
    const emailsSentToday = await getEmailsSentToday();

    if (emailsSentToday >= 100) {
      throw new Error('Daily email limit reached. Please try again tomorrow.');
    }

    for (const user of users_to_send_email_to) {
      console.log(`Sending email to ${user}`);
      await sendEmail({
        to: user,
        subject: 'New Contact Form Submission',
        html: emailHtml,
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
}
