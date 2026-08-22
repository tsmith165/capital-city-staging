export interface ToolTab {
    id: string;
    label: string;
    eyebrow: string;
    title: string;
    description: string;
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
        description: 'Export every inventory record to a spreadsheet, including items that are not publicly listed.',
    },
    {
        id: 'health',
        label: 'Data health',
        eyebrow: 'Maintenance',
        title: 'Inventory counters',
        description: 'Recompute the stored availability counters that drifted before availability was derived from assignment records.',
    },
    {
        id: 'images',
        label: 'Image processing',
        eyebrow: 'Automatic',
        title: 'Thumbnails and dimensions',
        description: 'Both of these used to be manual jobs you ran from this page. They are part of the upload now.',
    },
] as const;

export const DEFAULT_TOOL_TAB = 'backup';
