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
        description:
            "Learn how buyer psychology influences home staging strategies. Discover techniques to appeal to buyers' emotions and increase your property's marketability.",
        imageSrc: '/info/understanding-buyer-psychology.jpg',
        imageWidth: 1280,
        imageHeight: 960,
        url: '/info/understanding-buyer-psychology',
        datePublished: '2023-10-22',
    },
    {
        id: 'home-staging-tips',
        title: 'Home Staging Tips and Tricks',
        description:
            'Discover expert tips and tricks for staging your home to sell faster and for a higher price. Learn from the professionals at Capital City Staging.',
        imageSrc: '/info/home-staging-tips.jpg',
        imageWidth: 720,
        imageHeight: 720,
        url: '/info/home-staging-tips',
        datePublished: '2023-10-22',
    },
    {
        id: 'home-staging-statistics',
        title: 'Home Staging Statistics',
        description:
            'Explore key statistics that demonstrate the effectiveness of home staging. Learn how staging influences sale price, time on market, and buyer perceptions.',
        imageSrc: '/info/home-staging-statistics.jpg',
        imageWidth: 960,
        imageHeight: 609,
        url: '/info/home-staging-statistics',
        datePublished: '2023-10-22',
    },
    {
        id: 'cost-vs-value-analysis',
        title: 'Home Staging Cost vs. Value Analysis',
        description:
            'Understand the return on investment for home staging. Learn how staging costs compare to the increased value and faster sale of your property.',
        imageSrc: '/info/cost-vs-value-analysis.jpg',
        imageWidth: 750,
        imageHeight: 500,
        url: '/info/cost-vs-value-analysis',
        datePublished: '2023-10-22',
    },
    {
        id: 'benefits-of-home-staging',
        title: 'The Benefits of Home Staging',
        description:
            'Discover how professional home staging can help sell your property faster and for a higher price. Learn the key benefits with Capital City Staging.',
        imageSrc: '/info/benefits-of-home-staging.jpg',
        imageWidth: 1280,
        imageHeight: 492,
        url: '/info/benefits-of-home-staging',
        datePublished: '2023-10-22',
    },
];
