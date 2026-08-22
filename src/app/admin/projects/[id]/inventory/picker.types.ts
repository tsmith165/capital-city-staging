import type { StagingItem } from '@/components/admin/inventory/staging.types';

/** One catalog row as the picker sees it, with availability already derived server-side. */
export interface PickerItem extends StagingItem {
    oId: number;
    location: string;
    description: string;
    imagePath: string;
    owned: number;
    free: number;
    out: number;
    awaitingCheckIn: number;
    assignmentId?: string;
    holders: { projectId: string; projectName: string; quantity: number; awaitingCheckIn: boolean }[];
}

export type { LineProblem, StagingLine, StagingSummary } from '@/components/admin/inventory/staging.types';
