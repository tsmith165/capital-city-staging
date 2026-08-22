import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import ArticleShell from '@/components/content/ArticleShell';
import ContactCallout from '@/components/content/ContactCallout';
import JsonLd from '@/components/seo/JsonLd';
import { articleSchema } from '@/lib/structuredData';
import { getArticle } from '@/app/info/articles_spec';
import { articleMetadata } from '@/app/info/article.metadata';

const article = getArticle('home-staging-statistics');

const HEADLINE_STATS = [
    { value: '73%', label: 'less time on the market for professionally staged homes', source: 'Real Estate Staging Association' },
    { value: '6-20%', label: 'increase in the dollar value buyers offer', source: 'National Association of Realtors' },
    {
        value: '81%',
        label: 'of buyers find it easier to visualize a staged property as their home',
        source: 'National Association of Realtors',
    },
    { value: '586%', label: 'peak return on investment reported for staging', source: 'HomeGain Selling Survey' },
];

export const metadata: Metadata = articleMetadata(
    article,
    'home staging statistics, staging effectiveness, real estate data, Capital City Staging, sell home faster, increase home value, buyer behavior',
);

export default function HomeStagingStatistics() {
    return (
        <PageLayout page="home-staging-statistics">
            <JsonLd data={articleSchema({ headline: article.title, description: article.description, path: article.url })} />
            <ArticleShell
                eyebrow="Resources"
                title={article.title}
                lead="What the data says about staging, sale price and time on market."
                image={{
                    src: article.imageSrc,
                    alt: 'A staged interior used to illustrate home staging market data',
                    width: article.imageWidth,
                    height: article.imageHeight,
                }}
                aside={
                    <ContactCallout
                        heading="Ready to benefit from staging?"
                        body="Let us show you what these numbers look like for your specific property."
                    />
                }
            >
                <p>
                    Understanding the impact of home staging on the real estate market helps you make informed decisions when selling. Here
                    are the figures that matter most.
                </p>

                <div className="not-prose my-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {HEADLINE_STATS.map((stat) => (
                        <div key={stat.value} className="border-line bg-surface-raised shadow-raised rounded-xl border p-5">
                            <p className="font-display text-gold-300 text-3xl font-bold">{stat.value}</p>
                            <p className="text-body mt-2 text-sm">{stat.label}</p>
                            <p className="text-body-subtle mt-3 text-xs">{stat.source}</p>
                        </div>
                    ))}
                </div>

                <h2>Online appeal</h2>
                <p>
                    More than 90% of home buyers search online during their buying process. High-quality photos of staged homes
                    significantly increase online interest, which is where nearly every showing now begins.
                </p>

                <h2>Room importance rankings</h2>
                <p>Buyers consider the following rooms most important when viewing a home:</p>
                <ol>
                    <li>Living room</li>
                    <li>Master bedroom</li>
                    <li>Kitchen</li>
                    <li>Dining room</li>
                    <li>Bathroom</li>
                </ol>
                <p>Focusing staging effort on these areas has the greatest impact on buyer perception.</p>

                <h2>Reduced negotiations</h2>
                <p>
                    Staged homes face fewer buyer objections and lower demands for price reductions, because they present fewer perceived
                    issues.
                </p>

                <h2>First impressions matter</h2>
                <p>
                    Buyers form an opinion about a home within the first 7 to 10 seconds of viewing it. Staging makes sure that first
                    impression is positive and memorable.
                </p>
            </ArticleShell>
        </PageLayout>
    );
}
