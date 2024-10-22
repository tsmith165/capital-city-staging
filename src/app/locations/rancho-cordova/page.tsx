import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
  locationName: 'Rancho Cordova',
  pageSlug: 'rancho-cordova',
  imageUrl: '/favicon/CCS_og_image.png',
  imageAlt: 'Home Staging in Rancho Cordova, CA',
  description:
    'Capital City Staging offers professional home staging services in Rancho Cordova, helping you present your property in the best possible light to attract potential buyers.',
  whyStaging:
    "Rancho Cordova's real estate market is dynamic and competitive. Our staging services ensure your home stands out, highlighting its best features to maximize appeal.",
  services: [
    'Comprehensive Home Staging',
    'Interior Decoration',
    'Design Consultations',
    'Customized Staging Plans',
  ],
  contactText: 'Ready to enhance your Rancho Cordova property?',
};

export const metadata: Metadata = generateLocationMetadata({
  locationName: locationData.locationName,
  pageSlug: locationData.pageSlug,
  description:
    "Expert home staging services in Rancho Cordova, California. Enhance your property's marketability with Capital City Staging.",
  imageUrl: locationData.imageUrl,
  imageAlt: locationData.imageAlt,
});

export default function RanchoCordovaHomeStaging() {
  return <LocationPageTemplate {...locationData} />;
}
