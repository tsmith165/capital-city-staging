import { BarChart3, Boxes, Home, Inbox, LayoutDashboard, Sofa, Users, Wrench } from 'lucide-react';

import type { AdminNavItem, AdminStatusTone } from './AdminShell.types';

export const ADMIN_NAVIGATION: readonly AdminNavItem[] = [
    { href: '/admin', label: 'Today', detail: 'What needs attention', icon: LayoutDashboard },
    { href: '/admin/projects', label: 'Projects', detail: 'Staging jobs and revenue', icon: Home },
    { href: '/admin/inventory', label: 'Inventory', detail: 'Furniture and decor catalog', icon: Sofa, badge: 'inventoryAttention' },
    { href: '/admin/manage/homepage', label: 'Homepage', detail: 'Hero image rotation', icon: Boxes },
    { href: '/admin/inbox', label: 'Inbox', detail: 'Quote requests and messages', icon: Inbox, badge: 'inbox' },
    { href: '/admin/analytics', label: 'Analytics', detail: 'Traffic and engagement', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', detail: 'Accounts and roles', icon: Users },
    { href: '/admin/tools', label: 'Tools', detail: 'Backups and data health', icon: Wrench },
] as const;

export const ADMIN_STATUS_TONE_CLASSES: Record<AdminStatusTone, string> = {
    neutral: 'border-line-strong bg-surface-overlay text-body-muted',
    good: 'border-success/40 bg-success-soft text-success',
    warning: 'border-warning/40 bg-warning-soft text-warning',
    danger: 'border-danger/40 bg-danger-soft text-danger',
    info: 'border-info/40 bg-info-soft text-info',
};
