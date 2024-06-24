'use server';

import React from 'react';
import { render } from '@react-email/render';
import { getEmailsSentToday, sendEmail } from '@/utils/emails/resend_utils';
import ContactFormEmail from '@/utils/emails/templates/contactFormEmail';

export async function sendContactFormEmail(formData: any) {
  const contact_form_email_template = React.createElement(ContactFormEmail, formData);
  const email_html = render(contact_form_email_template);

  const admin_emails = [
    'mdofflemyer.realestate@gmail.com',
    // 'torreysmith165@gmail.com',
  ];

  try {
    const emailsSentToday = await getEmailsSentToday();

    if (emailsSentToday >= 100) {
      throw new Error('Daily email limit reached. Please try again tomorrow.');
    }

    for (const admin_email of admin_emails) {
      console.log(`Sending email to ${admin_email}`);
      await sendEmail({
        from: 'contact@capitalcitystaging.com',
        to: [admin_email, formData.email],
        subject: 'New Contact Form Submission',
        html: email_html,
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
}
