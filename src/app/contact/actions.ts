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

        // Send single email to all recipients (admin + user)
        const allRecipients = [...admin_emails, formData.email];
        console.log(`Sending email to: ${allRecipients.join(', ')}`);
        await sendEmail({
            from: 'contact@capitalcitystaging.com',
            to: allRecipients,
            subject: `Estimate for ${formData.name}'s property`,
            html: email_html,
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending emails:', error);
        throw error;
    }
}
