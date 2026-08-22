import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { articles } from '@/app/info/articles_spec';
import { SITE_URL } from '@/lib/structuredData';

const TITLE = 'Home Staging Resources & Information';
const DESCRIPTION =
    'Explore our collection of home staging articles, tips, and insights. Learn how to maximize your property value with professional staging advice.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords: 'home staging resources, staging articles, staging tips, Capital City Staging, real estate advice, staging information',
    alternates: { canonical: `${SITE_URL}/info` },
    openGraph: {
        title: `${TITLE} | Capital City Staging`,
        description: DESCRIPTION,
        url: `${SITE_URL}/info`,
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: `${TITLE} | Capital City Staging`,
        description: DESCRIPTION,
        site: '@capitalcitystaging',
        creator: '@capitalcitystaging',
    },
};

export default function InfoPage() {
    return (
        <PageLayout page="info">
            <div className="w-full bg-ink px-6 py-14 sm:px-8 sm:py-20">
                <div className="mx-auto w-full max-w-6xl">
                    <header className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold tracking-[0.2em] text-forest-200 uppercase">Resources</p>
                        <h1 className="mt-3 bg-clip-text font-display text-3xl leading-tight font-bold text-transparent gradient-gold-main sm:text-4xl">
                            What staging actually does
                        </h1>
                        <p className="mt-5 text-lg text-pretty text-body-muted">
                            The numbers behind staging, what it costs, and how buyers read a room. Written for sellers deciding
                            whether it’s worth it.
                        </p>
                    </header>

                    <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {articles.map((article) => (
                            <li key={article.id} className="h-full">
                                <Link
                                    href={article.url}
                                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface-raised shadow-card transition-colors hover:border-gold-500"
                                >
                                    <div className="relative aspect-16/9 w-full overflow-hidden bg-surface">
                                        <Image
                                            src={article.imageSrc}
                                            alt=""
                                            fill
                                            className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <h2 className="font-display text-xl font-semibold text-gold-300">{article.title}</h2>
                                        <p className="mt-3 flex-1 text-sm leading-relaxed text-body-muted">{article.description}</p>
                                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-200 transition-colors group-hover:text-gold-300">
                                            Read the article
                                            <ArrowRight
                                                size={15}
                                                aria-hidden="true"
                                                className="transition-transform duration-200 group-hover:translate-x-0.5"
                                            />
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </PageLayout>
    );
}
