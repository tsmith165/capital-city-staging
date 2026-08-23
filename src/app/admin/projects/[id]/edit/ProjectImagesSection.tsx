'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { CheckCircle2, Loader2, X } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminPanel } from '@/components/admin/AdminPrimitives';

import EditableImageCard from '@/components/admin/images/EditableImageCard';
import PendingPhotoTray, { movePending, pendingSettled, readyPending, revokePreviews } from '@/components/admin/images/PendingPhotoTray';
import type { CommittedImage, PendingImage } from '@/components/admin/images/images.types';

/**
 * Photos for one project, in two lists.
 *
 * Above: whatever she has just picked, still only in the browser. She can caption them, reorder them
 * and drop any of them before a single row is written. Below: what is already on the project, where
 * the same three edits apply straight away because there is nothing left to confirm.
 */

export default function ProjectImagesSection({ projectId, images }: { projectId: string; images: CommittedImage[] }) {
    const addImages = useMutation(api.projects.addProjectImages);
    const updateImage = useMutation(api.projects.updateProjectImage);
    const removeImage = useMutation(api.projects.removeProjectImage);
    const reorderImages = useMutation(api.projects.reorderProjectImages);

    const [pending, setPending] = useState<PendingImage[]>([]);
    const [dragging, setDragging] = useState<number | null>(null);
    const [committing, setCommitting] = useState(false);
    const [flash, setFlash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    /* Captions on committed images write straight through, so they are drafted here and sent on blur. */
    const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

    const ready = readyPending(pending);
    const settled = pendingSettled(pending);

    const handleCommit = async () => {
        if (ready.length === 0) return;

        setCommitting(true);
        setError(null);
        try {
            const result = await addImages({
                projectId: projectId as Id<'projects'>,
                /* Committed in the order shown, so the arrangement above is what the site gets. */
                images: ready.map((image) => ({
                    title: image.title.trim() || undefined,
                    imagePath: image.imagePath as string,
                    width: image.width as number,
                    height: image.height as number,
                    thumbnailPath: image.thumbnailPath,
                    thumbnailWidth: image.thumbnailWidth,
                    thumbnailHeight: image.thumbnailHeight,
                })),
            });

            revokePreviews(pending);
            setPending([]);
            setFlash(`${result.added} ${result.added === 1 ? 'photo' : 'photos'} added to this project.`);
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

    const commitOrder = (ordered: CommittedImage[]) =>
        reorderImages({
            projectId: projectId as Id<'projects'>,
            imageIds: ordered.map((image) => image._id) as Id<'projectImages'>[],
        });

    const runOrFail = async (action: Promise<unknown>, message: string) => {
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
                                    {!settled
                                        ? 'Waiting for uploads…'
                                        : `Add ${ready.length} ${ready.length === 1 ? 'photo' : 'photos'} to this project`}
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

            <AdminPanel eyebrow="On this project" title={images.length === 0 ? 'No photos yet' : `Photos · ${images.length}`}>
                {images.length === 0 ? (
                    <p className="text-body-muted px-5 py-8 text-center text-sm">
                        Photos added here appear on the public project page, in this order.
                    </p>
                ) : (
                    <>
                        <p className="border-line text-body-subtle border-b px-4 py-2.5 text-xs">
                            The first photo is the one the portfolio uses. Captions become the alt text on the public page.
                        </p>
                        <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 2xl:grid-cols-4">
                            {images.map((image, index) => (
                                <EditableImageCard
                                    key={image._id}
                                    src={image.thumbnailPath ?? image.imagePath}
                                    title={captionDrafts[image._id] ?? image.title ?? ''}
                                    position={index}
                                    total={images.length}
                                    dragging={dragging === index}
                                    confirmRemove="Remove this photo? It comes off the public project page straight away."
                                    onTitleChange={(title) => setCaptionDrafts((current) => ({ ...current, [image._id]: title }))}
                                    onTitleCommit={() => {
                                        const draft = captionDrafts[image._id];
                                        if (draft === undefined || draft === (image.title ?? '')) return;
                                        void runOrFail(
                                            updateImage({ imageId: image._id as Id<'projectImages'>, title: draft }),
                                            'Could not save that caption.',
                                        );
                                    }}
                                    onRemove={() =>
                                        void runOrFail(
                                            removeImage({ imageId: image._id as Id<'projectImages'> }),
                                            'Could not remove that photo.',
                                        )
                                    }
                                    onMove={(direction) =>
                                        void runOrFail(commitOrder(movePending(images, index, index + direction)), 'Could not reorder.')
                                    }
                                    onDragStart={() => setDragging(index)}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={() => {
                                        if (dragging === null) return;
                                        void runOrFail(commitOrder(movePending(images, dragging, index)), 'Could not reorder.');
                                        setDragging(null);
                                    }}
                                    onDragEnd={() => setDragging(null)}
                                />
                            ))}
                        </ul>
                    </>
                )}
            </AdminPanel>
        </div>
    );
}
