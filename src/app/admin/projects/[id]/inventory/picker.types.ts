/** One catalog row as the picker sees it, with availability already derived server-side. */
export interface PickerItem {
    _id: string;
    oId: number;
    name: string;
    category: string;
    price: number;
    location: string;
    description: string;
    imagePath: string;
    smallImagePath: string;
    owned: number;
    free: number;
    out: number;
    awaitingCheckIn: number;
    /** Free stock plus whatever this project already holds — the real cap for this screen. */
    maxForThisProject: number;
    assignedHere: number;
    assignmentId?: string;
    holders: { projectId: string; projectName: string; quantity: number; awaitingCheckIn: boolean }[];
}

export interface StagingLine {
    item: PickerItem;
    /** Total units wanted at this house once committed. */
    desired: number;
    /** Change against what is already there. Negative means units going back to the warehouse. */
    delta: number;
}

export interface StagingSummary {
    adding: StagingLine[];
    changing: StagingLine[];
    removing: StagingLine[];
    alreadyHere: PickerItem[];
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
