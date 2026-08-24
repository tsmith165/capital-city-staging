'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { useDialogFocus } from '@/hooks/useDialogFocus';
import CreateInventoryFields from '@/components/admin/inventory/CreateInventoryFields';

/**
 * Adding to the catalog without leaving the screen you were on.
 *
 * This used to be a 491-line second implementation of item creation: its own upload handling, its
 * own hardcoded category list, raw colours instead of the admin tokens, a `defaultAction` prop
 * nothing read, and a 1.5 second delay before it would close. It shares one body with
 * `/admin/edit/new` now, so the two entry points cannot drift again.
 *
 * "Create and add another" leaves the dialog open for the next piece. Nothing needs to be told
 * about it: the catalog behind this is a live Convex subscription and already shows the new row.
 */

interface AddInventoryOverlayProps {
    onClose: () => void;
}

export default function AddInventoryOverlay({ onClose }: AddInventoryOverlayProps) {
    const router = useRouter();
    /* Open for as long as it is mounted; the parent unmounts it to close. */
    const dialogRef = useDialogFocus<HTMLDivElement>(true, onClose);

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-inventory-title"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
            <div className="bg-surface border-line shadow-overlay relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border">
                <div className="border-line bg-surface-raised flex items-center justify-between gap-3 border-b px-5 py-4">
                    <h2 id="add-inventory-title" className="font-display text-gold-300 text-lg font-bold">
                        Add to the catalog
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="border-line text-body-muted hover:bg-surface-hover hover:text-body grid h-9 w-9 place-items-center rounded-md border transition-colors"
                    >
                        <X size={17} aria-hidden="true" />
                    </button>
                </div>

                <div className="min-h-0 overflow-y-auto p-5">
                    <CreateInventoryFields
                        stacked
                        actions={['stay', 'edit']}
                        onCreated={(inventoryId, action) => {
                            if (action === 'stay') return;
                            onClose();
                            router.push(`/admin/edit?item=${inventoryId}`);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
