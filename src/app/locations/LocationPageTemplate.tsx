import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';
import Link from 'next/link';

const SERVICED_CITIES = [
    'Sacramento',
    'West Sacramento',
    'Roseville',
    'Rocklin',
    'Rio Linda',
    'Rancho Cordova',
    'Orangevale',
    'North Highlands',
    'Loomis',
    'Granite Bay',
    'Gold River',
    'Folsom',
    'Fair Oaks',
    'Citrus Heights',
    'Carmichael',
    'Antelope',
];

interface LocationPageProps {
    locationName: string;
    pageSlug: string;
    imageUrl: string;
    imageAlt: string;
    description: string;
    whyStaging: string;
    services: string[];
    contactText: string;
}

export default function LocationPageTemplate({
    locationName,
    pageSlug,
    imageUrl,
    imageAlt,
    description,
    whyStaging,
    services,
    contactText,
}: LocationPageProps) {
    const serviceAreaSlug = (city: string) => city.toLowerCase().replace(/\s+/g, '-');

    return (
        <PageLayout page={pageSlug}>
            <div className="flex h-fit w-full flex-col items-center space-y-8 bg-stone-900 px-8 py-16">
                <h1 className="bg-clip-text text-center text-4xl font-bold text-transparent gradient-gold-main">
                    Professional Home Staging in {locationName}, CA
                </h1>
                <div className="relative h-64 w-full max-w-4xl sm:h-72 md:h-96">
                    <Image src={imageUrl} alt={imageAlt} fill className="rounded-md object-cover" />
                </div>
                <p className="max-w-3xl text-center text-lg text-stone-300">{description}</p>
                <div className="flex max-w-4xl flex-col space-y-6 px-8">
                    <h2 className="text-2xl font-semibold text-primary">Why Home Staging in {locationName}?</h2>
                    <p className="text-stone-300">{whyStaging}</p>
                    <h2 className="text-2xl font-semibold text-primary">Our {locationName} Services Include:</h2>
                    <ul className="list-inside list-disc space-y-2 text-stone-300">
                        {services.map((service, index) => (
                            <li key={index} className="text-stone-300">
                                {service}
                            </li>
                        ))}
                    </ul>
                    <h2 className="text-2xl font-semibold text-primary">Contact Us</h2>
                    <p className="text-stone-300">
                        {contactText}{' '}
                        <a href="/contact" className="text-secondary hover:underline">
                            Contact us
                        </a>{' '}
                        today to schedule a consultation.
                    </p>

                    <div className="mt-12 border-t border-stone-700 pt-8">
                        <h2 className="mb-4 text-2xl font-semibold text-primary">Our Service Areas</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {SERVICED_CITIES.map((city) => (
                                <Link
                                    key={city}
                                    href={`/locations/${serviceAreaSlug(city)}`}
                                    className={`text-stone-300 transition-colors hover:text-secondary ${
                                        city === locationName ? 'font-semibold text-secondary' : ''
                                    }`}
                                >
                                    {city}, CA
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
