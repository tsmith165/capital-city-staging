export interface ToolTab {
    id: string;
    label: string;
    eyebrow: string;
    title: string;
}

/**
 * The tab list is data. It previously had a "Test Email" entry with no component behind it, so
 * selecting it rendered an empty panel with no explanation.
 */
export const TOOL_TABS: readonly ToolTab[] = [
    {
        id: 'backup',
        label: 'Data backup',
        eyebrow: 'Export',
        title: 'Download the catalog',
    },
    {
        id: 'health',
        label: 'Data health',
        eyebrow: 'Maintenance',
        title: 'Inventory counters',
    },
    {
        id: 'images',
        label: 'Image processing',
        eyebrow: 'Automatic',
        title: 'Thumbnails and dimensions',
    },
] as const;

export const DEFAULT_TOOL_TAB = 'backup';
