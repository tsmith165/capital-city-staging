import type { AttentionReason } from '@/app/admin/inventory/attention/attention.types';

/** Availability for one item, as `availabilityForItem` returns it. */
export interface EditorAvailability {
    owned: number;
    out: number;
    awaitingCheckIn: number;
    free: number;
    holders: {
        assignmentId: string;
        projectId: string;
        projectName: string;
        projectStatus: 'draft' | 'active' | 'completed' | 'cancelled';
        quantity: number;
        pricePerItem: number;
        assignedAt: number;
        awaitingCheckIn: boolean;
    }[];
}

export interface EditorExtraImage {
    _id: string;
    title?: string;
    imagePath: string;
    width: number;
    height: number;
    smallImagePath?: string;
    displayOrder: number;
}

/** One item as `inventory.getInventoryEditor` returns it. */
export interface EditorItem {
    _id: string;
    oId: number;
    active: boolean;
    name: string;
    category: string;
    vendor: string;
    location: string;
    description: string;
    price: number;
    cost?: number;
    count: number;
    realWidth: number;
    realHeight: number;
    realDepth: number;
    imagePath: string;
    width: number;
    height: number;
    smallImagePath: string;
    createdAt: number;
    updatedAt: number;
    extraImages: EditorExtraImage[];
    availability: EditorAvailability;
    attention: AttentionReason[];
    newerOId: number | null;
    olderOId: number | null;
    position: number;
    total: number;
    categories: string[];
    locations: string[];
}

/** The editable fields, all as strings so a half-typed number is not coerced on every keystroke. */
export interface InventoryFormState {
    name: string;
    category: string;
    vendor: string;
    location: string;
    description: string;
    price: string;
    cost: string;
    count: string;
    realWidth: string;
    realHeight: string;
    realDepth: string;
}

/** A photo in the single combined list the editor presents. Position 0 is the item's main image. */
export interface EditorPhoto {
    /** The `extraImages` row id, or null for the main image, which lives on the item itself. */
    _id: string | null;
    src: string;
    title: string;
    isMain: boolean;
}
