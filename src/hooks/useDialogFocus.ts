'use client';

import { useEffect, useRef } from 'react';

/**
 * Keeps keyboard focus inside an open dialog and gives it back when the dialog closes.
 *
 * Every overlay in the app rendered its own markup and left focus wherever it was, so Tab walked
 * straight out of the dialog into the page behind it and closing returned nobody to the control they
 * had opened. Escape is handled here too, because a dialog that traps focus and cannot be dismissed
 * from a keyboard is worse than one that does neither.
 */
export function useDialogFocus<T extends HTMLElement>(open: boolean, onClose?: () => void) {
    const ref = useRef<T>(null);
    const restoreTo = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;

        restoreTo.current = document.activeElement as HTMLElement | null;

        const container = ref.current;
        const focusable = () =>
            Array.from(
                container?.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
                ) ?? [],
            ).filter((element) => element.offsetParent !== null || element === document.activeElement);

        /* Focus the dialog itself rather than its first control, so a screen reader reads the label. */
        container?.focus({ preventScroll: true });

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose?.();
                return;
            }
            if (event.key !== 'Tab') return;

            const items = focusable();
            if (items.length === 0) return;

            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === container)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            restoreTo.current?.focus({ preventScroll: true });
        };
    }, [open, onClose]);

    return ref;
}
