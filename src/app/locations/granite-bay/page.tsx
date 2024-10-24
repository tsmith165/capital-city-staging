import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
    locationName: 'Granite Bay',
    pageSlug: 'granite-bay',
    imageUrl: '/locations/granite-bay.jpg',
    imageAlt: 'Home Staging in Granite Bay, CA',
    description:
        'Capital City Staging offers luxury home staging services in Granite Bay, enhancing your property’s elegance to attract high-end buyers.',
    whyStaging:
        'Granite Bay’s prestigious market requires impeccable presentation. Our staging services showcase your home’s luxury and sophistication.',
    services: ['Luxury Home Staging', 'Interior Design and Styling', 'Custom Design Solutions', 'Photography Preparation'],
    contactText: 'Looking to elevate your Granite Bay property?',
};

export const metadata: Metadata = generateLocationMetadata({
    locationName: locationData.locationName,
    pageSlug: locationData.pageSlug,
    description: 'Expert home staging services in Granite Bay, California. Showcase your property’s luxury with Capital City Staging.',
    ogImageUrl: '/favicon/CCS_og_image.png',
});

export default function GraniteBayHomeStaging() {
    return <LocationPageTemplate {...locationData} />;
}
