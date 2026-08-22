/**
 * Action styling lived inline on every button, so the same "primary" button appeared as a gold
 * gradient in one section, a green gradient in another and white-on-gold in a third.
 */
export const PRIMARY_ACTION =
    'inline-flex items-center justify-center gap-2 rounded-md bg-gold-400 px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] text-body-inverse transition-colors hover:bg-gold-300';

export const SECONDARY_ACTION =
    'inline-flex items-center justify-center gap-2 rounded-md border border-line-strong bg-surface-raised/80 px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] text-body backdrop-blur transition-colors hover:border-gold-400 hover:text-gold-300';

export const QUIET_ACTION =
    'inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition-colors hover:text-gold-200';
