import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
    locationName: 'Rio Linda',
    pageSlug: 'rio-linda',
    imageUrl: '/locations/rio-linda.jpg',
    imageAlt: 'Home Staging in Rio Linda, CA',
    description:
        'Capital City Staging provides top-notch home staging services in Rio Linda, helping your property appeal to a wide range of buyers.',
    whyStaging:
        'In Rio Linda, effective home staging can make a significant difference in how quickly and profitably your home sells. We tailor our services to highlight your property’s strengths.',
    services: ['Vacant and Occupied Home Staging', 'Decorative Enhancements', 'Personalized Staging Plans', 'Photography Preparation'],
    contactText: 'Ready to showcase your Rio Linda home?',
};

export const metadata: Metadata = generateLocationMetadata({
    locationName: locationData.locationName,
    pageSlug: locationData.pageSlug,
    description: 'Expert home staging services in Rio Linda, California. Make your property stand out with Capital City Staging.',
    ogImageUrl: '/favicon/CCS_og_image.png',
});

export default function RioLindaHomeStaging() {
    return <LocationPageTemplate {...locationData} />;
}
