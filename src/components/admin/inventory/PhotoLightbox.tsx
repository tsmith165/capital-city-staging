'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

/** Full-size photo. Escape closes it, and the backdrop is a real button so it is reachable by tab. */
export default function PhotoLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-[60] grid place-items-center p-4">
            <button type="button" aria-label="Close photo" onClick={onClose} className="bg-ink/85 absolute inset-0" />
            <div className="relative max-h-full">
                <Image
                    src={src}
                    alt={alt}
                    width={1200}
                    height={900}
                    className="shadow-overlay max-h-[88vh] w-auto rounded-lg object-contain"
                />
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close photo"
                    className="border-line-strong bg-ink/80 text-body hover:bg-ink absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-md border backdrop-blur transition-colors"
                >
                    <X size={17} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
