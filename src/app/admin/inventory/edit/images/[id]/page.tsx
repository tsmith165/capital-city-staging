import type { Metadata } from 'next';

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

import PageLayout from '@/components/layout/PageLayout';
import ImageEditor from '@/app/admin/edit/images/[id]/ImageEditor';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return (
        <PageLayout page={`/edit/${params.id}`}>
            <ImageEditor inventoryId={params.id} />
        </PageLayout>
    );
}
