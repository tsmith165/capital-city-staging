import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ProjectEditDefaultClient from './ProjectEditDefaultClient';

export const metadata: Metadata = {
    title: 'Capital City Staging - Edit Project',
    description: 'Edit project details for Capital City Staging.',
    keywords: 'Capital City Staging, Sacramento Staging, Edit Project, Home Staging',
    applicationName: 'Capital City Staging',
    icons: {
        icon: '/logo/CCS_logo_152x152.png',
        shortcut: '/logo/CCS_logo_152x152.png',
        apple: '/logo/apple-touch-icon-152x152.png',
    },
    openGraph: {
        title: 'Capital City Staging - Edit Project',
        description: 'Edit project details for Capital City Staging.',
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

export default function ProjectEditDefaultPage() {
    return (
        <PageLayout page="/admin/projects/edit">
            <ProjectEditDefaultClient />
        </PageLayout>
    );
}