import { BarChart3, Boxes, Home, Inbox, LayoutDashboard, Sofa, Users, Wrench } from 'lucide-react';

import type { AdminNavItem, AdminStatusTone } from './AdminShell.types';

/** Labels only. The subtitles restated what each destination obviously is. */
export const ADMIN_NAVIGATION: readonly AdminNavItem[] = [
    { href: '/admin', label: 'Today', icon: LayoutDashboard },
    { href: '/admin/projects', label: 'Projects', icon: Home },
    { href: '/admin/inventory', label: 'Inventory', icon: Sofa, badge: 'inventoryAttention' },
    { href: '/admin/manage/homepage', label: 'Homepage', icon: Boxes },
    { href: '/admin/inbox', label: 'Inbox', icon: Inbox, badge: 'inbox' },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/tools', label: 'Tools', icon: Wrench },
] as const;

export const ADMIN_STATUS_TONE_CLASSES: Record<AdminStatusTone, string> = {
    neutral: 'border-line-strong bg-surface-overlay text-body-muted',
    good: 'border-success/40 bg-success-soft text-success',
    warning: 'border-warning/40 bg-warning-soft text-warning',
    danger: 'border-danger/40 bg-danger-soft text-danger',
    info: 'border-info/40 bg-info-soft text-info',
};
