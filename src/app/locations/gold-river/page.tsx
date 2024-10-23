import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Gold River',
  pageSlug: 'gold-river',
  imageUrl: '/locations/gold-river.jpg',
  imageAlt: 'Home Staging in Gold River, CA',
  description:
    'Capital City Staging provides expert home staging services in Gold River, elevating your property’s appeal to attract discerning buyers.',
  whyStaging:
    'Gold River’s upscale market demands exceptional presentation. Our staging services highlight your home’s luxury features.',
  services: [
    'Luxury Home Staging',
    'Interior Design and Styling',
    'Custom Design Solutions',
    'Photography Preparation',
  ],
  contactText: 'Looking to enhance your Gold River property?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Professional home staging services in Gold River, California. Showcase your property’s luxury with Capital City Staging.',
  ogImageUrl: '/favicon/CCS_og_image.png'
});

export default function GoldRiverHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
