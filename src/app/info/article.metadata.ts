import type { Metadata } from 'next';
import type { Article } from '@/app/info/articles_spec';
import { SITE_URL } from '@/lib/structuredData';

export function articleMetadata(article: Article, keywords: string): Metadata {
    const ogTitle = `${article.title} | Capital City Staging`;

    return {
        title: article.title,
        description: article.description,
        keywords,
        alternates: { canonical: `${SITE_URL}${article.url}` },
        openGraph: {
            title: ogTitle,
            description: article.description,
            url: `${SITE_URL}${article.url}`,
            images: [{ url: '/favicon/CCS_og_image.png', width: 1200, height: 630, alt: article.title }],
            type: 'article',
            publishedTime: article.datePublished,
            locale: 'en_US',
        },
    };
}
