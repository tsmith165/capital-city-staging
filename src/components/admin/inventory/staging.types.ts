/**
 * The pending-list types, shared by the project picker and the catalog.
 *
 * `StagingItem` is deliberately the smallest shape the list needs. Both the picker's `PickerItem`
 * and the catalog's `CatalogItem` carry far more than this, and neither should have to be converted
 * into the other's shape to reuse the list — so the hook is generic over anything that satisfies it.
 */
export interface StagingItem {
    _id: string;
    name: string;
    category: string;
    price: number;
    smallImagePath: string;
    /** Units this project already holds. */
    assignedHere: number;
    /** Free stock plus what this project already holds — the real cap for this screen. */
    maxForThisProject: number;
}

export interface StagingLine<T extends StagingItem = StagingItem> {
    item: T;
    /** Total units wanted at this house once committed. */
    desired: number;
    /** Change against what is already there. Negative means units going back to the warehouse. */
    delta: number;
}

export interface StagingSummary<T extends StagingItem = StagingItem> {
    adding: StagingLine<T>[];
    changing: StagingLine<T>[];
    removing: StagingLine<T>[];
    alreadyHere: T[];
    pendingCount: number;
    unitsAdded: number;
    unitsRemoved: number;
    valueAdded: number;
    lines: { inventoryId: string; quantity: number }[];
    selectedIds: Set<string>;
}

/** Per-line failure returned by the batch mutation when a commit does not fit. */
export interface LineProblem {
    inventoryId: string;
    itemName: string;
    requested: number;
    free: number;
    message: string;
}
