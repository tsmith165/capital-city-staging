export interface NavItem {
    id: string;
    label: string;
    href: string;
    /** Homepage sections scroll in place when you are already on the homepage. */
    section?: string;
    children?: NavItem[];
}

/**
 * One source for the header, the mobile panel and the footer. The site previously kept three
 * overlapping lists: a tuple array for the navbar, a nested list for the dropdown menu, and a
 * separate admin copy that had already drifted from the real admin routes.
 */
export const PRIMARY_NAV: NavItem[] = [
    { id: 'portfolio', label: 'Portfolio', href: '/?component=portfolio', section: 'portfolio' },
    { id: 'where', label: 'Where We Work', href: '/?component=where', section: 'where' },
    { id: 'services', label: 'Services', href: '/?component=services', section: 'services' },
    {
        id: 'info',
        label: 'Articles',
        href: '/info',
        children: [
            { id: 'staging-tips', label: 'Staging Tips', href: '/info/home-staging-tips' },
            { id: 'statistics', label: 'Statistics', href: '/info/home-staging-statistics' },
            { id: 'buyer-psychology', label: 'Buyer Psychology', href: '/info/understanding-buyer-psychology' },
            { id: 'cost-analysis', label: 'Cost vs. Value', href: '/info/cost-vs-value-analysis' },
            { id: 'staging-benefits', label: 'Staging Benefits', href: '/info/benefits-of-home-staging' },
        ],
    },
];

export const PRIMARY_CTA = { label: 'Get a Quote', href: '/contact' } as const;

export const CONTACT_DETAILS = {
    phone: '(209) 817-4240',
    phoneHref: 'tel:+12098174240',
    email: 'mdofflemyer.realestate@gmail.com',
} as const;
