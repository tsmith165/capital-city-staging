import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Citrus Heights',
  pageSlug: 'citrus-heights',
  imageUrl: '/locations/citrus-heights.jpg',
  imageAlt: 'Home Staging in Citrus Heights, CA',
  description:
    'Capital City Staging offers professional home staging services in Citrus Heights, enhancing your property’s appeal to attract more buyers.',
  whyStaging:
    'Citrus Heights boasts a vibrant real estate market. Our staging services help your home make a strong impression on potential buyers.',
  services: [
    'Comprehensive Home Staging',
    'Interior Decoration',
    'Design Consultations',
    'Customized Styling Plans',
  ],
  contactText: 'Interested in staging your Citrus Heights home?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Expert home staging services in Citrus Heights, California. Make your property stand out with Capital City Staging.',
  ogImageUrl: '/favicon/CCS_og_image.png'
});

export default function CitrusHeightsHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
