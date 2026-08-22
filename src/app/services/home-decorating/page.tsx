import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import ArticleShell from '@/components/content/ArticleShell';
import ContactCallout from '@/components/content/ContactCallout';
import JsonLd from '@/components/seo/JsonLd';
import { serviceSchema, SITE_URL } from '@/lib/structuredData';

const TITLE = 'Expert Home Decoration Services in Sacramento';
const DESCRIPTION =
    'Transform your living space with our expert home decoration services in Sacramento. Capital City Staging brings style and functionality to your home.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords:
        'home decoration Sacramento, Sacramento home decoration, interior design, Capital City Staging, home styling, home decor services, enhance living space',
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
                alt: 'Home Decoration in Sacramento',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
};

export default function HomeDecorationServices() {
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
                title={TITLE}
                lead="Professional decorating that turns your living space into a stylish, functional environment reflecting your own taste."
                image={{ src: '/services/home-decoration.jpg', alt: 'Home Decoration in Sacramento', width: 1280, height: 720 }}
                aside={
                    <ContactCallout
                        heading="Ready to transform your home?"
                        body="Share a few photos and what you have in mind, and we will walk you through the options."
                        action="Schedule a consultation"
                    />
                }
            >
                <h2>Our home decoration services include</h2>
                <ul>
                    <li>Personalized interior design consultations.</li>
                    <li>Space planning and furniture arrangement.</li>
                    <li>Color scheme selection and coordination.</li>
                    <li>Selection of furnishings, artwork, and accessories.</li>
                </ul>

                <h2>Why choose us?</h2>
                <p>
                    With years of experience in home decoration and staging, our team brings a keen eye for detail and a passion for design
                    to every project. We work closely with you to bring your vision to life.
                </p>
            </ArticleShell>
        </PageLayout>
    );
}
