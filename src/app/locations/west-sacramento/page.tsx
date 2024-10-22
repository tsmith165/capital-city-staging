import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'West Sacramento',
  pageSlug: 'west-sacramento',
  imageUrl: '/favicon/CCS_og_image.png',
  imageAlt: 'Home Staging in West Sacramento, CA',
  description:
    'Capital City Staging provides expert home staging services in West Sacramento, helping your property shine in a competitive market.',
  whyStaging:
    "West Sacramento's growing real estate scene demands properties that stand out. Our staging services highlight your home's best features to attract potential buyers.",
  services: [
    'Vacant Home Staging',
    'Occupied Home Staging',
    'Interior Design Consultation',
    'Customized Styling Solutions',
  ],
  contactText: 'Ready to transform your West Sacramento property?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Expert home staging services in West Sacramento, California. Make your property irresistible with Capital City Staging.',
  imageUrl: locationData.imageUrl,
  imageAlt: locationData.imageAlt,
});

export default function WestSacramentoHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
