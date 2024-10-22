import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Rocklin',
  pageSlug: 'rocklin',
  imageUrl: '/favicon/CCS_og_image.png',
  imageAlt: 'Home Staging in Rocklin, CA',
  description:
    'Capital City Staging offers expert home staging services in Rocklin, enhancing your property’s appeal to attract potential buyers.',
  whyStaging:
    'Rocklin’s growing community values homes that are move-in ready. Our staging services help your property meet buyer expectations.',
  services: [
    'Vacant and Occupied Home Staging',
    'Interior Design Consultation',
    'Customized Styling Solutions',
    'Photography Preparation',
  ],
  contactText: 'Interested in staging your Rocklin home?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Professional home staging services in Rocklin, California. Enhance your property’s marketability with Capital City Staging.',
  imageUrl: locationData.imageUrl,
  imageAlt: locationData.imageAlt,
});

export default function RocklinHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
