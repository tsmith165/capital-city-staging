'use client';

import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

import { AVAILABILITY_FILTERS, CATALOG_SORTS } from './inventory.constants';
import type { AvailabilityFilter, InventoryFilterState } from './inventory.types';

/**
 * The navigation for a 400-item catalog.
 *
 * Filters are the navigation here — not pagination, which breaks browsing by eye. The availability
 * segment is the important addition: "what can I actually use" was previously unanswerable, because
 * the only availability number in the app was a counter stuck at zero.
 */

const CONTROL_CLASSES =
    'h-10 rounded-md border border-line-strong bg-surface px-3 text-sm text-body focus:border-gold-300 focus:outline-none';

interface Props {
    filters: InventoryFilterState;
    onChange: <K extends keyof InventoryFilterState>(key: K, value: InventoryFilterState[K]) => void;
    categories: readonly string[];
    locations?: readonly string[];
    counts: Record<AvailabilityFilter, number>;
    /** Restricts the availability segment. The picker has no use for "needs a fix". */
    availabilityOptions?: readonly AvailabilityFilter[];
    showSort?: boolean;
    /** Result count line, e.g. "42 items". Rendered under the controls. */
    summary?: string;
}

const InventoryFilterBar = forwardRef<HTMLInputElement, Props>(function InventoryFilterBar(
    { filters, onChange, categories, locations, counts, availabilityOptions, showSort = true, summary },
    searchRef,
) {
    const segments = availabilityOptions
        ? AVAILABILITY_FILTERS.filter((option) => availabilityOptions.includes(option.value))
        : AVAILABILITY_FILTERS;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[13rem] flex-1">
                    <Search
                        size={15}
                        aria-hidden="true"
                        className="text-body-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                    />
                    <input
                        ref={searchRef}
                        type="search"
                        value={filters.search}
                        onChange={(event) => onChange('search', event.target.value)}
                        placeholder="Search by name or description"
                        aria-label="Search inventory"
                        className={`${CONTROL_CLASSES} w-full pl-9`}
                    />
                </div>

                <select
                    value={filters.category}
                    onChange={(event) => onChange('category', event.target.value)}
                    aria-label="Filter by category"
                    className={CONTROL_CLASSES}
                >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                {locations && locations.length > 1 && (
                    <select
                        value={filters.location}
                        onChange={(event) => onChange('location', event.target.value)}
                        aria-label="Filter by storage location"
                        className={CONTROL_CLASSES}
                    >
                        <option value="">All locations</option>
                        {locations.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                )}

                {showSort && (
                    <select
                        value={filters.sort}
                        onChange={(event) => onChange('sort', event.target.value as InventoryFilterState['sort'])}
                        aria-label="Sort inventory"
                        className={CONTROL_CLASSES}
                    >
                        {CATALOG_SORTS.map((sort) => (
                            <option key={sort.value} value={sort.value}>
                                Sort: {sort.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div role="group" aria-label="Filter by availability" className="border-line-strong inline-flex rounded-md border p-0.5">
                    {segments.map((option) => {
                        const active = filters.availability === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onChange('availability', option.value)}
                                aria-pressed={active}
                                className={`rounded px-3 py-1.5 text-xs font-bold transition-colors ${
                                    active ? 'bg-gold-400 text-body-inverse' : 'text-body-muted hover:bg-surface-hover hover:text-body'
                                }`}
                            >
                                {option.label}
                                <span className={active ? 'ml-1.5 opacity-70' : 'text-body-subtle ml-1.5'}>{counts[option.value]}</span>
                            </button>
                        );
                    })}
                </div>

                {summary && <span className="text-body-subtle text-xs">{summary}</span>}

                {(filters.search || filters.category || filters.location || filters.availability !== 'all') && (
                    <button
                        type="button"
                        onClick={() => {
                            onChange('search', '');
                            onChange('category', '');
                            onChange('location', '');
                            onChange('availability', 'all');
                        }}
                        className="text-gold-300 hover:text-gold-200 inline-flex items-center gap-1 text-xs font-bold transition-colors"
                    >
                        <X size={13} aria-hidden="true" /> Clear filters
                    </button>
                )}
            </div>
        </div>
    );
});

export default InventoryFilterBar;
