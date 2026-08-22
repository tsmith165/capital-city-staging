import type { PaymentState } from '@/components/admin/projects/payments.types';

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'cancelled';

/** One row of `projects.getProjectsOverview`. */
export interface ProjectOverviewRow {
    _id: string;
    name: string;
    status: ProjectStatus;
    address?: string;
    startDate?: number;
    endDate?: number;
    revenue?: number;
    notes?: string;
    highlighted: boolean;
    displayOrder?: number;
    createdAt: number;
    imageCount: number;
    openUnits: number;
    openValue: number;
    payment: PaymentState;
}

export type StatusFilter = 'all' | ProjectStatus;
export type MoneyFilter = 'all' | 'owed' | 'paid';
