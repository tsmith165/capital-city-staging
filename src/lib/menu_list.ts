export interface MenuItem {
    id: string;
    label: string;
    url: string;
    subMenu?: MenuItem[];
}

/**
 * Sections of the homepage. These scroll in place when you are already on the homepage and
 * navigate to it otherwise, so each one keeps a real href for crawlers and middle-click.
 */
export const navbar_menu_list: [string, string][] = [
    ['portfolio', 'Portfolio'],
    ['where', 'Where'],
    ['services', 'Services'],
    ['contact', 'Contact'],
];

export const menu_list: MenuItem[] = [
    { id: 'portfolio', label: 'Portfolio', url: '/?component=portfolio' },
    { id: 'where', label: 'Where We Work', url: '/?component=where' },
    { id: 'services', label: 'Services', url: '/?component=services' },
    { id: 'contact', label: 'Get a Quote', url: '/contact' },
    {
        id: 'info',
        label: 'Articles',
        url: '/info',
        subMenu: [
            { id: 'staging-tips', label: 'Staging Tips', url: '/info/home-staging-tips' },
            { id: 'statistics', label: 'Statistics', url: '/info/home-staging-statistics' },
            { id: 'buyer-psychology', label: 'Buyer Psychology', url: '/info/understanding-buyer-psychology' },
            { id: 'cost-analysis', label: 'Cost Analysis', url: '/info/cost-vs-value-analysis' },
            { id: 'staging-benefits', label: 'Staging Benefits', url: '/info/benefits-of-home-staging' },
        ],
    },
];

/**
 * The admin console carries its own navigation, so the public menu only needs a way in.
 * This list previously restated every admin route and had already drifted from the real ones.
 */
export const admin_menu_list: MenuItem[] = [...menu_list, { id: 'admin', label: 'Admin Console', url: '/admin' }];
