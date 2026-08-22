import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import ArticleShell from '@/components/content/ArticleShell';
import ContactCallout from '@/components/content/ContactCallout';
import JsonLd from '@/components/seo/JsonLd';
import { articleSchema } from '@/lib/structuredData';
import { getArticle } from '@/app/info/articles_spec';
import { articleMetadata } from '@/app/info/article.metadata';

const article = getArticle('benefits-of-home-staging');

export const metadata: Metadata = articleMetadata(
    article,
    'benefits of home staging, home staging advantages, sell home faster, increase home value, Capital City Staging, real estate staging, home staging tips',
);

export default function BenefitsOfHomeStaging() {
    return (
        <PageLayout page="benefits-of-home-staging">
            <JsonLd data={articleSchema({ headline: article.title, description: article.description, path: article.url })} />
            <ArticleShell
                eyebrow="Resources"
                title={article.title}
                lead="First impressions decide a sale. Staging is the tool that makes a property stand out in a competitive market."
                image={{
                    src: article.imageSrc,
                    alt: 'A staged living room arranged to show off natural light and open space',
                    width: article.imageWidth,
                    height: article.imageHeight,
                }}
                aside={
                    <ContactCallout
                        heading="Ready to experience the benefits?"
                        body="Book a consultation and take the first step toward selling faster and for a higher price."
                    />
                }
            >
                <p>
                    Selling a home is a significant undertaking, and first impressions are crucial. Professional home staging is a powerful
                    tool that can make your property more appealing to potential buyers. At Capital City Staging, we help you showcase your
                    home&rsquo;s best features, ensuring it stands out in the competitive real estate market.
                </p>

                <h2>Key benefits of home staging</h2>

                <h3>1. Sell your home faster</h3>
                <p>
                    Staged homes often sell faster than non-staged homes. By creating a welcoming and attractive environment, buyers can
                    more easily envision themselves living in the space, which can expedite the decision-making process.
                </p>

                <h3>2. Increase your home&rsquo;s value</h3>
                <p>
                    Professionally staged homes can command higher offers. By highlighting your home&rsquo;s strengths and minimizing any
                    shortcomings, staging can increase perceived value, leading to better sale prices.
                </p>

                <h3>3. Stand out in listings</h3>
                <p>
                    Most buyers start their search online. High-quality photos of a beautifully staged home make your listing more
                    attractive, increasing traffic and interest.
                </p>

                <h3>4. Appeal to a wider audience</h3>
                <p>
                    Home staging helps neutralize your space, making it easier for a diverse range of buyers to imagine themselves living
                    there. That broader appeal can lead to more offers.
                </p>

                <h3>5. Highlight key features</h3>
                <p>
                    A professional stager knows how to draw attention to your home&rsquo;s best features, such as architectural details,
                    spacious layouts, or natural lighting.
                </p>

                <h3>6. Reduce stress</h3>
                <p>
                    Selling a home is stressful. By entrusting the staging process to professionals, you can focus on the rest of the move,
                    confident that your home is being presented at its best.
                </p>

                <h2>Why choose Capital City Staging?</h2>
                <p>
                    You work with Mia Dofflemyer directly. She is a RESA-certified stager and a licensed California real estate
                    agent, so the plan for your home is built on what is actually selling in your market, not on a generic look.
                </p>
            </ArticleShell>
        </PageLayout>
    );
}
