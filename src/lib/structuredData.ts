import { SERVICE_AREAS } from '@/components/layout/Footer.constants';
import type { Article } from '@/app/info/articles_spec';

export const SITE_URL = 'https://www.capitalcitystaging.com';

const CONTACT_EMAIL = 'mdofflemyer.realestate@gmail.com';
const CONTACT_PHONE = '+1-209-817-4240';

/**
 * The business itself. Local service businesses are ranked partly on this, and the site
 * previously emitted no organisation or location data at all.
 */
export function localBusinessSchema(standalone = true): Record<string, unknown> {
    return {
        ...(standalone ? { '@context': 'https://schema.org' } : {}),
        '@type': 'HomeAndConstructionBusiness',
        '@id': `${SITE_URL}/#business`,
        name: 'Capital City Staging',
        description: 'Professional home staging in Sacramento and the surrounding area, helping homes sell faster and for more money.',
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
        knowsAbout: ['Home staging', 'Vacant home staging', 'Occupied home staging', 'Real estate presentation'],
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

/**
 * Articles referenced `${SITE_URL}/#business` as their publisher, but that node is only defined
 * on the homepage, so the reference dangled on every article page. This emits an `@graph` holding
 * the business itself alongside the article, which resolves it within the document.
 *
 * `dateModified` is deliberately absent: the articles have a real publication date, and inventing
 * a modification date to claim freshness is worse than omitting the field.
 */
export function articleSchema(article: Article): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@graph': [
            localBusinessSchema(false),
            {
                '@type': 'Article',
                headline: article.title,
                description: article.description,
                image: `${SITE_URL}${article.imageSrc}`,
                datePublished: article.datePublished,
                mainEntityOfPage: `${SITE_URL}${article.url}`,
                publisher: { '@id': `${SITE_URL}/#business` },
                author: {
                    '@type': 'Person',
                    name: 'Mia Dofflemyer',
                },
            },
        ],
    };
}
