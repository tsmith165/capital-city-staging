import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';
import Link from 'next/link';
import { articles } from '@/app/info/articles_spec';

export const metadata: Metadata = {
    title: 'Home Staging Resources & Information | Capital City Staging',
    description:
        'Explore our collection of home staging articles, tips, and insights. Learn how to maximize your property value with professional staging advice.',
    keywords: 'home staging resources, staging articles, staging tips, Capital City Staging, real estate advice, staging information',
    openGraph: {
        title: 'Home Staging Resources & Information | Capital City Staging',
        description:
            'Explore our collection of home staging articles, tips, and insights. Learn how to maximize your property value with professional staging advice.',
        url: 'https://www.capitalcitystaging.com/info',
        images: [
            {
                url: '/favicon/CCS_og_image.png',
                width: 1200,
                height: 630,
                alt: 'Capital City Staging Resources',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    metadataBase: new URL('https://www.capitalcitystaging.com'),
};

export default function InfoPage() {
    return (
        <PageLayout page="info">
            <div className="flex h-fit w-full flex-col items-center space-y-12 bg-stone-900 px-8 py-16">
                <div className="w-full max-w-6xl">
                    <h1 className="mb-8 bg-clip-text text-center text-4xl font-bold text-transparent gradient-gold-main">
                        Home Staging Resources & Information
                    </h1>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={article.url}
                                className="group flex h-full flex-col overflow-hidden rounded-lg bg-stone-800 transition-transform hover:scale-105"
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    <Image
                                        src={article.imageSrc}
                                        alt={article.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <h2 className="mb-2 text-xl font-semibold text-primary group-hover:text-secondary_light">
                                        {article.title}
                                    </h2>
                                    <p className="text-sm text-stone-400">{article.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
