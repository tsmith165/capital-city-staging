import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Roseville',
  pageSlug: 'roseville',
  imageUrl: '/locations/roseville.jpg',
  imageAlt: 'Home Staging in Roseville, CA',
  description:
    'Capital City Staging provides professional home staging services in Roseville, helping your property attract more buyers and sell faster.',
  whyStaging:
    'Roseville’s booming real estate market demands properties that stand out. Our staging services ensure your home makes a lasting impression.',
  services: [
    'Full-Service Home Staging',
    'Interior Decoration',
    'Design Consultations',
    'Customized Styling Plans',
  ],
  contactText: 'Ready to enhance your Roseville home?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Professional home staging services in Roseville, California. Elevate your property’s appeal with Capital City Staging.',
  ogImageUrl: '/favicon/CCS_og_image.png'
});

export default function RosevilleHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
