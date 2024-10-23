import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Antelope',
  pageSlug: 'antelope',
  imageUrl: '/locations/antelope.jpg',
  imageAlt: 'Home Staging in Antelope, CA',
  description:
    'Capital City Staging provides expert home staging services in Antelope, helping you present your property in the best possible light.',
  whyStaging:
    'In Antelope’s competitive market, effective staging can significantly impact your home’s sale. We ensure your property appeals to a broad audience.',
  services: [
    'Vacant Home Staging',
    'Occupied Home Staging',
    'Design Consultations',
    'Personalized Staging Solutions',
  ],
  contactText: 'Ready to stage your Antelope home?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    'Professional home staging services in Antelope, California. Enhance your property’s marketability with Capital City Staging.',
  ogImageUrl: '/favicon/CCS_og_image.png'
});

export default function AntelopeHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
