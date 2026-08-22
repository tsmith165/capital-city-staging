import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import ArticleShell from '@/components/content/ArticleShell';
import ContactCallout from '@/components/content/ContactCallout';
import JsonLd from '@/components/seo/JsonLd';
import { serviceSchema, SITE_URL } from '@/lib/structuredData';

const TITLE = 'Vacant Home Staging in Sacramento';
const HEADING = 'Vacant staging';
const DESCRIPTION =
    'Vacant home staging across Sacramento, Placer and Yolo counties. Mia Dofflemyer furnishes empty listings so they photograph well and sell faster.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords:
        'home staging Sacramento, Sacramento home staging, vacant home staging, professional home staging, Capital City Staging, sell home fast, attract buyers, real estate staging',
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
                title={HEADING}
                lead="Empty rooms photograph small and cold. We furnish the whole home so buyers see how each room lives, not just how big it is."
                image={{ src: '/services/home-staging.jpg', alt: 'Home Staging in Sacramento', width: 1280, height: 721 }}
                aside={
                    <ContactCallout
                        heading="Ready to list?"
                        body="Tell us about the listing and you’ll get a price range right away."
                        action="Get a free quote"
                    />
                }
            >
                <h2>Who this is for</h2>
                <p>
                    Empty listings, new builds, and homes the sellers have moved out of. If a buyer is going to walk through
                    bare rooms, or scroll past photographs of them, this is the service you want.
                </p>

                <h2>How it works</h2>
                <ol>
                    <li>
                        <strong>Walkthrough.</strong> Mia measures the rooms on site and asks what the listing is competing
                        against.
                    </li>
                    <li>
                        <strong>Plan and price.</strong> You get a room-by-room plan with the cost attached, before anything is
                        rented or moved.
                    </li>
                    <li>
                        <strong>Install.</strong> Furniture, art and accessories go in ahead of the photography date, not after
                        it.
                    </li>
                    <li>
                        <strong>Removal.</strong> Everything comes back out once the home closes.
                    </li>
                </ol>

                <h2>What it changes</h2>
                <ul>
                    <li>Rooms read at their real scale instead of looking undersized.</li>
                    <li>Every space has an obvious use, so nothing gets written off as wasted square footage.</li>
                    <li>The listing photographs like a home rather than a floor plan.</li>
                </ul>

                <h2>Who you&rsquo;ll be working with</h2>
                <p>
                    Mia Dofflemyer, directly. She is a RESA-certified stager and has been a licensed California real estate
                    agent since 2020. There is no account manager and no handoff between the walkthrough and the pickup.
                </p>
            </ArticleShell>
        </PageLayout>
    );
}
