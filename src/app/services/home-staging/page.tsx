import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';

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
      <div className="flex flex-col items-center w-full h-fit py-16 px-8 space-y-8 bg-stone-900">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text gradient-gold-main">
          Professional Home Staging Services in Sacramento
        </h1>
        <p className="text-lg text-stone-300 max-w-3xl text-center">
          At Capital City Staging, we specialize in transforming homes to attract potential buyers and sell faster. Our team of experienced professionals creates beautiful and functional spaces that highlight your property's best features.
        </p>
        <div className="flex flex-col space-y-6 max-w-4xl">
          <h2 className="text-2xl font-semibold text-stone-100">
            Why Choose Our Home Staging Services?
          </h2>
          <ul className="list-disc list-inside text-stone-300 space-y-2">
            <li>Increase the perceived value of your home.</li>
            <li>Make a strong first impression on potential buyers.</li>
            <li>Highlight the best features of your property.</li>
            <li>Sell your home faster and for a higher price.</li>
          </ul>
          <h2 className="text-2xl font-semibold text-stone-100">
            Our Home Staging Process
          </h2>
          <ol className="list-decimal list-inside text-stone-300 space-y-2">
            <li>
              <strong>Consultation:</strong> We assess your property and discuss your goals.
            </li>
            <li>
              <strong>Design Plan:</strong> Our team creates a customized staging plan.
            </li>
            <li>
              <strong>Implementation:</strong> We stage your home using high-quality furnishings and decor.
            </li>
            <li>
              <strong>Review:</strong> Final walkthrough to ensure everything is perfect.
            </li>
          </ol>
          <h2 className="text-2xl font-semibold text-stone-100">Contact Us Today</h2>
          <p className="text-stone-300">
            Ready to make your Sacramento property stand out?{' '}
            <a href="/contact" className="text-secondary hover:underline">
              Contact us
            </a>{' '}
            today for a free consultation.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
