import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';
import Head from 'next/head';

export const metadata: Metadata = {
    title: 'Home Staging Statistics | Capital City Staging',
    description:
        'Explore key statistics that demonstrate the effectiveness of home staging. Learn how staging influences sale price, time on market, and buyer perceptions.',
    keywords:
        'home staging statistics, staging effectiveness, real estate data, Capital City Staging, sell home faster, increase home value, buyer behavior',
    openGraph: {
        title: 'Home Staging Statistics | Capital City Staging',
        description:
            'Explore key statistics that demonstrate the effectiveness of home staging. Learn how staging influences sale price, time on market, and buyer perceptions.',
        url: 'https://www.capitalcitystaging.com/info/home-staging-statistics',
        images: [
            {
                url: '/favicon/CCS_og_image.png',
                width: 1200,
                height: 630,
                alt: 'Key Home Staging Statistics',
            },
        ],
        type: 'article',
        locale: 'en_US',
    },
};

export default function HomeStagingStatistics() {
    return (
        <PageLayout page="home-staging-statistics">
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'Home Staging Statistics | Capital City Staging',
                        description:
                            'Explore key statistics that demonstrate the effectiveness of home staging. Learn how staging influences sale price, time on market, and buyer perceptions.',
                        image: 'https://www.capitalcitystaging.com/images/home-staging-statistics.jpg',
                        author: {
                            '@type': 'Organization',
                            name: 'Capital City Staging',
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'Capital City Staging',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://www.capitalcitystaging.com/logo/CCS_logo_152x152.png',
                            },
                        },
                        datePublished: '2023-10-22',
                    })}
                </script>
            </Head>
            <div className="flex h-fit w-full flex-col items-center space-y-8 bg-stone-900 px-8 py-16">
                <h1 className="bg-clip-text text-center text-4xl font-bold text-transparent gradient-gold-main">Home Staging Statistics</h1>
                <div className="relative mx-auto w-full max-w-4xl">
                    <Image
                        src="/info/home-staging-statistics.jpg"
                        alt="Home Staging Tips and Tricks"
                        width={960}
                        height={609}
                        className="h-auto w-full rounded-md"
                    />
                </div>
                <div className="flex max-w-4xl flex-col space-y-6 text-stone-300">
                    <p className="text-lg text-stone-300">
                        Understanding the impact of home staging on the real estate market can help you make informed decisions when selling
                        your property. At Capital City Staging, we believe in the power of data to demonstrate the effectiveness of our
                        services. Here are some key statistics that highlight the benefits of home staging.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Faster Sales with Staging</h2>
                    <p className="text-stone-300">
                        <strong className="text-secondary_light">73% Faster Sales:</strong> According to the Real Estate Staging Association
                        (RESA), professionally staged homes spend 73% less time on the market compared to non-staged homes.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Higher Sale Prices</h2>
                    <p className="text-stone-300">
                        <strong className="text-secondary_light">6-20% Increase in Value:</strong> The National Association of Realtors
                        (NAR) reports that staged homes can increase the dollar value offered by buyers by 6-20% compared to similar homes
                        that are not staged.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Impact on Buyer Decisions</h2>
                    <p className="text-stone-300">
                        <strong className="text-secondary_light">81% of Buyers:</strong> A survey by NAR found that 81% of buyers find it
                        easier to visualize a property as their future home when it is staged.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Online Appeal</h2>
                    <p className="text-stone-300">
                        <strong className="text-secondary_light">Over 90%:</strong> More than 90% of home buyers search online during their
                        home buying process. High-quality photos of staged homes can significantly increase online interest.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Return on Investment</h2>
                    <p className="text-stone-300">
                        <strong className="text-secondary_light">Up to 586% ROI:</strong> A study by the HomeGain Selling Survey indicated
                        that staging can provide a return on investment of up to 586%, making it one of the highest ROI home improvement
                        projects.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Room Importance Rankings</h2>
                    <p className="text-stone-300">Buyers consider the following rooms most important when viewing a home:</p>
                    <ol className="list-inside list-decimal space-y-2 pl-2">
                        <li className="text-secondary_light">Living Room</li>
                        <li className="text-secondary_light">Master Bedroom</li>
                        <li className="text-secondary_light">Kitchen</li>
                        <li className="text-secondary_light">Dining Room</li>
                        <li className="text-secondary_light">Bathroom</li>
                    </ol>
                    <p className="text-stone-300">
                        Focusing staging efforts on these areas can have the greatest impact on buyer perceptions.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Reduced Negotiations</h2>
                    <p className="text-stone-300">
                        Staged homes often face fewer buyer objections and lower demands for price reductions, as they present fewer
                        perceived issues.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">First Impressions Matter</h2>
                    <p className="text-stone-300">
                        Buyers form an opinion about a home within the first 7-10 seconds of viewing it. Staging ensures that the first
                        impression is positive and memorable.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Experience the Difference</h2>
                    <p className="text-stone-300">
                        These statistics highlight the tangible benefits of home staging. At Capital City Staging, we utilize proven
                        strategies to maximize your property's potential.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Ready to Benefit from Staging?</h2>
                    <p className="text-stone-300">
                        If you're interested in leveraging the power of home staging statistics for your sale,{' '}
                        <a href="/contact" className="text-secondary_light hover:underline">
                            contact us
                        </a>{' '}
                        today to discuss how we can help.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
}
