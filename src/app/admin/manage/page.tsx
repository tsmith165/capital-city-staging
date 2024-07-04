import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Admin Management',
    description: 'Jill Weeks Smith Admin Management',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Manage',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Management',
        description: 'Management for JWS Fine Art',
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com',
        images: [
            {
                url: '/favicon/og-image.png',
                width: 1200,
                height: 630,
                alt: 'JWS Fine Art',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

import { getInventory } from './actions';

import { SignedIn } from '@clerk/nextjs';

import PageLayout from '@/components/layout/PageLayout';
import { Manage } from '@/app/admin/manage/Manage';

interface PageProps {
    searchParams?: {
        tab?: string;
    };
}

export default async function ManagePage({ searchParams }: PageProps) {
    const tab = searchParams?.tab || 'manage';
    const inventory = await getInventory();

    return (
        <SignedIn>
            <PageLayout page="/manage">
                <Manage inventory={inventory} activeTab={tab} />
            </PageLayout>
        </SignedIn>
    );
}
