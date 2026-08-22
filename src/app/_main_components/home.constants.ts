export const HERO_PROOF = [
    { value: '73%', label: 'less time on market' },
    { value: '6-20%', label: 'higher sale price' },
    { value: 'RESA', label: 'certified stager' },
] as const;

export const HERO_FALLBACK_IMAGES = [
    { src: '/portfolio/stock/staging-stock-3.jpg', width: 2560, height: 1695 },
    { src: '/portfolio/stock/staging-stock-7.jpg', width: 564, height: 705 },
    { src: '/portfolio/stock/staging-stock-1.png', width: 2048, height: 1366 },
    { src: '/portfolio/stock/staging-stock-4.png', width: 828, height: 984 },
    { src: '/portfolio/stock/staging-stock-6.jpg', width: 1280, height: 960 },
] as const;

/** Long enough to read the headline over each frame without the background pulling focus. */
export const HERO_ROTATE_MS = 7000;
