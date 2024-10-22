import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Elk Grove',
  pageSlug: 'elk-grove',
  imageUrl: '/favicon/CCS_og_image.png',
  imageAlt: 'Home Staging in Elk Grove, CA',
  description:
    'Capital City Staging provides expert home staging services in Elk Grove, enhancing your property\'s appeal to attract more buyers and sell faster.',
  whyStaging:
    "Elk Grove's housing market is flourishing. Staging your home sets it apart from the competition, showcasing its full potential to prospective buyers.",
  services: [
    'Vacant and Occupied Home Staging',
    'Interior Design and Decoration',
    'Personalized Staging Strategies',
    'Professional Photography Preparation',
  ],
  contactText: 'Want to make your Elk Grove property shine?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Top-quality home staging services in Elk Grove, California. Make your property irresistible to buyers with Capital City Staging.',
  imageUrl: locationData.imageUrl,
  imageAlt: locationData.imageAlt,
});

export default function ElkGroveHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
