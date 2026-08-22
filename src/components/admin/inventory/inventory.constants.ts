import type { AvailabilityFilter, CatalogSort, InventoryFilterState } from './inventory.types';

export const AVAILABILITY_FILTERS: readonly { value: AvailabilityFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'free', label: 'Free now' },
    { value: 'out', label: 'Out' },
    { value: 'attention', label: 'Needs a fix' },
];

export const CATALOG_SORTS: readonly { value: CatalogSort; label: string }[] = [
    { value: 'recent', label: 'Recently added' },
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'staged', label: 'Times staged' },
];

export const DEFAULT_FILTERS: InventoryFilterState = {
    search: '',
    category: '',
    location: '',
    availability: 'all',
    sort: 'recent',
};

export const ALL_LOCATIONS = 'All locations';

/** Kept in step with `convex/inventoryRules.ts` — the categories where fit is a real question. */
export const DIMENSION_REQUIRED_CATEGORIES: readonly string[] = [
    'Barstool',
    'Bench',
    'Bedroom',
    'Bookcase',
    'Chair',
    'Couch',
    'Desk',
    'Rug',
    'Table',
];

/** Grid used by every inventory photo grid, so the picker and the catalog stay visually the same. */
/*
 * Column counts assume the surrounding three-column layout: the admin nav takes 260px from `lg`, and
 * both grids gained a ~22rem right column at `xl`. The old 4-and-5 column steps were sized for a page
 * that ran the full width, and would leave ~140px cards here — too small to recognise a sofa in.
 */
export const INVENTORY_GRID_CLASSES = 'grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4';
