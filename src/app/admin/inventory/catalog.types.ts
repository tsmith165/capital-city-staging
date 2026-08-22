/** One catalog row as `inventory.getCatalog` returns it, with availability already derived. */
export interface CatalogItem {
    _id: string;
    oId: number;
    name: string;
    category: string;
    location: string;
    price: number;
    active: boolean;
    imagePath: string;
    smallImagePath: string;
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
