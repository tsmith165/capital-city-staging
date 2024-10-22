import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'North Highlands',
  pageSlug: 'north-highlands',
  imageUrl: '/favicon/CCS_og_image.png',
  imageAlt: 'Home Staging in North Highlands, CA',
  description:
    'Capital City Staging offers professional home staging services in North Highlands, enhancing your property’s appeal to attract more buyers.',
  whyStaging:
    'North Highlands has a dynamic real estate market. Our staging services help your home stand out, making it more attractive to potential buyers.',
  services: [
    'Full-Service Home Staging',
    'Interior Design Consultation',
    'Customized Styling',
    'Market-Ready Preparation',
  ],
  contactText: 'Looking to elevate your North Highlands property?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Professional home staging services in North Highlands, California. Enhance your property’s appeal with Capital City Staging.',
  imageUrl: locationData.imageUrl,
  imageAlt: locationData.imageAlt,
});

export default function NorthHighlandsHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
