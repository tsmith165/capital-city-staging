interface SitemapEntry {
    url: string;
    lastModified: Date;
    changeFrequency: 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'always';
    priority: number;
}

export default function sitemap(): SitemapEntry[] {
    return [
        {
            url: 'https://www.capitalcitystaging.com',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: 'https://www.capitalcitystaging.com/contact',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },

        // Services pages
        {
            url: 'https://www.capitalcitystaging.com/services/home-staging',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: 'https://www.capitalcitystaging.com/services/home-decorating',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },

        // Location pages
        {
            url: 'https://www.capitalcitystaging.com/locations/west-sacramento',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/sacramento',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/roseville',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/rocklin',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/rio-linda',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/rancho-cordova',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/orangevale',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/north-highlands',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/loomis',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/granite-bay',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/gold-river',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/folsom',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/fair-oaks',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/citrus-heights',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/carmichael',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.capitalcitystaging.com/locations/antelope',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },

        // Info pages
        {
            url: 'https://www.capitalcitystaging.com/info',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://www.capitalcitystaging.com/info/understanding-buyer-psychology',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://www.capitalcitystaging.com/info/home-staging-tips',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://www.capitalcitystaging.com/info/home-staging-statistics',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://www.capitalcitystaging.com/info/cost-vs-value-analysis',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://www.capitalcitystaging.com/info/benefits-of-home-staging',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];
}
