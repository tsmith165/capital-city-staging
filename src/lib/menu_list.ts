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

export const admin_menu_list: MenuItem[] = [
    ...menu_list,
    {
        id: 'projects',
        label: 'Projects',
        url: '/admin/projects',
        subMenu: [
            { id: 'all-projects', label: 'All Projects', url: '/admin/projects' },
            { id: 'new-project', label: 'New Project', url: '/admin/projects/new' },
            { id: 'edit-project', label: 'Edit Project', url: '/admin/projects/edit' },
        ],
    },
    {
        id: 'inventory',
        label: 'Inventory',
        url: '/admin/inventory',
        subMenu: [
            { id: 'all-inventory', label: 'All Inventory', url: '/admin/inventory' },
            { id: 'edit-details', label: 'Edit Details', url: '/admin/inventory/edit' },
        ],
    },
    { id: 'users', label: 'Users', url: '/admin/users' },
    { id: 'manage', label: 'Manage', url: '/admin/manage' },
];

export default { navbar_menu_list, menu_list, admin_menu_list };
