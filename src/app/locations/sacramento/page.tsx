import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Sacramento',
  pageSlug: 'sacramento',
  imageUrl: '/locations/sacramento.jpg',
  imageAlt: 'Home Staging in Sacramento, CA',
  description:
    'Capital City Staging offers premier home staging services in Sacramento, transforming properties to captivate potential buyers and sell faster.',
  whyStaging:
    "Sacramento's real estate market is thriving and competitive. Our professional staging services ensure your property stands out, highlighting its best features to attract more buyers.",
  services: [
    'Full-Service Home Staging',
    'Interior Decoration and Styling',
    'Design Consultations',
    'Personalized Staging Strategies',
  ],
  contactText: 'Looking to stage your Sacramento home?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    "Professional home staging services in Sacramento, California. Elevate your property's appeal with Capital City Staging.",
  ogImageUrl: '/favicon/CCS_og_image.png'
});

export default function SacramentoHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
