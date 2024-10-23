import type { Metadata } from 'next';

interface LocationData {
  locationName: string;
  pageSlug: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  keywords?: string;
}

export function generateLocationMetadata(locationData: LocationData): Metadata {
  const {
    locationName,
    pageSlug,
    description,
    keywords = `home staging ${locationName}, ${locationName} home staging, Capital City Staging, home staging sacramento, home staging sacramento ca, staging services ${locationName}, sell home ${locationName}, real estate staging ${locationName}`,
    imageUrl,
    imageAlt,
  } = locationData;

  return {
    title: `Home Staging Services in ${locationName}, CA | Capital City Staging`,
    description,
    keywords,
    openGraph: {
      title: `Home Staging Services in ${locationName}, CA | Capital City Staging`,
      description,
      url: `https://www.capitalcitystaging.com/locations/${pageSlug}`,
      images: [
        {
          url: `https://www.capitalcitystaging.com${imageUrl}`,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
  };
}
