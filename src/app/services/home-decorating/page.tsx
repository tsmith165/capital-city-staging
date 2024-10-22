import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';

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
        url: '/favicon/CCS_og_image.png',
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
      <div className="flex flex-col items-center w-full h-fit py-16 px-8 space-y-8 bg-stone-900">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text gradient-gold-main">
          Expert Home Decoration Services in Sacramento
        </h1>
        <p className="text-lg text-stone-300 max-w-3xl text-center">
          Capital City Staging offers professional home decoration services to transform your living space into a stylish and functional environment that reflects your personal taste.
        </p>
        <div className="flex flex-col space-y-6 max-w-4xl">
          <h2 className="text-2xl font-semibold text-stone-100">
            Our Home Decoration Services Include:
          </h2>
          <ul className="list-disc list-inside text-stone-300 space-y-2">
            <li>Personalized interior design consultations.</li>
            <li>Space planning and furniture arrangement.</li>
            <li>Color scheme selection and coordination.</li>
            <li>Selection of furnishings, artwork, and accessories.</li>
          </ul>
          <h2 className="text-2xl font-semibold text-stone-100">Why Choose Us?</h2>
          <p className="text-stone-300">
            With years of experience in home decoration and staging, our team brings a keen eye for detail and a passion for design to every project. We work closely with you to bring your vision to life.
          </p>
          <h2 className="text-2xl font-semibold text-stone-100">Get Started Today</h2>
          <p className="text-stone-300">
            Ready to transform your home?{' '}
            <a href="/contact" className="text-secondary hover:underline">
              Contact us
            </a>{' '}
            to schedule a consultation.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
