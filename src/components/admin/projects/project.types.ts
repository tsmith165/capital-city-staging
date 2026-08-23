export type ProjectStatus = 'draft' | 'active' | 'completed' | 'cancelled';

/** One assignment line as `assignments.getProjectAssignments` returns it. */
export interface ProjectAssignmentLine {
    _id: string;
    inventoryId: string;
    quantity: number;
    pricePerItem: number;
    assignedAt: number;
    returnedAt?: number;
    name: string;
    category: string;
    smallImagePath: string;
    imagePath: string;
    currentPrice: number;
    oId?: number;
}

export interface ProjectFormState {
    name: string;
    status: ProjectStatus;
    address: string;
    startDate: string;
    endDate: string;
    revenue: string;
    notes: string;
    highlighted: boolean;
}

/** Statuses that mean the job is over, so its inventory should be coming home. */
export const CLOSING_STATUSES: readonly ProjectStatus[] = ['completed', 'cancelled'];
