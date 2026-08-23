'use client';

import Image from 'next/image';
import { AlertCircle, Check, GripVertical, ImageOff, Loader2, MoveLeft, MoveRight, Trash2 } from 'lucide-react';

import { UPLOAD_STAGE_LABELS, type PendingImage } from './images.types';

/**
 * One image, in either list, on any surface that arranges photos.
 *
 * Pending and committed images differ only in when their edits land, so they are the same card. The
 * reorder controls are buttons as well as a drag handle: drag-only ordering cannot be operated from a
 * keyboard, and this is the control that decides which photo represents the thing everywhere else.
 */
export default function EditableImageCard({
    src,
    title,
    fileName,
    stage,
    error,
    position,
    total,
    dragging,
    badge,
    lockedTitle,
    canRemove = true,
    onTitleChange,
    onTitleCommit,
    onRemove,
    onMove,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}: {
    src?: string;
    title: string;
    fileName?: string;
    /** Omitted for images already on the project — those are, by definition, ready. */
    stage?: PendingImage['stage'];
    error?: string;
    position: number;
    total: number;
    dragging?: boolean;
    /** Replaces the position number, for a slot that means something more than its index. */
    badge?: string;
    /** Renders the caption as text instead of a field, where the caption is owned elsewhere. */
    lockedTitle?: string;
    canRemove?: boolean;
    onTitleChange: (title: string) => void;
    /** Fired on blur, for lists that write each edit straight through. */
    onTitleCommit?: () => void;
    onRemove: () => void;
    onMove: (direction: -1 | 1) => void;
    onDragStart?: () => void;
    onDragOver?: (event: React.DragEvent) => void;
    onDrop?: () => void;
    onDragEnd?: () => void;
}) {
    const busy = stage === 'resizing' || stage === 'uploading';
    const failed = stage === 'failed';

    return (
        <li
            draggable={!busy}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={`bg-surface-raised relative flex flex-col overflow-hidden rounded-lg border transition-colors ${
                failed ? 'border-danger/50' : dragging ? 'border-gold-300 opacity-60' : 'border-line hover:border-line-strong'
            }`}
        >
            <div className="bg-surface relative aspect-[4/3] w-full overflow-hidden">
                {src ? (
                    <Image
                        src={src}
                        alt={title || fileName || ''}
                        fill
                        unoptimized={src.startsWith('blob:')}
                        className={`object-cover ${busy ? 'opacity-50' : ''}`}
                        sizes="(max-width: 640px) 50vw, 25vw"
                    />
                ) : (
                    <span className="grid h-full w-full place-items-center">
                        <ImageOff size={20} aria-hidden="true" className="text-body-subtle" />
                    </span>
                )}

                <span
                    className={`absolute top-2 left-2 grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[11px] font-bold backdrop-blur ${
                        badge ? 'bg-gold-400/90 text-body-inverse' : 'bg-ink/80 text-body'
                    }`}
                >
                    {badge ?? position + 1}
                </span>

                {!busy && (
                    <span
                        aria-hidden="true"
                        className="bg-ink/70 text-body-subtle absolute top-2 right-2 grid h-6 w-6 cursor-grab place-items-center rounded backdrop-blur active:cursor-grabbing"
                    >
                        <GripVertical size={13} />
                    </span>
                )}

                {stage && stage !== 'ready' && (
                    <span
                        className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-bold backdrop-blur ${
                            failed ? 'bg-danger-soft text-danger' : 'bg-ink/80 text-body'
                        }`}
                    >
                        {failed ? (
                            <AlertCircle size={12} aria-hidden="true" />
                        ) : (
                            <Loader2 size={12} aria-hidden="true" className="animate-spin" />
                        )}
                        {error ?? UPLOAD_STAGE_LABELS[stage]}
                    </span>
                )}

                {stage === 'ready' && (
                    <span className="bg-success-soft text-success absolute right-2 bottom-2 grid h-6 w-6 place-items-center rounded-full">
                        <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2 p-2.5">
                {lockedTitle === undefined ? (
                    <label className="flex flex-col gap-1">
                        <span className="sr-only">Caption for image {position + 1}</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => onTitleChange(event.target.value)}
                            onBlur={onTitleCommit}
                            placeholder={fileName ?? 'Add a caption'}
                            className="border-line bg-surface text-body placeholder:text-body-subtle focus-visible:border-gold-300 w-full rounded border px-2 py-1.5 text-xs outline-none"
                        />
                    </label>
                ) : (
                    <p className="text-body-subtle truncate px-0.5 py-1.5 text-xs">{lockedTitle}</p>
                )}

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onMove(-1)}
                        disabled={position === 0}
                        aria-label={`Move image ${position + 1} earlier`}
                        className="border-line text-body-subtle hover:bg-surface-hover hover:text-body grid h-8 w-8 place-items-center rounded border transition-colors disabled:opacity-30"
                    >
                        <MoveLeft size={13} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove(1)}
                        disabled={position === total - 1}
                        aria-label={`Move image ${position + 1} later`}
                        className="border-line text-body-subtle hover:bg-surface-hover hover:text-body grid h-8 w-8 place-items-center rounded border transition-colors disabled:opacity-30"
                    >
                        <MoveRight size={13} aria-hidden="true" />
                    </button>
                    {canRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            aria-label={`Remove image ${position + 1}`}
                            className="border-line text-body-subtle hover:border-danger/50 hover:bg-danger-soft hover:text-danger ml-auto grid h-8 w-8 place-items-center rounded border transition-colors"
                        >
                            <Trash2 size={13} aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
}
