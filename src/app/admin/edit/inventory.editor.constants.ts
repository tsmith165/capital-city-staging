/*
 * The categories the catalog was built around. Kept as a starting point rather than a closed set —
 * the field accepts anything already in use plus whatever is typed, because a catalog of 400 pieces
 * outgrows a hardcoded list and the old form silently refused everything not on it.
 */
export const INVENTORY_CATEGORIES = [
    'Art',
    'Barstool',
    'Bathroom',
    'Bedroom',
    'Bench',
    'Book',
    'Bookcase',
    'Chair',
    'Couch',
    'Decor',
    'Desk',
    'Kitchen',
    'Lamp',
    'Pillow',
    'Plant',
    'Rug',
    'Table',
    'Other',
] as const;

export const FIELD_CLASSES =
    'border-line bg-surface text-body placeholder:text-body-subtle focus-visible:border-gold-300 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors';

export const LABEL_CLASSES = 'text-body-muted text-xs font-bold';

export const ATTENTION_TONES: Record<'fix-now' | 'later', string> = {
    'fix-now': 'border-danger/40 bg-danger-soft text-danger',
    later: 'border-warning/40 bg-warning-soft text-warning',
};

export const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const exactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Inches, as the catalog stores them. Zero means "not measured", not "zero inches". */
export function describeDimensions(width: number, height: number, depth: number) {
    if (!width && !height && !depth) return 'Not measured';
    return `${width || '—'}" W × ${height || '—'}" H × ${depth || '—'}" D`;
}
