import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '../../components/layout/PageLayout';
import Contact from './contact';

import { captureEvent, captureDistictId } from '@/utils/posthog';

export const metadata: Metadata = {
    title: 'Contact Capital City Staging | Free Home Staging Consultation',
    description:
        "Get in touch with Capital City Staging for your free consultation. Professional home staging services in Sacramento to help you sell faster and for more money.",
    keywords:
        'Contact Capital City Staging, Home Staging Sacramento, home staging consultation, staging quote, Mia Dofflemyer, Sacramento staging services, real estate staging contact',
    applicationName: 'Capital City Staging',
    openGraph: {
        title: 'Contact Capital City Staging | Free Home Staging Consultation',
        description:
            "Get in touch with Capital City Staging for your free consultation. Professional home staging services in Sacramento to help you sell faster and for more money.",
        siteName: 'Capital City Staging',
        url: 'https://www.capitalcitystaging.com/contact',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Contact Capital City Staging | Free Home Staging Consultation',
        description:
            "Get in touch with Capital City Staging for your free consultation. Professional home staging services in Sacramento to help you sell faster and for more money.",
        site: '@capitalcitystaging',
        creator: '@capitalcitystaging',
    },
};

export default async function ContactPage() {
    const distinctId = await captureDistictId();
    captureEvent('Contact page was loaded', { distinctId });

    return (
        <PageLayout page="contact">
            <Contact />
        </PageLayout>
    );
}
