'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { Loader2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import PendingPhotoTray, { pendingSettled, readyPending, revokePreviews } from '@/components/admin/images/PendingPhotoTray';
import type { PendingImage } from '@/components/admin/images/images.types';

/**
 * Adding one piece of furniture to the catalog, shared by the `/admin/edit/new` page and the
 * modal the catalog and the editor open.
 *
 * Deliberately short: a photo and a name is enough to have something to find, and everything that
 * takes judgement — price, stock, measurements, category — belongs on the editor this hands off to.
 * The identifier is allocated by the server, so two of these open at once cannot collide.
 *
 * The two surfaces had drifted into separate implementations of this, with different field sets and
 * two different upload paths. One of them also warned about small photos with
 * `width < 800 || (height < 800 && ...)`, which never fires for a narrow tall image.
 */

export type CreateInventoryAction = 'edit' | 'view' | 'stay';

const ACTION_LABEL: Record<CreateInventoryAction, string> = {
    edit: 'Create and edit',
    view: 'Create and view in catalog',
    stay: 'Create and add another',
};

const FIELD =
    'border-line bg-surface text-body placeholder:text-body-subtle focus-visible:border-gold-300 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors';

const PRIMARY =
    'bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const SECONDARY =
    'border-line text-body-muted hover:bg-surface-hover hover:text-body rounded-md border px-3.5 py-2.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

interface CreateInventoryFieldsProps {
    /** In order; the first is the primary button. `stay` clears the form instead of navigating. */
    actions: CreateInventoryAction[];
    onCreated: (inventoryId: string, action: CreateInventoryAction) => void;
    /** Rendered as one column rather than photo-beside-details. */
    stacked?: boolean;
}

export default function CreateInventoryFields({ actions, onCreated, stacked = false }: CreateInventoryFieldsProps) {
    const createInventory = useMutation(api.inventory.createInventory);

    const [pending, setPending] = useState<PendingImage[]>([]);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [justAdded, setJustAdded] = useState<string | null>(null);

    const photo = readyPending(pending)[0];
    const settled = pendingSettled(pending);
    const canSubmit = Boolean(photo) && name.trim().length > 0 && settled && !saving;
    const smallEdge = photo ? Math.min(photo.width ?? 0, photo.height ?? 0) : 0;

    const create = async (action: CreateInventoryAction) => {
        if (!photo || !canSubmit) return;

        setSaving(true);
        setError(null);
        setJustAdded(null);
        try {
            const { inventoryId } = await createInventory({
                active: true,
                name: name.trim(),
                cost: 0,
                price: 0,
                vendor: '',
                category: '',
                description: '',
                /* One unit until she says otherwise; zero would read as out of stock everywhere. */
                count: 1,
                location: '',
                realWidth: 0,
                realHeight: 0,
                realDepth: 0,
                imagePath: photo.imagePath as string,
                width: photo.width as number,
                height: photo.height as number,
                smallImagePath: photo.thumbnailPath ?? (photo.imagePath as string),
                smallWidth: photo.thumbnailWidth ?? (photo.width as number),
                smallHeight: photo.thumbnailHeight ?? (photo.height as number),
            });

            revokePreviews(pending);

            if (action === 'stay') {
                /* Bulk entry: keep the form open, ready for the next piece. */
                setPending([]);
                setName('');
                setJustAdded(name.trim());
                setSaving(false);
            }

            onCreated(inventoryId, action);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not create that item.');
            setSaving(false);
        }
    };

    return (
        <div className={stacked ? 'flex flex-col gap-5' : 'grid grid-cols-1 gap-5 xl:grid-cols-[3fr_2fr]'}>
            <div>
                <PendingPhotoTray
                    pending={pending}
                    onPendingChange={(update) => setPending(update)}
                    onFilesChosen={() => setError(null)}
                    disabled={saving}
                />
                {photo && smallEdge < 800 && (
                    <p className="border-warning/40 bg-warning-soft text-warning mt-3 rounded-md border px-4 py-2.5 text-sm">
                        This photo is {photo.width}×{photo.height}. Under 800px it will look soft on the public site.
                    </p>
                )}
                {pending.length > 1 && (
                    <p className="text-body-subtle mt-3 text-xs">The first photo becomes the main one. Add the rest in the editor.</p>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-body-muted text-xs font-bold">Name *</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Grey linen sofa"
                        className={FIELD}
                    />
                </label>

                {error && (
                    <p role="alert" className="border-danger/40 bg-danger-soft text-danger rounded-md border px-4 py-2.5 text-sm">
                        {error}
                    </p>
                )}

                {justAdded && !error && (
                    <p role="status" className="border-success/40 bg-success-soft text-success rounded-md border px-4 py-2.5 text-sm">
                        Added {justAdded}. Ready for the next one.
                    </p>
                )}

                <div className="border-line flex flex-wrap items-center gap-2 border-t pt-4">
                    {actions.map((action, index) => (
                        <button
                            key={action}
                            type="button"
                            disabled={!canSubmit}
                            onClick={() => void create(action)}
                            className={index === 0 ? PRIMARY : SECONDARY}
                        >
                            {index === 0 && saving && <Loader2 size={15} aria-hidden="true" className="animate-spin" />}
                            {ACTION_LABEL[action]}
                        </button>
                    ))}
                </div>

                <p className="text-body-subtle text-xs">Price, stock, category and measurements are set in the editor.</p>
            </div>
        </div>
    );
}
