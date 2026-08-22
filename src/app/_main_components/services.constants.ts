export interface ServiceSpec {
    id: 'vacant' | 'occupied';
    title: string;
    href: string;
    summary: string;
    bestFor: string;
    includedItems: string[];
}

export const SERVICES: ServiceSpec[] = [
    {
        id: 'vacant',
        title: 'Vacant staging',
        href: '/services/home-staging',
        summary:
            'An empty house photographs as a set of dimensions. We furnish it so buyers can read the scale of each room and picture living in it.',
        bestFor: 'Empty listings, new builds, and homes the sellers have already moved out of.',
        includedItems: [
            'On-site measurement and a room-by-room plan',
            'Furniture, art and accessories selected for the listing',
            'Full install before the photography date',
            'Collection once the home closes',
        ],
    },
    {
        id: 'occupied',
        title: 'Occupied staging',
        href: '/services/home-decorating',
        summary:
            'You are still living there. We work with the furniture you own, edit what is in the way, and add only what the rooms are missing.',
        bestFor: 'Sellers staying in the home through the listing period.',
        includedItems: [
            'Walkthrough and a written room-by-room brief',
            'A plan costed to your budget before anything moves',
            'Editing, rearranging and restyling what you already own',
            'Targeted rental pieces only where they earn their place',
        ],
    },
];
