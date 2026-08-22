import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/structuredData';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/api/', '/profile', '/signin', '/signup', '/signout'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
