import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Orangevale',
  pageSlug: 'orangevale',
  imageUrl: '/favicon/CCS_og_image.png',
  imageAlt: 'Home Staging in Orangevale, CA',
  description:
    'Capital City Staging provides expert home staging services in Orangevale, making your property more attractive to potential buyers.',
  whyStaging:
    'In Orangevale’s competitive market, effective staging is key to making your home memorable. We highlight your property’s best features.',
  services: [
    'Vacant and Occupied Home Staging',
    'Interior Design Consultation',
    'Customized Styling',
    'Market-Ready Preparation',
  ],
  contactText: 'Interested in staging your Orangevale home?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Professional home staging services in Orangevale, California. Make your property stand out with Capital City Staging.',
  imageUrl: locationData.imageUrl,
  imageAlt: locationData.imageAlt,
});

export default function OrangevaleHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
