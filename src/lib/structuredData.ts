import { SERVICE_AREAS } from '@/components/layout/Footer.constants';

export const SITE_URL = 'https://www.capitalcitystaging.com';

const CONTACT_EMAIL = 'mdofflemyer.realestate@gmail.com';
const CONTACT_PHONE = '+1-209-817-4240';

/**
 * The business itself. Local service businesses are ranked partly on this, and the site
 * previously emitted no organisation or location data at all.
 */
export function localBusinessSchema(): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'HomeAndConstructionBusiness',
        '@id': `${SITE_URL}/#business`,
        name: 'Capital City Staging',
        description:
            'Professional home staging and decorating in Sacramento and the surrounding area, helping homes sell faster and for more money.',
        url: SITE_URL,
        email: CONTACT_EMAIL,
        telephone: CONTACT_PHONE,
        image: `${SITE_URL}/favicon/CCS_og_image.png`,
        logo: `${SITE_URL}/logo/CCS_logo.png`,
        priceRange: '$$',
        founder: {
            '@type': 'Person',
            name: 'Mia Dofflemyer',
            jobTitle: 'Founder and Home Stager',
        },
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Sacramento',
            addressRegion: 'CA',
            addressCountry: 'US',
        },
        areaServed: SERVICE_AREAS.map(({ name }) => ({
            '@type': 'City',
            name: `${name}, CA`,
        })),
        knowsAbout: ['Home staging', 'Vacant home staging', 'Occupied home staging', 'Home decorating', 'Real estate presentation'],
    };
}

export function serviceSchema({
    name,
    description,
    image,
    areaName = 'Sacramento, CA',
}: {
    name: string;
    description: string;
    image?: string;
    areaName?: string;
}): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        ...(image ? { image } : {}),
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: { '@type': 'Place', name: areaName },
    };
}

export function articleSchema({
    headline,
    description,
    path,
}: {
    headline: string;
    description: string;
    path: string;
}): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline,
        description,
        mainEntityOfPage: `${SITE_URL}${path}`,
        publisher: { '@id': `${SITE_URL}/#business` },
        author: {
            '@type': 'Person',
            name: 'Mia Dofflemyer',
        },
    };
}
