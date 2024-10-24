import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
    locationName: 'Folsom',
    pageSlug: 'folsom',
    imageUrl: '/locations/folsom.jpg',
    imageAlt: 'Home Staging in Folsom, CA',
    description:
        'Capital City Staging is proud to offer premier home staging services in Folsom, California. We help homeowners and real estate agents showcase properties to attract more buyers and achieve higher sale prices.',
    whyStaging:
        "Folsom is a vibrant community with a thriving real estate market. Our home staging services highlight your property's unique features to stand out in this competitive market.",
    services: ['Vacant Home Staging', 'Occupied Home Staging', 'Home Decoration and Styling', 'Consultations and Assessments'],
    contactText: 'Ready to stage your Folsom home?',
};

export const metadata: Metadata = generateLocationMetadata({
    locationName: locationData.locationName,
    pageSlug: locationData.pageSlug,
    description: "Professional home staging services in Folsom, California. Enhance your property's appeal with Capital City Staging.",
    ogImageUrl: '/favicon/CCS_og_image.png',
});

export default function FolsomHomeStaging() {
    return <LocationPageTemplate {...locationData} />;
}
