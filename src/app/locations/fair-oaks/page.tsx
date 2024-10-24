import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
    locationName: 'Fair Oaks',
    pageSlug: 'fair-oaks',
    imageUrl: '/locations/fair-oaks.jpg',
    imageAlt: 'Home Staging in Fair Oaks, CA',
    description:
        'Capital City Staging offers professional home staging services in Fair Oaks, helping your property attract more potential buyers.',
    whyStaging:
        'Fair Oaks’ charming community benefits from staging that highlights each home’s unique character. We make your property stand out.',
    services: ['Full-Service Home Staging', 'Interior Decoration', 'Design Consultations', 'Personalized Styling Plans'],
    contactText: 'Ready to stage your Fair Oaks home?',
};

export const metadata: Metadata = generateLocationMetadata({
    locationName: locationData.locationName,
    pageSlug: locationData.pageSlug,
    description: 'Expert home staging services in Fair Oaks, California. Enhance your property’s appeal with Capital City Staging.',
    ogImageUrl: '/favicon/CCS_og_image.png',
});

export default function FairOaksHomeStaging() {
    return <LocationPageTemplate {...locationData} />;
}
