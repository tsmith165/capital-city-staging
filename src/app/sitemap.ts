import type { MetadataRoute } from 'next';
import { SERVICE_AREAS } from '@/components/layout/Footer.constants';
import { articles } from '@/app/info/articles_spec';
import { SITE_URL } from '@/lib/structuredData';

const SERVICE_SLUGS = ['home-staging', 'occupied-home-staging'] as const;

/**
 * Every entry used to carry one `new Date()` taken at build time, so each deploy told crawlers
 * that all 26 pages had changed — including evergreen articles that had not been touched in
 * years. A `lastmod` that is always "now" is a signal a crawler learns to discount.
 *
 * Articles have a real publication date. Nothing else on the site does, so those entries omit
 * `lastModified` rather than assert a date the repository cannot support.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
        { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${SITE_URL}/info`, changeFrequency: 'weekly', priority: 0.8 },
        ...SERVICE_SLUGS.map((slug) => ({
            url: `${SITE_URL}/services/${slug}`,
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        })),
        ...SERVICE_AREAS.map(({ slug }) => ({
            url: `${SITE_URL}/locations/${slug}`,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
        ...articles.map(({ url, datePublished }) => ({
            url: `${SITE_URL}${url}`,
            lastModified: datePublished,
            changeFrequency: 'yearly' as const,
            priority: 0.7,
        })),
    ];
}
