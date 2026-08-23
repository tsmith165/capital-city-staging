export interface Article {
    id: string;
    title: string;
    description: string;
    imageSrc: string;
    imageWidth: number;
    imageHeight: number;
    url: string;
    datePublished: string;
}

export const articles: Article[] = [
    {
        id: 'understanding-buyer-psychology',
        title: 'Understanding Buyer Psychology in Home Staging',
        description: 'How staging helps buyers picture a future in the home.',
        imageSrc: '/info/understanding-buyer-psychology.jpg',
        imageWidth: 1280,
        imageHeight: 960,
        url: '/info/understanding-buyer-psychology',
        datePublished: '2023-10-22',
    },
    {
        id: 'home-staging-tips',
        title: 'Home Staging Tips and Tricks',
        description: 'Eight practical fixes to make a home feel larger, brighter, and ready to photograph.',
        imageSrc: '/info/home-staging-tips.jpg',
        imageWidth: 720,
        imageHeight: 720,
        url: '/info/home-staging-tips',
        datePublished: '2023-10-22',
    },
    {
        id: 'home-staging-statistics',
        title: 'Home Staging Statistics',
        description: 'Sale-price, time-on-market, and buyer-perception figures behind staging.',
        imageSrc: '/info/home-staging-statistics.jpg',
        imageWidth: 960,
        imageHeight: 609,
        url: '/info/home-staging-statistics',
        datePublished: '2023-10-22',
    },
    {
        id: 'cost-vs-value-analysis',
        title: 'Home Staging Cost vs. Value Analysis',
        description: 'Compare staging cost with price reductions, carrying costs, and sale proceeds.',
        imageSrc: '/info/cost-vs-value-analysis.jpg',
        imageWidth: 750,
        imageHeight: 500,
        url: '/info/cost-vs-value-analysis',
        datePublished: '2023-10-22',
    },
    {
        id: 'benefits-of-home-staging',
        title: 'The Benefits of Home Staging',
        description: 'Six ways staging changes photos, buyer interest, offers, and seller workload.',
        imageSrc: '/info/benefits-of-home-staging.jpg',
        imageWidth: 1280,
        imageHeight: 492,
        url: '/info/benefits-of-home-staging',
        datePublished: '2023-10-22',
    },
];

/**
 * Article pages previously repeated their own title, description, image dimensions and
 * canonical URL inline, which is how the index card and the page itself fell out of sync.
 */
export function getArticle(id: string): Article {
    const article = articles.find((entry) => entry.id === id);
    if (!article) {
        throw new Error(`Unknown article id: ${id}`);
    }
    return article;
}
