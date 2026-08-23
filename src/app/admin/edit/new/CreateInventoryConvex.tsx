'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { Loader2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import { AdminHeading, AdminPanel } from '@/components/admin/AdminPrimitives';
import PendingPhotoTray, { pendingSettled, readyPending, revokePreviews } from '@/components/admin/images/PendingPhotoTray';
import type { PendingImage } from '@/components/admin/images/images.types';

/**
 * Adding one piece of furniture to the catalog.
 *
 * Deliberately short: a photo and a name is enough to have something to find, and everything that
 * takes judgement — price, stock, measurements, category — belongs on the editor this hands off to.
 * The identifier is allocated by the server, so two of these open at once cannot collide.
 */

const FIELD =
    'border-line bg-surface text-body placeholder:text-body-subtle focus-visible:border-gold-300 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors';

export default function CreateInventoryConvex() {
    const router = useRouter();
    const createInventory = useMutation(api.inventory.createInventory);

    const [pending, setPending] = useState<PendingImage[]>([]);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const photo = readyPending(pending)[0];
    const settled = pendingSettled(pending);
    const canSubmit = Boolean(photo) && name.trim().length > 0 && settled && !saving;
    const smallEdge = photo ? Math.min(photo.width ?? 0, photo.height ?? 0) : 0;

    const create = async (destination: 'edit' | 'view') => {
        if (!photo || !canSubmit) return;

        setSaving(true);
        setError(null);
        try {
            const { oId } = await createInventory({
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
            router.push(destination === 'edit' ? `/admin/edit?id=${oId}` : `/admin/inventory?item=${oId}`);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not create that item.');
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 p-5 sm:p-8">
            <AdminHeading eyebrow="Catalog" title="New item" />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[3fr_2fr]">
                <AdminPanel eyebrow="Photo" title="Main photo">
                    <div className="p-4">
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
                            <p className="text-body-subtle mt-3 text-xs">
                                The first photo becomes the main one. Add the rest in the editor.
                            </p>
                        )}
                    </div>
                </AdminPanel>

                <AdminPanel eyebrow="Details" title="Name it">
                    <div className="flex flex-col gap-4 p-4">
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

                        <div className="border-line flex flex-wrap items-center gap-2 border-t pt-4">
                            <button
                                type="button"
                                disabled={!canSubmit}
                                onClick={() => create('edit')}
                                className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving && <Loader2 size={15} aria-hidden="true" className="animate-spin" />}
                                Create and edit
                            </button>
                            <button
                                type="button"
                                disabled={!canSubmit}
                                onClick={() => create('view')}
                                className="border-line text-body-muted hover:bg-surface-hover hover:text-body rounded-md border px-3.5 py-2.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Create and view in catalog
                            </button>
                        </div>

                        <p className="text-body-subtle text-xs">Price, stock, category and measurements are set in the editor.</p>
                    </div>
                </AdminPanel>
            </div>
        </div>
    );
}
