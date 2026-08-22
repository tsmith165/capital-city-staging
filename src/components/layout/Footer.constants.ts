/** Mirrors the /locations routes. Each entry must have a matching page. */
export const SERVICE_AREAS: readonly { slug: string; name: string }[] = [
    { slug: 'sacramento', name: 'Sacramento' },
    { slug: 'west-sacramento', name: 'West Sacramento' },
    { slug: 'rancho-cordova', name: 'Rancho Cordova' },
    { slug: 'carmichael', name: 'Carmichael' },
    { slug: 'rio-linda', name: 'Rio Linda' },
    { slug: 'north-highlands', name: 'North Highlands' },
    { slug: 'antelope', name: 'Antelope' },
    { slug: 'citrus-heights', name: 'Citrus Heights' },
    { slug: 'gold-river', name: 'Gold River' },
    { slug: 'fair-oaks', name: 'Fair Oaks' },
    { slug: 'orangevale', name: 'Orangevale' },
    { slug: 'folsom', name: 'Folsom' },
    { slug: 'granite-bay', name: 'Granite Bay' },
    { slug: 'roseville', name: 'Roseville' },
    { slug: 'rocklin', name: 'Rocklin' },
    { slug: 'loomis', name: 'Loomis' },
] as const;
