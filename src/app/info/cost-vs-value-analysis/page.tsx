import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import ArticleShell from '@/components/content/ArticleShell';
import ContactCallout from '@/components/content/ContactCallout';
import JsonLd from '@/components/seo/JsonLd';
import { articleSchema } from '@/lib/structuredData';
import { getArticle } from '@/app/info/articles_spec';
import { articleMetadata } from '@/app/info/article.metadata';

const article = getArticle('cost-vs-value-analysis');

export const metadata: Metadata = articleMetadata(
    article,
    'home staging cost, staging ROI, value analysis, Capital City Staging, sell home faster, increase home value, real estate investment',
);

export default function CostVsValueAnalysis() {
    return (
        <PageLayout page="cost-vs-value-analysis">
            <JsonLd data={articleSchema({ headline: article.title, description: article.description, path: article.url })} />
            <ArticleShell
                eyebrow="Resources"
                title={article.title}
                lead="Staging is an expense on the front end and a return on the back end. Here is how the two compare."
                image={{
                    src: article.imageSrc,
                    alt: 'A staged home used to illustrate the return on investment of staging',
                    width: article.imageWidth,
                    height: article.imageHeight,
                }}
                aside={<ContactCallout heading="Price your property" body="See a staging range before you commit to a walkthrough." />}
            >
                <h2>The financial impact of home staging</h2>
                <p>
                    Staging is an investment rather than an expense. National surveys put staged homes at 6 to 20% above non-staged
                    comparables and 73% less time on the market, and those two factors together generally offset the initial cost. Both
                    figures are survey averages, so treat them as a reason to run the numbers on your own listing rather than a promise
                    about it.
                </p>

                <h2>Breakdown of staging costs</h2>
                <p>
                    Cost varies with the size of your home, the amount of work needed, and how long the home will be listed. Typical items:
                </p>
                <ul>
                    <li>Initial consultation fee</li>
                    <li>Design and planning</li>
                    <li>Furniture and decor rental</li>
                    <li>Staging implementation</li>
                    <li>Monthly maintenance, if applicable</li>
                </ul>

                <h2>Potential returns on investment</h2>
                <p>A worked example:</p>
                <ul>
                    <li>
                        <strong>Without staging.</strong> Home listed at $500,000. After several months on the market, the price is reduced
                        to $480,000 to attract buyers.
                    </li>
                    <li>
                        <strong>With staging.</strong> Initial staging cost is $3,000. The home sells within a few weeks at $510,000.
                    </li>
                </ul>
                <p>
                    Staging not only prevented a price reduction but produced a higher sale price, a net gain of $27,000 after subtracting
                    the staging cost.
                </p>

                <h2>Time savings equals money saved</h2>
                <p>
                    Every day your home sits on the market costs you money in mortgage payments, utilities, and maintenance. Selling faster
                    reduces those carrying costs.
                </p>

                <h2>Avoiding price reductions</h2>
                <p>
                    Homes that linger on the market often face price reductions, and buyers perceive a long-listed home as less desirable.
                    Staging helps you avoid that by generating interest quickly.
                </p>
            </ArticleShell>
        </PageLayout>
    );
}
