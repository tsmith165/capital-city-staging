import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';
import Head from 'next/head';

export const metadata: Metadata = {
  title: 'Expert Home Decoration Services in Sacramento | Capital City Staging',
  description:
    'Transform your living space with our expert home decoration services in Sacramento. Capital City Staging brings style and functionality to your home.',
  keywords:
    'home decoration Sacramento, Sacramento home decoration, interior design, Capital City Staging, home styling, home decor services, enhance living space',
  openGraph: {
    title: 'Expert Home Decoration Services in Sacramento | Capital City Staging',
    description:
      'Transform your living space with our expert home decoration services in Sacramento. Capital City Staging brings style and functionality to your home.',
    url: 'https://www.capitalcitystaging.com/services/home-decoration',
    images: [
      {
        url: 'favicon/CCS_og_image.png',
        width: 1200,
        height: 630,
        alt: 'Home Decoration in Sacramento',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
};

export default function HomeDecorationServices() {
    return (
        <PageLayout page="home-decoration">
            <Head>
                <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Service',
                    name: 'Expert Home Decoration Services in Sacramento',
                    description:
                    'Transform your living space with our expert home decoration services in Sacramento. Capital City Staging brings style and functionality to your home.',
                    image: 'https://www.capitalcitystaging.com/images/home-decoration.jpg',
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
            <div className="flex flex-col items-center w-full h-fit py-16 px-8 space-y-8 bg-stone-900">
                <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text gradient-gold-main">
                Expert Home Decoration Services in Sacramento
                </h1>
                <div className="relative w-full max-w-4xl mx-auto">
                    <Image
                        src="/services/home-decoration.jpg"
                        alt="Home Decoration in Sacramento"
                        width={1280}
                        height={720}
                        className="w-full h-auto rounded-md"
                    />
                </div>
                <div className="flex flex-col space-y-6 max-w-4xl text-stone-300">
                    <p className="text-lg text-stone-300 text-center">
                        Capital City Staging offers professional home decoration services to transform your living space into a stylish and functional environment that reflects your personal taste.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">
                        Our Home Decoration Services Include:
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-secondary_light">
                        <li className='text-secondary_light'>Personalized interior design consultations.</li>
                        <li className='text-secondary_light'>Space planning and furniture arrangement.</li>
                        <li className='text-secondary_light'>Color scheme selection and coordination.</li>
                        <li className='text-secondary_light'>Selection of furnishings, artwork, and accessories.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-primary">Why Choose Us?</h2>
                    <p className="text-stone-300">
                        With years of experience in home decoration and staging, our team brings a keen eye for detail and a passion for design to every project. We work closely with you to bring your vision to life.
                    </p>

                    <h2 className="text-2xl font-semibold text-primary">Get Started Today</h2>
                    <p className="text-stone-300">
                        Ready to transform your home?{' '}
                        <a href="/contact" className="text-secondary_light hover:underline">
                        Contact us
                        </a>{' '}
                        to schedule a consultation.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
}
