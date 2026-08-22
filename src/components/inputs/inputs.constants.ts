/**
 * The four labelled field components had drifted apart: two used a gold gradient label with
 * dark text, two used a solid green label with subtle grey text on it, and the field itself
 * was variously light grey, gold, or an undefined CSS variable. They now share one look.
 */
export const FIELD_LABEL_CLASSES =
    'flex min-w-28 max-w-28 shrink-0 items-center justify-center rounded-l-md bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 px-2.5 py-1.5 text-sm font-bold text-body-inverse';

export const FIELD_CONTROL_CLASSES =
    'w-full min-w-0 flex-1 rounded-r-md border border-line-strong border-l-0 bg-surface-overlay px-2.5 text-sm font-semibold text-body placeholder-body-subtle';

/** react-select renders its own control element, so it needs the same look expressed as CSS. */
export const SELECT_CONTROL_STYLES = {
    backgroundColor: 'var(--color-surface-overlay)',
    borderColor: 'var(--color-line-strong)',
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    boxShadow: 'none',
    minHeight: '2rem',
} as const;
