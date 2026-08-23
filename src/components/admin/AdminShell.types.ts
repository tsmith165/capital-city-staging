import type { LucideIcon } from 'lucide-react';

export interface AdminNavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    /** Which dashboard counter, if any, renders as a badge on this item. */
    badge?: 'inbox' | 'inventoryAttention';
}

export type AdminStatusTone = 'neutral' | 'good' | 'warning' | 'danger' | 'info';
