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
            'Empty rooms photograph small and cold. We furnish the whole home so buyers see how each room lives, not just how big it is.',
        bestFor: 'Empty listings, new builds, and homes sellers have moved out of.',
        includedItems: [
            'On-site measurement and a room-by-room plan',
            'Furniture, art and accessories selected for the listing',
            'Full install before photos',
            'Removal after closing',
        ],
    },
    {
        id: 'occupied',
        title: 'Occupied staging',
        href: '/services/occupied-home-staging',
        summary: 'You’re still living there. We work with what you own, clear what’s in the way, and add only what’s missing.',
        bestFor: 'Sellers living in the home while it’s listed.',
        includedItems: [
            'Walkthrough and a written room-by-room plan',
            'A priced plan before anything moves',
            'Rearranging and restyling what you already own',
            'Rental pieces only where they’re needed',
        ],
    },
];
