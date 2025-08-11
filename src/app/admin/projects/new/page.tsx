import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import NewProjectClient from './NewProjectClient';

export const metadata: Metadata = {
    title: 'Capital City Staging - Create New Project',
    description: 'Create a new staging project for Capital City Staging.',
    keywords: 'Capital City Staging, Sacramento Staging, New Project, Home Staging',
    applicationName: 'Capital City Staging',
    icons: {
        icon: '/logo/CCS_logo_152x152.png',
        shortcut: '/logo/CCS_logo_152x152.png',
        apple: '/logo/apple-touch-icon-152x152.png',
    },
    openGraph: {
        title: 'Capital City Staging - Create New Project',
        description: 'Create a new staging project for Capital City Staging.',
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

export default function NewProjectPage() {
    return (
        <PageLayout page="/admin/projects/new">
            <NewProjectClient />
        </PageLayout>
    );
}