'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { CheckCircle2, Loader2, X } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminPanel } from '@/components/admin/AdminPrimitives';
import EditableImageCard from '@/components/admin/images/EditableImageCard';
import PendingPhotoTray, {
    movePending as move,
    pendingSettled,
    readyPending,
    revokePreviews,
} from '@/components/admin/images/PendingPhotoTray';
import type { PendingImage } from '@/components/admin/images/images.types';

import type { EditorItem, EditorPhoto } from './inventory.editor.types';

/**
 * Every photo of one item, as one list.
 *
 * The main image lives on the inventory row and the rest live in their own table, which is why the
 * old editor had a "Change Main" button and an "Add Extra" button wired to different uploaders and a
 * separate ordering widget below the form. Nobody thinks about it that way: there are photos of a
 * sofa, and one of them is the one you see first. So there is one list here, position one is the
 * main image, and moving a photo into that slot swaps the two rows rather than asking for a
 * re-upload of a picture the catalog already holds.
 *
 * New photos stage in the browser first — captioned, ordered, prunable — and nothing is written
 * until the batch is committed.
 */

export default function InventoryPhotosSection({ item }: { item: EditorItem }) {
    const addImages = useMutation(api.inventory.addExtraImages);
    const updateImage = useMutation(api.inventory.updateExtraImage);
    const removeImage = useMutation(api.inventory.deleteExtraImage);
    const reorderImages = useMutation(api.inventory.reorderInventoryImages);
    const setMainImage = useMutation(api.inventory.setMainImage);

    const [pending, setPending] = useState<PendingImage[]>([]);
    const [dragging, setDragging] = useState<number | null>(null);
    const [committing, setCommitting] = useState(false);
    const [flash, setFlash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

    const ready = readyPending(pending);
    const settled = pendingSettled(pending);

    /* Position 0 is the item's own image; the rest are `extraImages` rows, in display order. */
    const photos: EditorPhoto[] = [
        { _id: null, src: item.smallImagePath || item.imagePath, title: item.name, isMain: true },
        ...item.extraImages.map((image) => ({
            _id: image._id,
            src: image.smallImagePath ?? image.imagePath,
            title: image.title ?? '',
            isMain: false,
        })),
    ];

    const handleCommit = async () => {
        if (ready.length === 0) return;

        setCommitting(true);
        setError(null);
        try {
            const result = await addImages({
                inventoryId: item._id as Id<'inventory'>,
                images: ready.map((image) => ({
                    title: image.title.trim() || undefined,
                    imagePath: image.imagePath as string,
                    width: image.width as number,
                    height: image.height as number,
                    smallImagePath: image.thumbnailPath,
                    smallWidth: image.thumbnailWidth,
                    smallHeight: image.thumbnailHeight,
                })),
            });

            revokePreviews(pending);
            setPending([]);
            setFlash(`${result.added} ${result.added === 1 ? 'photo' : 'photos'} added.`);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not save those photos.');
        } finally {
            setCommitting(false);
        }
    };

    const discardPending = () => {
        revokePreviews(pending);
        setPending([]);
        setError(null);
    };

    /**
     * Resolves a move within the combined list into the right mutation.
     *
     * Anything touching position 0 is a change of main image, which swaps two rows across two tables.
     * Everything else is a plain reorder of the extras.
     */
    const commitOrder = async (from: number, to: number) => {
        if (to < 0 || to >= photos.length || from === to) return;
        setError(null);

        try {
            if (from === 0 || to === 0) {
                /* Whichever of the two is an extra becomes the new main. */
                const promoted = from === 0 ? photos[to] : photos[from];
                if (!promoted._id) return;
                await setMainImage({ inventoryId: item._id as Id<'inventory'>, imageId: promoted._id as Id<'extraImages'> });
                return;
            }

            const extras = move(item.extraImages, from - 1, to - 1);
            await reorderImages({
                inventoryId: item._id as Id<'inventory'>,
                imageIds: extras.map((image) => image._id) as Id<'extraImages'>[],
            });
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not reorder those photos.');
        }
    };

    const runOrFail = async (action: Promise<unknown>, message = 'That change did not go through.') => {
        setError(null);
        try {
            await action;
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : message);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <AdminPanel eyebrow="Photos" title={pending.length > 0 ? `Ready to add · ${ready.length} of ${pending.length}` : 'Add photos'}>
                <div className="p-4">
                    <PendingPhotoTray
                        pending={pending}
                        onPendingChange={(update) => setPending(update)}
                        onFilesChosen={() => {
                            setFlash(null);
                            setError(null);
                        }}
                        actions={
                            <>
                                <button
                                    type="button"
                                    onClick={handleCommit}
                                    disabled={committing || ready.length === 0 || !settled}
                                    className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {committing && <Loader2 size={15} aria-hidden="true" className="animate-spin" />}
                                    {!settled ? 'Waiting for uploads…' : `Add ${ready.length} ${ready.length === 1 ? 'photo' : 'photos'}`}
                                </button>
                                <button
                                    type="button"
                                    onClick={discardPending}
                                    disabled={committing}
                                    className="border-line text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2.5 text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                    <X size={13} aria-hidden="true" /> Discard
                                </button>
                                <span className="text-body-subtle ml-auto text-xs">Nothing is saved until you add them.</span>
                            </>
                        }
                    />

                    <p aria-live="polite" className="empty:hidden">
                        {flash && (
                            <span className="text-success mt-3 inline-flex items-center gap-1.5 text-sm font-bold">
                                <CheckCircle2 size={14} aria-hidden="true" /> {flash}
                            </span>
                        )}
                    </p>
                    {error && (
                        <p role="alert" className="border-danger/40 bg-danger-soft text-danger mt-3 rounded-md border px-4 py-2.5 text-sm">
                            {error}
                        </p>
                    )}
                </div>
            </AdminPanel>

            <AdminPanel eyebrow="On this item" title={`Photos · ${photos.length}`}>
                <p className="border-line text-body-subtle border-b px-4 py-2.5 text-xs">
                    The first photo is the one the catalog, the picker and the public site all use. Move another into first place to make it
                    the main one.
                </p>
                <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 2xl:grid-cols-4">
                    {photos.map((photo, index) => (
                        <EditableImageCard
                            key={photo._id ?? 'main'}
                            src={photo.src}
                            title={photo._id ? (captionDrafts[photo._id] ?? photo.title) : ''}
                            lockedTitle={photo.isMain ? photo.title : undefined}
                            badge={photo.isMain ? 'Main' : undefined}
                            canRemove={!photo.isMain}
                            position={index}
                            total={photos.length}
                            dragging={dragging === index}
                            onTitleChange={(title) =>
                                photo._id && setCaptionDrafts((current) => ({ ...current, [photo._id as string]: title }))
                            }
                            onTitleCommit={() => {
                                if (!photo._id) return;
                                const draft = captionDrafts[photo._id];
                                if (draft === undefined || draft === photo.title) return;
                                void runOrFail(
                                    updateImage({ imageId: photo._id as Id<'extraImages'>, title: draft }),
                                    'Could not save that caption.',
                                );
                            }}
                            confirmRemove="Delete this photo? It comes off the catalog and the public site straight away."
                            onRemove={() => photo._id && void runOrFail(removeImage({ id: photo._id as Id<'extraImages'> }))}
                            onMove={(direction) => void commitOrder(index, index + direction)}
                            onDragStart={() => setDragging(index)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => {
                                if (dragging === null) return;
                                void commitOrder(dragging, index);
                                setDragging(null);
                            }}
                            onDragEnd={() => setDragging(null)}
                        />
                    ))}
                </ul>
            </AdminPanel>
        </div>
    );
}
