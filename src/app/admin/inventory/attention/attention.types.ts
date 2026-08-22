export type AttentionTier = 'fix-now' | 'later';

export interface AttentionReason {
    code: 'missing-photo' | 'unpriced-and-assigned' | 'over-assigned' | 'unpriced' | 'missing-dimensions';
    label: string;
    tier: AttentionTier;
    detail: string;
}

/** One row of the queue, as `dashboard.getInventoryNeedingAttention` returns it. */
export interface AttentionItem {
    _id: string;
    oId: number;
    name: string;
    category: string;
    price: number;
    realWidth: number;
    realHeight: number;
    realDepth: number;
    smallImagePath: string;
    imagePath: string;
    owned: number;
    out: number;
    awaitingCheckIn: number;
    holderName: string | null;
    tier: AttentionTier | null;
    reasons: AttentionReason[];
}
