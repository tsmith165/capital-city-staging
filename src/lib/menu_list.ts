export const navbar_menu_list: [string, string][] = [
    ['portfolio', 'Portfolio'],
    ['where', 'Where'],
    ['services', 'Services'],
    // ['about', 'About'],
    ['contact', 'Contact'],
];

export const menu_list: [string, string, string][] = [
    ['portfolio', 'Portfolio', '/?component=portfolio'],
    ['where', 'Where', '/?component=portfolio'],
    ['services', 'Services', '/?component=portfolio'],
    // ['about', 'About', '/?component=portfolio'],
    ['contact', 'Contact', '/contact'],
];

export const admin_menu_list: [string, string, string][] = [
    ['portfolio', 'Portfolio', '/?component=portfolio'],
    ['where', 'Where', '/?component=portfolio'],
    ['services', 'Services', '/?component=portfolio'],
    ['contact', 'Contact', '/contact'],
    ['inventory', 'Inventory', '/admin/inventory'],
    ['manage', 'Manage', '/admin/manage'],
    ['edit', 'Edit', '/admin/edit/images/3'],
];

export default { navbar_menu_list, menu_list, admin_menu_list };
