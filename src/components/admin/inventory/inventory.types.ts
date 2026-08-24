/** Derived availability for one item, as every inventory surface consumes it. */
export interface AvailabilitySummary {
    owned: number;
    /** Units at a house that is still being staged. */
    out: number;
    /** Units still assigned to a finished job — physically out, never recorded as back. */
    awaitingCheckIn: number;
    free: number;
    /** The house holding it, when there is one. Drives "Out · Watt Avenue". */
    holderName?: string | null;
    holderAwaitingCheckIn?: boolean;
    holderCount?: number;
}

export type AvailabilityFilter = 'all' | 'free' | 'out' | 'attention';

export type CatalogSort = 'recent' | 'name' | 'price' | 'staged';

export interface InventoryFilterState {
    search: string;
    category: string;
    location: string;
    availability: AvailabilityFilter;
    sort: CatalogSort;
}

/** The subset of a catalog row the shared filter helpers need to do their work. */
export interface FilterableItem {
    name: string;
    description?: string;
    category: string;
    location?: string;
    price: number;
    oId: number;
    createdAt: number;
    free: number;
    out: number;
    awaitingCheckIn: number;
    timesStaged?: number;
    attentionTier?: 'fix-now' | 'later' | null;
}
