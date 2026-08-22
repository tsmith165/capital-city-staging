import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/structuredData';

interface LocationData {
    locationName: string;
    pageSlug: string;
    ogImageUrl: string;
    description: string;
    keywords?: string;
}

export function generateLocationMetadata(locationData: LocationData): Metadata {
    const {
        locationName,
        pageSlug,
        description,
        keywords = `home staging ${locationName}, ${locationName} home staging, Capital City Staging, home staging sacramento, home staging sacramento ca, staging services ${locationName}, sell home ${locationName}, real estate staging ${locationName}`,
        ogImageUrl,
    } = locationData;

    const title = `Home Staging Services in ${locationName}, CA`;

    return {
        title,
        description,
        keywords,
        alternates: { canonical: `${SITE_URL}/locations/${pageSlug}` },
        openGraph: {
            title: `${title} | Capital City Staging`,
            description,
            url: `${SITE_URL}/locations/${pageSlug}`,
            images: [
                {
                    url: `${SITE_URL}${ogImageUrl}`,
                    width: 1200,
                    height: 630,
                    alt: `Home staging in ${locationName}, California`,
                },
            ],
            type: 'website',
            locale: 'en_US',
        },
    };
}
