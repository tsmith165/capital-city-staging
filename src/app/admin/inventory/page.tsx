import { Metadata } from 'next';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import InventoryPage from './InventoryPage';
import Image from 'next/image';
import { categoryParser, itemIdParser } from './parsers';
import { fetchInventory } from '@/app/actions';

export const metadata: Metadata = {
    title: 'Capital City Staging - Inventory Management',
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
        title: 'Capital City Staging - Inventory Management',
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

interface PageProps {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function Page({ searchParams }: PageProps) {
    // Await searchParams first
    const resolvedSearchParams = await searchParams;

    // Parse all search parameters server-side using nuqs parsers
    const parsedParams = {
        category: categoryParser.parseServerSide(resolvedSearchParams.category),
        item: itemIdParser.parseServerSide(resolvedSearchParams.item),
    };

    // Pre-fetch initial data
    const inventoryData = await fetchInventory();

    return (
        <PageLayout page="/admin/inventory">
            <Suspense>
                <InventoryPage initialData={inventoryData} initialParams={parsedParams} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
