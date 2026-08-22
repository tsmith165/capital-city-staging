'use client';

import { useMemo, useState } from 'react';

import { DEFAULT_FILTERS } from './inventory.constants';
import type { FilterableItem, InventoryFilterState } from './inventory.types';

/**
 * Search, category, location, availability, and sort for a photo grid.
 *
 * Shared because the picker and the catalog navigate the same 400 items and had grown two different
 * subsets of the same controls. Filtering happens here rather than in a Convex query so that
 * switching the availability segment does not cost a round trip, and so the category counts shown in
 * the control can be computed from the same array being rendered.
 */

function matchesSearch(item: FilterableItem, needle: string) {
    if (!needle) return true;
    const term = needle.toLowerCase();
    return item.name.toLowerCase().includes(term) || (item.description ?? '').toLowerCase().includes(term);
}

function matchesAvailability(item: FilterableItem, filter: InventoryFilterState['availability']) {
    switch (filter) {
        case 'free':
            return item.free > 0;
        case 'out':
            return item.out > 0 || item.awaitingCheckIn > 0;
        case 'attention':
            return item.attentionTier != null;
        default:
            return true;
    }
}

const SORTERS: Record<InventoryFilterState['sort'], (a: FilterableItem, b: FilterableItem) => number> = {
    recent: (a, b) => b.oId - a.oId,
    name: (a, b) => a.name.localeCompare(b.name),
    price: (a, b) => b.price - a.price,
    staged: (a, b) => (b.timesStaged ?? 0) - (a.timesStaged ?? 0),
};

export function useInventoryFilters<T extends FilterableItem>(items: T[] | undefined, initial?: Partial<InventoryFilterState>) {
    const [filters, setFilters] = useState<InventoryFilterState>({ ...DEFAULT_FILTERS, ...initial });

    const update = <K extends keyof InventoryFilterState>(key: K, value: InventoryFilterState[K]) =>
        setFilters((current) => ({ ...current, [key]: value }));

    const reset = () => setFilters({ ...DEFAULT_FILTERS, ...initial });

    const { visible, categories, locations, counts } = useMemo(() => {
        const source = items ?? [];

        /*
         * Category and location options come from the whole catalog, not the filtered view, so
         * choosing a category cannot make the other options vanish from under the cursor.
         */
        const categoryNames = [...new Set(source.map((item) => item.category).filter(Boolean))].sort();
        const locationNames = [...new Set(source.map((item) => item.location).filter(Boolean) as string[])].sort();

        const matched = source.filter(
            (item) =>
                matchesSearch(item, filters.search) &&
                (!filters.category || item.category === filters.category) &&
                (!filters.location || item.location === filters.location) &&
                matchesAvailability(item, filters.availability),
        );

        return {
            visible: [...matched].sort(SORTERS[filters.sort]),
            categories: categoryNames,
            locations: locationNames,
            counts: {
                all: source.length,
                free: source.filter((item) => item.free > 0).length,
                out: source.filter((item) => item.out > 0 || item.awaitingCheckIn > 0).length,
                attention: source.filter((item) => item.attentionTier != null).length,
            },
        };
    }, [items, filters]);

    const isFiltered = Boolean(filters.search) || Boolean(filters.category) || Boolean(filters.location) || filters.availability !== 'all';

    return { filters, update, reset, visible, categories, locations, counts, isFiltered };
}
