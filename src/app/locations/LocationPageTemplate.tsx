import React from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import ArticleShell from '@/components/content/ArticleShell';
import ContactCallout from '@/components/content/ContactCallout';
import JsonLd from '@/components/seo/JsonLd';
import { serviceSchema, SITE_URL } from '@/lib/structuredData';
import { SERVICE_AREAS } from '@/components/layout/Footer.constants';

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
    return (
        <PageLayout page={pageSlug}>
            <JsonLd
                data={serviceSchema({
                    name: `Home Staging in ${locationName}, CA`,
                    description,
                    image: `${SITE_URL}${imageUrl}`,
                    areaName: `${locationName}, CA`,
                })}
            />
            <ArticleShell
                eyebrow="Service area"
                title={`Professional Home Staging in ${locationName}, CA`}
                lead={description}
                image={{ src: imageUrl, alt: imageAlt, width: 1280, height: 720 }}
                aside={
                    <div className="space-y-12">
                        <ContactCallout heading={`Staging in ${locationName}`} body={contactText} />
                        <nav aria-label="Other service areas" className="border-t border-line pt-8">
                            <h2 className="font-display text-xl font-semibold text-gold-300">Our service areas</h2>
                            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                                {SERVICE_AREAS.map(({ slug, name }) => {
                                    const isCurrent = name === locationName;
                                    return (
                                        <li key={slug}>
                                            <Link
                                                href={`/locations/${slug}`}
                                                aria-current={isCurrent ? 'page' : undefined}
                                                className={
                                                    isCurrent
                                                        ? 'text-sm font-semibold text-gold-300'
                                                        : 'text-sm text-body-muted transition-colors hover:text-gold-300'
                                                }
                                            >
                                                {name}, CA
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>
                }
            >
                <h2>Why home staging in {locationName}?</h2>
                <p>{whyStaging}</p>

                <h2>Our {locationName} services include</h2>
                <ul>
                    {services.map((service) => (
                        <li key={service}>{service}</li>
                    ))}
                </ul>
            </ArticleShell>
        </PageLayout>
    );
}
