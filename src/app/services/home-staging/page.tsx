import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import ArticleShell from '@/components/content/ArticleShell';
import ContactCallout from '@/components/content/ContactCallout';
import JsonLd from '@/components/seo/JsonLd';
import { serviceSchema, SITE_URL } from '@/lib/structuredData';

const TITLE = 'Professional Home Staging Services in Sacramento';
const DESCRIPTION =
    'Enhance your Sacramento property with our professional home staging services. Attract more buyers and sell faster with Capital City Staging.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords:
        'home staging Sacramento, Sacramento home staging, professional home staging, Capital City Staging, sell home fast, attract buyers, real estate staging',
    alternates: { canonical: `${SITE_URL}/services/home-staging` },
    openGraph: {
        title: `${TITLE} | Capital City Staging`,
        description: DESCRIPTION,
        url: `${SITE_URL}/services/home-staging`,
        images: [
            {
                url: '/favicon/CCS_og_image.png',
                width: 1200,
                height: 630,
                alt: 'Home Staging in Sacramento',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
};

export default function HomeStagingServices() {
    return (
        <PageLayout page="home-staging">
            <JsonLd
                data={serviceSchema({
                    name: TITLE,
                    description: DESCRIPTION,
                    image: `${SITE_URL}/services/home-staging.jpg`,
                })}
            />
            <ArticleShell
                eyebrow="Our services"
                title={TITLE}
                lead="We transform homes to attract buyers and sell faster, creating beautiful, functional spaces that highlight your property's best features."
                image={{ src: '/services/home-staging.jpg', alt: 'Home Staging in Sacramento', width: 1280, height: 721 }}
                aside={
                    <ContactCallout
                        heading="Ready to make your property stand out?"
                        body="Tell us about your listing and we will put together a staging plan and quote."
                        action="Get a free consultation"
                    />
                }
            >
                <h2>Why choose our home staging services?</h2>
                <ul>
                    <li>Increase the perceived value of your home.</li>
                    <li>Make a strong first impression on potential buyers.</li>
                    <li>Highlight the best features of your property.</li>
                    <li>Sell your home faster and for a higher price.</li>
                </ul>

                <h2>Our home staging process</h2>
                <ol>
                    <li>
                        <strong>Consultation.</strong> We assess your property and discuss your goals.
                    </li>
                    <li>
                        <strong>Design plan.</strong> Our team creates a customized staging plan.
                    </li>
                    <li>
                        <strong>Implementation.</strong> We stage your home using high-quality furnishings and decor.
                    </li>
                    <li>
                        <strong>Review.</strong> A final walkthrough to make sure everything is right.
                    </li>
                </ol>
            </ArticleShell>
        </PageLayout>
    );
}
