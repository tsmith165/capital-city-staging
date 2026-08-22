'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LightboxImage {
    _id: string;
    imagePath: string;
    width: number;
    height: number;
}

interface PortfolioLightboxProps {
    images: LightboxImage[];
    index: number;
    projectName: string;
    onClose: () => void;
    onStep: (delta: number) => void;
}

/**
 * The previous overlay was click-only: no Escape, no arrow keys, no focus handling, and its
 * backdrop used `bg-opacity-85`, which Tailwind v4 removed, so it rendered fully opaque.
 */
export default function PortfolioLightbox({ images, index, projectName, onClose, onStep }: PortfolioLightboxProps) {
    const closeRef = useRef<HTMLButtonElement>(null);
    const image = images[index];

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowRight') onStep(1);
            if (event.key === 'ArrowLeft') onStep(-1);
        },
        [onClose, onStep],
    );

    useEffect(() => {
        closeRef.current?.focus();

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    if (!image) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`${projectName}, image ${index + 1} of ${images.length}`}
            className="bg-ink/90 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        >
            <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" />

            <Image
                key={image._id}
                src={image.imagePath}
                alt={`${projectName}, image ${index + 1}`}
                width={image.width}
                height={image.height}
                sizes="90vw"
                className="relative max-h-[88vh] w-auto max-w-[92vw] rounded-lg object-contain"
            />

            <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="border-line-strong bg-surface-raised/90 text-body hover:text-gold-300 absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-md border transition-colors"
            >
                <X size={20} aria-hidden="true" />
            </button>

            {images.length > 1 ? (
                <>
                    <button
                        type="button"
                        onClick={() => onStep(-1)}
                        aria-label="Previous image"
                        className="border-line-strong bg-surface-raised/90 text-body hover:text-gold-300 absolute left-3 grid h-12 w-12 place-items-center rounded-full border transition-colors sm:left-6"
                    >
                        <ChevronLeft size={24} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onStep(1)}
                        aria-label="Next image"
                        className="border-line-strong bg-surface-raised/90 text-body hover:text-gold-300 absolute right-3 grid h-12 w-12 place-items-center rounded-full border transition-colors sm:right-6"
                    >
                        <ChevronRight size={24} aria-hidden="true" />
                    </button>

                    <p className="border-line bg-surface-raised/90 text-body-muted absolute bottom-5 rounded-full border px-3.5 py-1.5 text-xs font-semibold">
                        {index + 1} / {images.length}
                    </p>
                </>
            ) : null}
        </div>
    );
}
