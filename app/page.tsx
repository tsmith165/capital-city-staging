import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '../components/layout/PageLayout';
import MainView from './main_view';

import { PostHog } from 'posthog-node'

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
})

export const metadata: Metadata = {
    title: 'Capital City Staging',
    description:
        "Capital City Staging allows you to focus on your next moves, we'll handle your history. With a home staged by Mia, you can trust that every room tells your story.",
    keywords:
        'Staging, Homestaging, Real Estate, Staging Services, Staging Software, Homestaging, Real Estate, Real Estate Staging, Real Estate Staging Services, Real Estate Staging Software, Mia, Mia Dofflemyer, Home Staging, Sacramento, Sacramento Home Staging, Sacramento Real Estate, Sacramento Real Estate Staging, Sacramento Real Estate Staging Services, Sacramento Real Estate Staging Software, Sacramento Staging, Sacramento Staging Services, Sacramento Staging Software',
    applicationName: 'JWS Fine Art',
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

export default function Home() {
    posthog.capture({
        distinctId: 'torreysmith165@gmail.com',
        event: 'Home page was loaded'
    })

    return (
        <PageLayout page="home">
            <MainView />
        </PageLayout>
    );
}
