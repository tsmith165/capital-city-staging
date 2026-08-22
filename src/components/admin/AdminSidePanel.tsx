'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * A detail column that is furniture on a wide screen and a slide-over on a narrow one.
 *
 * From `xl` up it sits in the layout, so the list keeps scrolling behind whatever is open and there
 * is no scrim to dismiss. Below that width there is not enough room, so the same children become an
 * overlay — one body, two wrappers, rather than two implementations that drift apart.
 */
export default function AdminSidePanel({
    open,
    onOpenChange,
    label,
    onEscape,
    children,
}: {
    /** Only meaningful below `xl`, where the panel is an overlay. */
    open: boolean;
    onOpenChange: (open: boolean) => void;
    label: string;
    /** Defaults to closing the overlay. Override when Escape should step back through a stack first. */
    onEscape?: () => void;
    children: React.ReactNode;
}) {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            if (onEscape) onEscape();
            else onOpenChange(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onEscape, onOpenChange]);

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
                    <button
                        type="button"
                        aria-label="Close panel"
                        onClick={() => onOpenChange(false)}
                        className="bg-ink/70 absolute inset-0"
                    />
                    <aside
                        role="dialog"
                        aria-modal="true"
                        aria-label={label}
                        className="border-line bg-surface-raised shadow-overlay relative flex h-full w-full max-w-md flex-col border-l"
                    >
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            aria-label="Close panel"
                            className="border-line bg-surface-raised text-body-muted hover:text-body absolute top-3 -left-11 grid h-9 w-9 place-items-center rounded-md border transition-colors"
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                        {children}
                    </aside>
                </div>
            )}

            <aside
                aria-label={label}
                className="border-line bg-surface-raised sticky top-0 hidden max-h-[calc(100dvh-64px)] w-[22rem] shrink-0 flex-col self-start border-l xl:flex 2xl:w-[24rem]"
            >
                {children}
            </aside>
        </>
    );
}
