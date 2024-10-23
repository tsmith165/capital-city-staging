import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Loomis',
  pageSlug: 'loomis',
  imageUrl: '/locations/loomis.jpg',
  imageAlt: 'Home Staging in Loomis, CA',
  description:
    'Capital City Staging provides professional home staging services in Loomis, enhancing your property’s appeal to attract more buyers.',
  whyStaging:
    'Loomis offers a unique blend of rural charm and upscale living. Our staging services highlight the best aspects of your home to captivate buyers.',
  services: [
    'Full-Service Home Staging',
    'Interior Decoration',
    'Design Consultations',
    'Personalized Styling Plans',
  ],
  contactText: 'Ready to stage your Loomis home?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Expert home staging services in Loomis, California. Make your property stand out with Capital City Staging.',
  ogImageUrl: '/favicon/CCS_og_image.png'
});

export default function LoomisHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
