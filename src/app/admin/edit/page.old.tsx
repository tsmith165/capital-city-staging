import { Metadata } from 'next';
import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { fetchInventoryById, fetchAdjacentInventoryIds, getMostRecentId } from '@/app/actions';
import PageLayout from '@/components/layout/PageLayout';
import Edit from '@/app/admin/edit/Edit';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { idParser, ParsedParams } from './parsers';

export const metadata: Metadata = {
    title: 'Capital City Staging - Edit Images',
    description:
        "Capital City Staging allows you to focus on your next moves, we'll handle your history. With a home staged by Mia, you can trust that every room tells your story.",
    keywords:
        'Capital City Staging, Sacramento Staging, Mia Capital City Staging, Mia Realtor, Mia Staging, Staging, Homestaging, Real Estate, Staging Services, Staging Software, Homestaging, Real Estate, Real Estate Staging, Real Estate Staging Services, Real Estate Staging Software, Mia, Mia Dofflemyer, Home Staging, Sacramento, Sacramento Home Staging, Sacramento Real Estate, Sacramento Real Estate Staging, Sacramento Real Estate Staging Services, Sacramento Staging Services, Capital City, Capital, City, City Stage, City Staging',
    applicationName: 'Capital City Staging',
    icons: {
        icon: '/logo/CCS_logo_152x152.png',
        shortcut: '/logo/CCS_logo_152x152.png',
        apple: '/logo/apple-touch-icon-152x152.png',
    },
    openGraph: {
        title: 'Capital City Staging - Edit Images',
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

async function fetchInventoryData(id: number) {
    const inventory = await fetchInventoryById(id);
    const { next_id, last_id } = await fetchAdjacentInventoryIds(id);
    return { ...inventory, next_id, last_id };
}

interface PageProps {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function Page({ searchParams }: PageProps) {
    // Parse search params server-side using nuqs parser
    const resolvedSearchParams = await searchParams;
    const parsedParams = {
        id: idParser.parseServerSide(resolvedSearchParams.id),
    };

    let id = parsedParams.id ? parseInt(parsedParams.id, 10) : null;

    if (!id) {
        // Fetch the most recent ID if no ID is provided
        const mostRecentId = await getMostRecentId();
        if (mostRecentId) {
            redirect(`/admin/edit?id=${mostRecentId}`);
        } else {
            return (
                <PageLayout page="/edit">
                    <div className="text-center text-xl">No inventory items found</div>
                </PageLayout>
            );
        }
    }

    const inventoryDataPromise = fetchInventoryData(id);

    return (
        <PageLayout page={`/edit?id=${id}`}>
            <Suspense fallback={<LoadingSpinner page="Edit" />}>
                <Edit inventoryDataPromise={inventoryDataPromise} current_id={id} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
