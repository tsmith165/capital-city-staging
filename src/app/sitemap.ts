import type { MetadataRoute } from 'next';
import { SERVICE_AREAS } from '@/components/layout/Footer.constants';
import { articles } from '@/app/info/articles_spec';
import { SITE_URL } from '@/lib/structuredData';

const SERVICE_SLUGS = ['home-staging', 'home-decorating'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return [
        { url: SITE_URL, changeFrequency: 'monthly' as const, priority: 1 },
        { url: `${SITE_URL}/contact`, changeFrequency: 'monthly' as const, priority: 0.9 },
        { url: `${SITE_URL}/info`, changeFrequency: 'weekly' as const, priority: 0.8 },
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
        ...articles.map(({ url }) => ({
            url: `${SITE_URL}${url}`,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
    ].map((entry) => ({ ...entry, lastModified }));
}
