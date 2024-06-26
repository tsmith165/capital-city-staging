import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '../../components/layout/PageLayout';
import Contact from './contact';

import { captureEvent } from '@/utils/posthog';

export const metadata: Metadata = {
    title: 'Capital City Staging',
    description:
        "Capital City Staging allows you to focus on your next moves, we'll handle your history. With a home staged by Mia, you can trust that every room tells your story.",
    keywords:
        'Capital City Staging, Sacramento Staging, Mia Capital City Staging, Mia Realtor, Mia Staging, Staging, Homestaging, Real Estate, Staging Services, Staging Software, Homestaging, Real Estate, Real Estate Staging, Real Estate Staging Services, Real Estate Staging Software, Mia, Mia Dofflemyer, Home Staging, Sacramento, Sacramento Home Staging, Sacramento Real Estate, Sacramento Real Estate Staging, Sacramento Real Estate Staging Services, Sacramento Staging Services, Capital City, Capital, City, City Stage, City Staging, Contact',
    applicationName: 'Capital City Staging',
    icons: {
        icon: '/logo/CCS_logo_w_background.png',
        shortcut: '/logo/CCS_logo_w_background.png',
        apple: '/favicon/apple-touch-icon-152x152-background.png',
    },
    openGraph: {
        title: 'Capital City Staging',
        description:
            "Capital City Staging allows you to focus on your next moves, we'll handle your history. With a home staged by Mia, you can trust that every room tells your story.",
        siteName: 'Capital City Staging',
        url: 'https://www.capitalcitystaging.com',
        images: [
            {
                url: '/favicon/CCS_og_image.png',
                width: 1200,
                height: 630,
                alt: 'Capital City Staging',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    metadataBase: new URL('https://www.capitalcitystaging.com'),
};


export default async function ContactPage() {
    const hostname = process.env.NODE_ENV === 'production' ? 'https://www.capitalcitystaging.com' : 'http://localhost:3000';
    // console.log("Using API hostname:", hostname);
    const apiUrl = `${hostname}/api/distinct-id`;
    // console.log("Using API URL:", apiUrl);
    const response = await fetch(apiUrl);

    let distinctId = await response.json() || '';

    captureEvent('Contact page was loaded', { distinctId });

    return (
        <PageLayout page="contact">
            <Contact />
        </PageLayout>
    );
}