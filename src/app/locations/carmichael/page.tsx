import React from 'react';
import type { Metadata } from 'next';
import LocationPageTemplate from '../LocationPageTemplate';
import { generateLocationMetadata } from '@/utils/generateLocationMetadata';

const locationData = {
    locationName: 'Carmichael',
    pageSlug: 'carmichael',
    imageUrl: '/locations/carmichael.jpg',
    imageAlt: 'Home Staging in Carmichael, CA',
    description:
        'Capital City Staging offers professional home staging services in Carmichael, enhancing your property’s appeal to attract more buyers.',
    whyStaging:
        "Carmichael's charming neighborhoods benefit from staging that showcases each home's unique character. Our services help your property stand out.",
    services: ['Comprehensive Home Staging', 'Interior Decoration', 'Design Consultations', 'Staging for Luxury Homes'],
    contactText: 'Interested in staging your Carmichael home?',
};

export const metadata: Metadata = generateLocationMetadata({
    locationName: locationData.locationName,
    pageSlug: locationData.pageSlug,
    description:
        'Professional home staging services in Carmichael, California. Enhance your property’s marketability with Capital City Staging.',
    ogImageUrl: '/favicon/CCS_og_image.png',
});

export default function CarmichaelHomeStaging() {
    return <LocationPageTemplate {...locationData} />;
}
