import type { StagingItem } from '@/components/admin/inventory/staging.types';

/** One catalog row as `inventory.getCatalog` returns it, with availability already derived. */
export interface CatalogItem extends StagingItem {
    oId: number;
    createdAt: number;
    location: string;
    active: boolean;
    imagePath: string;
    owned: number;
    out: number;
    awaitingCheckIn: number;
    free: number;
    holderName: string | null;
    holderId: string | null;
    holderAwaitingCheckIn: boolean;
    holderCount: number;
    attentionTier: 'fix-now' | 'later' | null;
    /** Lifetime count of assignment rows, including returned ones. Powers the "times staged" sort. */
    timesStaged: number;
}

/** One house in the "staging for" picker. */
export interface ProjectOption {
    _id: string;
    name: string;
    address: string;
    status: string;
    openUnits: number;
}
