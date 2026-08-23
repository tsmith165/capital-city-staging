import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import ArticleShell from '@/components/content/ArticleShell';
import ContactCallout from '@/components/content/ContactCallout';
import JsonLd from '@/components/seo/JsonLd';
import { articleSchema } from '@/lib/structuredData';
import { getArticle } from '@/app/info/articles_spec';
import { articleMetadata } from '@/app/info/article.metadata';

const article = getArticle('home-staging-tips');

export const metadata: Metadata = articleMetadata(
    article,
    'home staging tips, staging tricks, sell home faster, increase home value, DIY staging, Capital City Staging, real estate advice',
);

export default function HomeStagingTips() {
    return (
        <PageLayout page="home-staging-tips">
            <JsonLd data={articleSchema({ headline: article.title, description: article.description, path: article.url })} />
            <ArticleShell
                eyebrow="Resources"
                title={article.title}
                lead="Eight things you can do before a professional ever walks through the door."
                image={{
                    src: article.imageSrc,
                    alt: 'A tidy, decluttered room prepared for listing photos',
                    width: article.imageWidth,
                    height: article.imageHeight,
                }}
                aside={<ContactCallout heading="Want Mia's room-by-room plan?" body="Get a staging range for your property." />}
            >
                <h3>1. Declutter your space</h3>
                <p>
                    Remove unnecessary items to create a sense of space. A clutter-free home appears larger and lets buyers focus on the
                    property&rsquo;s features.
                </p>

                <h3>2. Depersonalize the home</h3>
                <p>
                    Take down personal photographs and mementos. This helps buyers envision themselves living in the space, which increases
                    their emotional connection to the property.
                </p>

                <h3>3. Make minor repairs</h3>
                <p>
                    Fix leaky faucets, squeaky doors, and chipped paint. Small repairs significantly improve the overall impression of your
                    home.
                </p>

                <h3>4. Enhance curb appeal</h3>
                <p>
                    Mow the lawn, trim hedges, and consider adding potted plants near the entrance to make your home inviting from the
                    outside.
                </p>

                <h3>5. Optimize lighting</h3>
                <p>
                    Open curtains and blinds to let in natural light. Make sure all bulbs work, and consider higher wattage bulbs to
                    brighten rooms.
                </p>

                <h3>6. Neutralize color schemes</h3>
                <p>
                    Use neutral colors for walls and decor to appeal to a broader range of buyers. Neutral tones create a blank canvas for
                    buyers to imagine their own style.
                </p>

                <h3>7. Arrange furniture strategically</h3>
                <p>
                    Position furniture to highlight the flow of the room and create cozy conversation areas. Avoid blocking windows or
                    natural pathways.
                </p>

                <h3>8. Keep it clean</h3>
                <p>
                    A spotless home signals that the property has been well maintained. Pay attention to details like clean windows,
                    dust-free surfaces, and fresh-smelling air.
                </p>
            </ArticleShell>
        </PageLayout>
    );
}
