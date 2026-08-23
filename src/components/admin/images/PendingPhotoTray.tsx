'use client';

import { useRef, useState, type ReactNode } from 'react';
import { ImagePlus, Loader2, Upload } from 'lucide-react';

import EditableImageCard from './EditableImageCard';
import { useImageUpload } from './useImageUpload';
import type { PendingImage } from './images.types';

/**
 * Photos she has picked but not written anywhere yet: a drop zone, a card per file carrying its own
 * stage, and whatever action the surrounding surface uses to commit them. The project editor, the
 * inventory editor and the new-project form all stage uploads the same way, so they share this.
 *
 * The tray is controlled. Callers own the pending list because only they know what committing means.
 */

export function movePending<T>(items: T[], from: number, to: number) {
    if (to < 0 || to >= items.length) return items;
    const next = [...items];
    const [lifted] = next.splice(from, 1);
    next.splice(to, 0, lifted);
    return next;
}

/** True once every card has either landed or failed, so a commit cannot silently drop a file. */
export function pendingSettled(pending: PendingImage[]) {
    return pending.every((image) => image.stage === 'ready' || image.stage === 'failed');
}

export function readyPending(pending: PendingImage[]) {
    return pending.filter((image) => image.stage === 'ready');
}

export function revokePreviews(pending: PendingImage[]) {
    for (const image of pending) if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
}

export default function PendingPhotoTray({
    pending,
    onPendingChange,
    onFilesChosen,
    actions,
    disabled = false,
}: {
    pending: PendingImage[];
    onPendingChange: (update: (current: PendingImage[]) => PendingImage[]) => void;
    onFilesChosen?: () => void;
    /** Commit row rendered under the cards. Omitted when the surrounding form commits instead. */
    actions?: ReactNode;
    disabled?: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState<number | null>(null);
    const [dropActive, setDropActive] = useState(false);

    const { upload, progress, busy } = useImageUpload(
        (incoming) =>
            onPendingChange((current) => {
                /* Re-entrant: the same keys come back with real URLs once the upload lands. */
                const byKey = new Map(current.map((image) => [image.key, image]));
                for (const image of incoming) {
                    const existing = byKey.get(image.key);
                    /* She may have captioned the card while it was uploading; the response carries a blank. */
                    byKey.set(image.key, { ...existing, ...image, title: existing?.title || image.title });
                }
                return [...byKey.values()];
            }),
        (update) => onPendingChange((current) => current.map((image) => (image.key === update.key ? { ...image, ...update } : image))),
    );

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        onFilesChosen?.();
        void upload(files);
    };

    return (
        <>
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
                <strong className="text-body text-sm font-bold">Drop photos here</strong>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy || disabled}
                    className="border-line-strong text-body hover:bg-surface-hover inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50"
                >
                    {busy ? <Loader2 size={15} aria-hidden="true" className="animate-spin" /> : <Upload size={15} aria-hidden="true" />}
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

            {pending.length > 0 && (
                <>
                    <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
                        {pending.map((image, index) => (
                            <EditableImageCard
                                key={image.key}
                                src={image.imagePath ?? image.previewUrl}
                                title={image.title}
                                fileName={image.fileName}
                                stage={image.stage}
                                error={image.error}
                                position={index}
                                total={pending.length}
                                dragging={dragging === index}
                                onTitleChange={(title) =>
                                    onPendingChange((current) => current.map((row) => (row.key === image.key ? { ...row, title } : row)))
                                }
                                onRemove={() => {
                                    if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
                                    onPendingChange((current) => current.filter((row) => row.key !== image.key));
                                }}
                                onMove={(direction) => onPendingChange((current) => movePending(current, index, index + direction))}
                                onDragStart={() => setDragging(index)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => {
                                    if (dragging === null) return;
                                    onPendingChange((current) => movePending(current, dragging, index));
                                    setDragging(null);
                                }}
                                onDragEnd={() => setDragging(null)}
                            />
                        ))}
                    </ul>

                    {actions && <div className="border-line mt-4 flex flex-wrap items-center gap-2 border-t pt-4">{actions}</div>}
                </>
            )}
        </>
    );
}
