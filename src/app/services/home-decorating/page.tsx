import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import ArticleShell from '@/components/content/ArticleShell';
import ContactCallout from '@/components/content/ContactCallout';
import JsonLd from '@/components/seo/JsonLd';
import { serviceSchema, SITE_URL } from '@/lib/structuredData';

/*
 * This page keeps the /services/home-decorating URL it has always had, but the content is
 * occupied staging. It used to describe decorating a home you intend to keep living in, which is
 * not a service the business sells and not what the "Occupied staging" card links here for.
 */
const TITLE = 'Occupied Home Staging in Sacramento';
const HEADING = 'Occupied staging';
const DESCRIPTION =
    'Occupied home staging and decorating across Sacramento, Placer and Yolo counties. Mia Dofflemyer restyles the home you are still living in so it is ready to list.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords:
        'occupied home staging Sacramento, home decorating Sacramento, Sacramento home staging, home styling, Capital City Staging, staging while living at home, real estate staging',
    alternates: { canonical: `${SITE_URL}/services/home-decorating` },
    openGraph: {
        title: `${TITLE} | Capital City Staging`,
        description: DESCRIPTION,
        url: `${SITE_URL}/services/home-decorating`,
        images: [
            {
                url: '/favicon/CCS_og_image.png',
                width: 1200,
                height: 630,
                alt: 'Occupied Home Staging in Sacramento',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
};

export default function OccupiedStagingServices() {
    return (
        <PageLayout page="home-decoration">
            <JsonLd
                data={serviceSchema({
                    name: TITLE,
                    description: DESCRIPTION,
                    image: `${SITE_URL}/services/home-decoration.jpg`,
                })}
            />
            <ArticleShell
                eyebrow="Our services"
                title={HEADING}
                lead="You’re still living there. We work with what you own, clear what’s in the way, and add only what’s missing."
                image={{
                    src: '/services/home-decoration.jpg',
                    alt: 'Occupied Home Staging in Sacramento',
                    width: 1280,
                    height: 720,
                }}
                aside={
                    <ContactCallout
                        heading="Still living in the home?"
                        body="Tell us about the property and you’ll get a price range right away."
                        action="Get a free quote"
                    />
                }
            >
                <h2>Who this is for</h2>
                <p>
                    Sellers living in the home while it&rsquo;s listed. You keep using the house, so the plan has to survive daily life
                    &mdash; and it has to work around what you already own.
                </p>

                <h2>How it works</h2>
                <ol>
                    <li>
                        <strong>Walkthrough.</strong> Mia goes room by room and writes down what stays, what moves, and what is missing.
                    </li>
                    <li>
                        <strong>Plan and price.</strong> You get that plan priced to your budget before anything moves.
                    </li>
                    <li>
                        <strong>Restyle.</strong> Rearranging and restyling what you own, with rental pieces only where they are needed.
                    </li>
                    <li>
                        <strong>Photo day.</strong> A final pass so the rooms are right before the camera arrives.
                    </li>
                </ol>

                <h2>What it changes</h2>
                <ul>
                    <li>Rooms stop reading as somebody else&rsquo;s house and start reading as available space.</li>
                    <li>Furniture is placed for the camera and for a walkthrough, which are not the same thing.</li>
                    <li>You spend on the few pieces that move the listing rather than furnishing a home you are leaving.</li>
                </ul>

                <h2>Who you&rsquo;ll be working with</h2>
                <p>
                    Mia Dofflemyer, directly. She is a RESA-certified stager and has been a licensed California real estate agent since
                    2020. There is no account manager and no handoff.
                </p>
            </ArticleShell>
        </PageLayout>
    );
}
