import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';
import Head from 'next/head';

export const metadata: Metadata = {
    title: 'Home Staging Tips and Tricks | Capital City Staging',
    description:
        'Discover expert tips and tricks for staging your home to sell faster and for a higher price. Learn from the professionals at Capital City Staging.',
    keywords:
        'home staging tips, staging tricks, sell home faster, increase home value, DIY staging, Capital City Staging, real estate advice',
    openGraph: {
        title: 'Home Staging Tips and Tricks | Capital City Staging',
        description:
            'Discover expert tips and tricks for staging your home to sell faster and for a higher price. Learn from the professionals at Capital City Staging.',
        url: 'https://www.capitalcitystaging.com/info/home-staging-tips',
        images: [
            {
                url: '/favicon/CCS_og_image.png',
                width: 1200,
                height: 630,
                alt: 'Home Staging Tips and Tricks',
            },
        ],
        type: 'article',
        locale: 'en_US',
    },
};

export default function HomeStagingTips() {
    return (
        <PageLayout page="home-staging-tips">
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'Home Staging Tips and Tricks | Capital City Staging',
                        description:
                            'Discover expert tips and tricks for staging your home to sell faster and for a higher price. Learn from the professionals at Capital City Staging.',
                        image: 'https://www.capitalcitystaging.com/images/home-staging-tips.jpg',
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
                <h1 className="bg-clip-text text-center text-4xl font-bold text-transparent gradient-gold-main">
                    Home Staging Tips and Tricks
                </h1>
                <div className="relative mx-auto w-full max-w-4xl">
                    <Image
                        src="/info/home-staging-tips.jpg"
                        alt="Home Staging Tips and Tricks"
                        width={720}
                        height={720}
                        className="h-auto w-full rounded-md"
                    />
                </div>
                <div className="flex max-w-4xl flex-col space-y-6 text-stone-300">
                    <p className="text-lg text-stone-300">
                        Preparing your home for sale can be a daunting task. At Capital City Staging, we've compiled a list of expert tips
                        and tricks to help you stage your home effectively and attract potential buyers.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">1. Declutter Your Space</h2>
                    <p className="text-stone-300">
                        Remove unnecessary items to create a sense of space. A clutter-free home appears larger and allows buyers to focus
                        on the property's features.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">2. Depersonalize the Home</h2>
                    <p className="text-stone-300">
                        Take down personal photographs and mementos. This helps buyers envision themselves living in the space, which can
                        increase their emotional connection to the property.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">3. Make Minor Repairs</h2>
                    <p className="text-stone-300">
                        Fix leaky faucets, squeaky doors, and chipped paint. Small repairs can significantly improve the overall impression
                        of your home.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">4. Enhance Curb Appeal</h2>
                    <p className="text-stone-300">
                        First impressions matter. Mow the lawn, trim hedges, and consider adding potted plants near the entrance to make
                        your home inviting from the outside.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">5. Optimize Lighting</h2>
                    <p className="text-stone-300">
                        Open curtains and blinds to let in natural light. Ensure all bulbs are working and consider using higher wattage
                        bulbs to brighten rooms.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">6. Neutralize Color Schemes</h2>
                    <p className="text-stone-300">
                        Use neutral colors for walls and décor to appeal to a broader range of buyers. Neutral tones create a blank canvas
                        for buyers to imagine their own style.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">7. Arrange Furniture Strategically</h2>
                    <p className="text-stone-300">
                        Position furniture to highlight the flow of the room and create cozy conversation areas. Avoid blocking windows or
                        natural pathways.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">8. Keep It Clean</h2>
                    <p className="text-stone-300">
                        A spotless home signals to buyers that the property has been well-maintained. Pay attention to details like clean
                        windows, dust-free surfaces, and fresh-smelling air.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Need Professional Help?</h2>
                    <p className="text-stone-300">
                        While these tips can get you started, professional home staging can take your property to the next level.{' '}
                        <a href="/contact" className="text-secondary_light hover:underline">
                            Contact us
                        </a>{' '}
                        at Capital City Staging to learn how we can help you sell your home faster and for a higher price.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
}
