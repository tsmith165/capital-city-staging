import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';
import Head from 'next/head';

export const metadata: Metadata = {
    title: 'Professional Home Staging Services in Sacramento | Capital City Staging',
    description:
        'Enhance your Sacramento property with our professional home staging services. Attract more buyers and sell faster with Capital City Staging.',
    keywords:
        'home staging Sacramento, Sacramento home staging, professional home staging, Capital City Staging, sell home fast, attract buyers, real estate staging',
    openGraph: {
        title: 'Professional Home Staging Services in Sacramento | Capital City Staging',
        description:
            'Enhance your Sacramento property with our professional home staging services. Attract more buyers and sell faster with Capital City Staging.',
        url: 'https://www.capitalcitystaging.com/services/home-staging',
        images: [
            {
                url: '/favicon/CCS_og_image.png',
                width: 1200,
                height: 630,
                alt: 'Home Staging in Sacramento',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
};

export default function HomeStagingServices() {
    return (
        <PageLayout page="home-staging">
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Service',
                        name: 'Professional Home Staging Services in Sacramento',
                        description:
                            'Enhance your Sacramento property with our professional home staging services. Attract more buyers and sell faster with Capital City Staging.',
                        image: 'https://www.capitalcitystaging.com/images/home-staging.jpg',
                        provider: {
                            '@type': 'Organization',
                            name: 'Capital City Staging',
                        },
                        areaServed: {
                            '@type': 'Place',
                            name: 'Sacramento, CA',
                        },
                    })}
                </script>
            </Head>
            <div className="flex h-fit w-full flex-col items-center space-y-8 bg-stone-900 px-8 py-16">
                <h1 className="bg-clip-text text-center text-4xl font-bold text-transparent gradient-gold-main">
                    Professional Home Staging Services in Sacramento
                </h1>
                <div className="relative mx-auto w-full max-w-4xl">
                    <Image
                        src="/services/home-staging.jpg"
                        alt="Home Staging in Sacramento"
                        width={1280}
                        height={721}
                        className="h-auto w-full rounded-md"
                    />
                </div>
                <div className="flex max-w-4xl flex-col space-y-6 text-stone-300">
                    <p className="text-center text-lg text-stone-300">
                        At Capital City Staging, we specialize in transforming homes to attract potential buyers and sell faster. Our team
                        of experienced professionals creates beautiful and functional spaces that highlight your property's best features.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Why Choose Our Home Staging Services?</h2>
                    <ul className="list-inside list-disc space-y-2 text-secondary_light">
                        <li className="text-secondary_light">Increase the perceived value of your home.</li>
                        <li className="text-secondary_light">Make a strong first impression on potential buyers.</li>
                        <li className="text-secondary_light">Highlight the best features of your property.</li>
                        <li className="text-secondary_light">Sell your home faster and for a higher price.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-primary">Our Home Staging Process</h2>
                    <ol className="list-inside list-decimal space-y-2 text-secondary_light">
                        <li className="text-stone-300">
                            <strong className="text-secondary_light">Consultation:</strong> We assess your property and discuss your goals.
                        </li>
                        <li className="text-stone-300">
                            <strong className="text-secondary_light">Design Plan:</strong> Our team creates a customized staging plan.
                        </li>
                        <li className="text-stone-300">
                            <strong className="text-secondary_light">Implementation:</strong> We stage your home using high-quality
                            furnishings and decor.
                        </li>
                        <li className="text-stone-300">
                            <strong className="text-secondary_light">Review:</strong> Final walkthrough to ensure everything is perfect.
                        </li>
                    </ol>

                    <h2 className="text-2xl font-semibold text-primary">Contact Us Today</h2>
                    <p className="text-stone-300">
                        Ready to make your Sacramento property stand out?{' '}
                        <a href="/contact" className="text-secondary_light hover:underline">
                            Contact us
                        </a>{' '}
                        today for a free consultation.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
}
