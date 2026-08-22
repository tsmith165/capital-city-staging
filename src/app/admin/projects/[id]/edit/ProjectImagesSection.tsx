'use client';

import { useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { CheckCircle2, ImagePlus, Loader2, Upload, X } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminPanel } from '@/components/admin/AdminPrimitives';

import ProjectImageCard from './ProjectImageCard';
import { useImageUpload } from './useImageUpload';
import type { CommittedImage, PendingImage } from './images.types';

/**
 * Photos for one project, in two lists.
 *
 * Above: whatever she has just picked, still only in the browser. She can caption them, reorder them
 * and drop any of them before a single row is written. Below: what is already on the project, where
 * the same three edits apply straight away because there is nothing left to confirm.
 *
 * The two lists use one card. The only real difference between them is when an edit lands.
 */

function move<T>(items: T[], from: number, to: number) {
    if (to < 0 || to >= items.length) return items;
    const next = [...items];
    const [lifted] = next.splice(from, 1);
    next.splice(to, 0, lifted);
    return next;
}

export default function ProjectImagesSection({ projectId, images }: { projectId: string; images: CommittedImage[] }) {
    const addImages = useMutation(api.projects.addProjectImages);
    const updateImage = useMutation(api.projects.updateProjectImage);
    const removeImage = useMutation(api.projects.removeProjectImage);
    const reorderImages = useMutation(api.projects.reorderProjectImages);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pending, setPending] = useState<PendingImage[]>([]);
    const [dragging, setDragging] = useState<{ list: 'pending' | 'committed'; index: number } | null>(null);
    const [committing, setCommitting] = useState(false);
    const [flash, setFlash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dropActive, setDropActive] = useState(false);
    /* Captions on committed images write straight through, so they are drafted here and sent on blur. */
    const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

    const { upload, progress, busy } = useImageUpload(
        (incoming) =>
            setPending((current) => {
                /* Re-entrant: the same keys come back with real URLs once the upload lands. */
                const byKey = new Map(current.map((image) => [image.key, image]));
                for (const image of incoming) {
                    const existing = byKey.get(image.key);
                    /* She may have captioned the card while it was uploading; the response carries a blank. */
                    byKey.set(image.key, { ...existing, ...image, title: existing?.title || image.title });
                }
                return [...byKey.values()];
            }),
        (update) => setPending((current) => current.map((image) => (image.key === update.key ? { ...image, ...update } : image))),
    );

    const ready = pending.filter((image) => image.stage === 'ready');
    const settled = pending.every((image) => image.stage === 'ready' || image.stage === 'failed');

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setFlash(null);
        setError(null);
        void upload(files);
    };

    const handleCommit = async () => {
        if (ready.length === 0) return;

        setCommitting(true);
        setError(null);
        try {
            const result = await addImages({
                projectId: projectId as Id<'projects'>,
                /* Committed in the order shown, so the arrangement above is what the site gets. */
                images: pending
                    .filter((image) => image.stage === 'ready')
                    .map((image) => ({
                        title: image.title.trim() || undefined,
                        imagePath: image.imagePath as string,
                        width: image.width as number,
                        height: image.height as number,
                        thumbnailPath: image.thumbnailPath,
                        thumbnailWidth: image.thumbnailWidth,
                        thumbnailHeight: image.thumbnailHeight,
                    })),
            });

            for (const image of pending) if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
            setPending([]);
            setFlash(`${result.added} ${result.added === 1 ? 'photo' : 'photos'} added to this project.`);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not save those photos.');
        } finally {
            setCommitting(false);
        }
    };

    const discardPending = () => {
        for (const image of pending) if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
        setPending([]);
        setError(null);
    };

    const commitOrder = (ordered: CommittedImage[]) =>
        reorderImages({
            projectId: projectId as Id<'projects'>,
            imageIds: ordered.map((image) => image._id) as Id<'projectImages'>[],
        });

    return (
        <div className="flex flex-col gap-5">
            <AdminPanel eyebrow="Photos" title={pending.length > 0 ? `Ready to add · ${ready.length} of ${pending.length}` : 'Add photos'}>
                <div className="p-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(event) => {
                            handleFiles(event.target.files);
                            event.target.value = '';
                        }}
                        className="sr-only"
                    />

                    <div
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDropActive(true);
                        }}
                        onDragLeave={() => setDropActive(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setDropActive(false);
                            handleFiles(event.dataTransfer.files);
                        }}
                        className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed px-5 py-8 text-center transition-colors ${
                            dropActive ? 'border-gold-300 bg-gold-400/5' : 'border-line'
                        }`}
                    >
                        <ImagePlus size={24} aria-hidden="true" className="text-body-subtle" />
                        <div className="flex flex-col gap-1">
                            <strong className="text-body text-sm font-bold">Drop photos here</strong>
                            <span className="text-body-muted text-xs">
                                They stay here until you add them, so you can caption and reorder first.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={busy}
                            className="border-line-strong text-body hover:bg-surface-hover inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {busy ? (
                                <Loader2 size={15} aria-hidden="true" className="animate-spin" />
                            ) : (
                                <Upload size={15} aria-hidden="true" />
                            )}
                            {busy ? `Uploading… ${progress}%` : 'Choose photos'}
                        </button>
                    </div>

                    {busy && (
                        <div
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Upload progress"
                            className="bg-surface mt-3 h-1.5 w-full overflow-hidden rounded-full"
                        >
                            <div className="bg-gold-400 h-full transition-[width] duration-300" style={{ width: `${progress}%` }} />
                        </div>
                    )}

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

                    {pending.length > 0 && (
                        <>
                            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
                                {pending.map((image, index) => (
                                    <ProjectImageCard
                                        key={image.key}
                                        src={image.imagePath ?? image.previewUrl}
                                        title={image.title}
                                        fileName={image.fileName}
                                        stage={image.stage}
                                        error={image.error}
                                        position={index}
                                        total={pending.length}
                                        dragging={dragging?.list === 'pending' && dragging.index === index}
                                        onTitleChange={(title) =>
                                            setPending((current) => current.map((row) => (row.key === image.key ? { ...row, title } : row)))
                                        }
                                        onRemove={() => {
                                            if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
                                            setPending((current) => current.filter((row) => row.key !== image.key));
                                        }}
                                        onMove={(direction) => setPending((current) => move(current, index, index + direction))}
                                        onDragStart={() => setDragging({ list: 'pending', index })}
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={() => {
                                            if (dragging?.list !== 'pending') return;
                                            setPending((current) => move(current, dragging.index, index));
                                            setDragging(null);
                                        }}
                                        onDragEnd={() => setDragging(null)}
                                    />
                                ))}
                            </ul>

                            <div className="border-line mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
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
                            </div>
                        </>
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
                                <ProjectImageCard
                                    key={image._id}
                                    src={image.thumbnailPath ?? image.imagePath}
                                    title={captionDrafts[image._id] ?? image.title ?? ''}
                                    position={index}
                                    total={images.length}
                                    dragging={dragging?.list === 'committed' && dragging.index === index}
                                    onTitleChange={(title) => setCaptionDrafts((current) => ({ ...current, [image._id]: title }))}
                                    onTitleCommit={() => {
                                        const draft = captionDrafts[image._id];
                                        if (draft === undefined || draft === (image.title ?? '')) return;
                                        void updateImage({ imageId: image._id as Id<'projectImages'>, title: draft });
                                    }}
                                    onRemove={() => removeImage({ imageId: image._id as Id<'projectImages'> })}
                                    onMove={(direction) => commitOrder(move(images, index, index + direction))}
                                    onDragStart={() => setDragging({ list: 'committed', index })}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={() => {
                                        if (dragging?.list !== 'committed') return;
                                        void commitOrder(move(images, dragging.index, index));
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
