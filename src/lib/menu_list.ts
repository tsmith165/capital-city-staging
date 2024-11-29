export interface MenuItem {
    id: string;
    label: string;
    url: string;
    subMenu?: MenuItem[];
}

export const navbar_menu_list: [string, string][] = [
    ['portfolio', 'Portfolio'],
    ['where', 'Where'],
    ['services', 'Services'],
    ['contact', 'Contact'],
];

export const menu_list: MenuItem[] = [
    { id: 'portfolio', label: 'Portfolio', url: '/?component=portfolio' },
    { id: 'where', label: 'Where', url: '/?component=where' },
    { id: 'services', label: 'Services', url: '/?component=services' },
    { id: 'contact', label: 'Contact', url: '/contact' },
    {
        id: 'info',
        label: 'Resources',
        url: '/info',
        subMenu: [
            { id: 'staging-tips', label: 'Staging Tips', url: '/info/home-staging-tips' },
            { id: 'statistics', label: 'Statistics', url: '/info/home-staging-statistics' },
            { id: 'buyer-psychology', label: 'Buyer Psychology', url: '/info/understanding-buyer-psychology' },
            { id: 'cost-analysis', label: 'Cost Analysis', url: '/info/cost-vs-value-analysis' },
        ],
    },
];

export const admin_menu_list: MenuItem[] = [
    ...menu_list,
    { id: 'inventory', label: 'Inventory', url: '/admin/inventory' },
    { id: 'manage', label: 'Manage', url: '/admin/manage' },
    { id: 'edit', label: 'Edit', url: '/admin/edit' },
];

export default { navbar_menu_list, menu_list, admin_menu_list };
