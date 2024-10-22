import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';

interface LocationPageProps {
  locationName: string;
  pageSlug: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  whyStaging: string;
  services: string[];
  contactText: string;
}

export default function LocationPageTemplate({
  locationName,
  pageSlug,
  imageUrl,
  imageAlt,
  description,
  whyStaging,
  services,
  contactText,
}: LocationPageProps) {
  return (
    <PageLayout page={pageSlug}>
      <div className="flex flex-col items-center w-full h-full py-16 px-8 space-y-8">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text gradient-gold-main">
          Professional Home Staging in {locationName}, CA
        </h1>
        <p className="text-lg text-stone-300 max-w-3xl text-center">
          {description}
        </p>
        <div className="flex flex-col space-y-6 max-w-4xl px-8">
          <h2 className="text-2xl font-semibold text-stone-100">
            Why Home Staging in {locationName}?
          </h2>
          <p className="text-stone-300">{whyStaging}</p>
          <h2 className="text-2xl font-semibold text-stone-100">
            Our {locationName} Services Include:
          </h2>
          <ul className="list-disc list-inside text-stone-300 space-y-2">
            {services.map((service, index) => (
              <li key={index}>{service}</li>
            ))}
          </ul>
          <h2 className="text-2xl font-semibold text-stone-100">Contact Us</h2>
          <p className="text-stone-300">
            {contactText}{' '}
            <a href="/contact" className="text-secondary hover:underline">
              Contact us
            </a>{' '}
            today to schedule a consultation.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
