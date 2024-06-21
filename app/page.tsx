import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '../components/layout/PageLayout';
import MainView from './main_view';
import { captureEvent } from '../utils/posthog';
import { headers } from 'next/headers';

export const metadata: Metadata = {
    title: 'Capital City Staging',
    description:
        "Capital City Staging allows you to focus on your next moves, we'll handle your history. With a home staged by Mia, you can trust that every room tells your story.",
    keywords:
        'Staging, Homestaging, Real Estate, Staging Services, Staging Software, Homestaging, Real Estate, Real Estate Staging, Real Estate Staging Services, Real Estate Staging Software, Mia, Mia Dofflemyer, Home Staging, Sacramento, Sacramento Home Staging, Sacramento Real Estate, Sacramento Real Estate Staging, Sacramento Real Estate Staging Services, Sacramento Real Estate Staging Software, Sacramento Staging, Sacramento Staging Services, Sacramento Staging Software',
    applicationName: 'Capital City Staging',
    icons: {
        icon: '/logo/CCS_logo.png',
        shortcut: '/logo/CCS_logo.png',
        apple: '/ico/apple-touch-icon-152x152.png',
    },
    openGraph: {
        title: 'Capital City Staging',
        description:
            "Capital City Staging allows you to focus on your next moves, we'll handle your history. With a home staged by Mia, you can trust that every room tells your story.",
        siteName: 'Capital City Staging',
        url: 'https://www.capitalcitystaging.com',
        images: [
            {
                url: '/ico/CCS_og_image.png',
                width: 1200,
                height: 630,
                alt: 'Capital City Staging',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

export default async function Home({ searchParams }: { searchParams?: { component?: string } }) {
    const headersList = headers();
    const hostname = process.env.NODE_ENV === 'production' ? 'https://www.capitalcitystaging.com' : 'http://localhost:3000';
    console.log("Using API hostname:", hostname);
    const apiUrl = `${hostname}/api/distinct-id`;
    console.log("Using API URL:", apiUrl);
    const response = await fetch(apiUrl);

    let distinctId = '';
    try {
        const data = await response.json();
        distinctId = data.distinctId;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        // Handle the error appropriately, e.g., set a default value for distinctId
    }

    captureEvent('Home page was loaded', { distinctId });

    return (
        <PageLayout page="home">
            <MainView />
        </PageLayout>
    );
}
