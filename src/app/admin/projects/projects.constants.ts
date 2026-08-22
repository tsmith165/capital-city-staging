import type { MoneyFilter, ProjectStatus, StatusFilter } from './projects.types';

export const STATUS_LABELS: Record<ProjectStatus, string> = {
    draft: 'Draft',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export const STATUS_TONES: Record<ProjectStatus, string> = {
    draft: 'border-line text-body-muted',
    active: 'border-success/40 bg-success-soft text-success',
    completed: 'border-info/40 bg-info-soft text-info',
    cancelled: 'border-danger/40 bg-danger-soft text-danger',
};

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'draft', label: 'Draft' },
    { value: 'cancelled', label: 'Cancelled' },
];

export const MONEY_FILTERS: { value: MoneyFilter; label: string }[] = [
    { value: 'all', label: 'Any' },
    { value: 'owed', label: 'Money owed' },
    { value: 'paid', label: 'Settled' },
];
