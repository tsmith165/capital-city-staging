'use client';

import { useCallback, useRef, useState } from 'react';
import { generateReactHelpers } from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { reportUploadError } from '@/utils/uploads/uploadErrors';

import type { PendingImage } from './images.types';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

/**
 * Selecting files, resizing them, and getting them to storage — reported the whole way.
 *
 * The uploaders this replaces did all of this behind a single button label and then wrote every image
 * straight through, so a ten-image drop was silent until it was already irreversible. Here each file
 * appears the moment it is chosen, carries its own stage, and lands in a pending list that is not
 * written anywhere until it is committed.
 */

const MAX_EDGE = 1920;
const THUMBNAIL_EDGE = 450;

function resize(file: File, maxEdge: number): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.onload = (event) => {
            const image = new window.Image();
            image.onerror = () => reject(new Error(`${file.name} is not an image we can read`));
            image.onload = () => {
                if (image.width <= maxEdge && image.height <= maxEdge) return resolve(file);

                const ratio = Math.min(maxEdge / image.width, maxEdge / image.height);
                const canvas = document.createElement('canvas');
                canvas.width = image.width * ratio;
                canvas.height = image.height * ratio;
                canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(new File([blob], file.name, { type: file.type }));
                    else reject(new Error(`Could not resize ${file.name}`));
                }, file.type);
            };
            image.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

function measure(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error('Could not measure the uploaded image'));
        image.src = url;
    });
}

export function useImageUpload(onReady: (images: PendingImage[]) => void, onStageChange: (update: PendingImage) => void) {
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);
    /**
     * Maps the upload response back to the cards already on screen. Two files can share a name —
     * `IMG_0001.jpg` out of two different folders is the common case — so the batch index is folded
     * into the name we upload under. Keying on the raw file name loses one card per collision and
     * leaves the tray stuck waiting on an upload that already finished.
     */
    const cardsByUploadName = useRef(new Map<string, { key: string; fileName: string }>());

    const failRemaining = useCallback(
        (error: string) => {
            for (const card of cardsByUploadName.current.values()) {
                onStageChange({ key: card.key, stage: 'failed', error } as PendingImage);
            }
            cardsByUploadName.current.clear();
        },
        [onStageChange],
    );

    const { startUpload } = useUploadThing('imageUploader', {
        onUploadProgress: setProgress,
        onUploadError: (error: Error) => {
            reportUploadError(error, () => {});
            failRemaining('Upload failed');
            setBusy(false);
            setProgress(0);
        },
        onClientUploadComplete: async (response) => {
            try {
                const files = (response ?? []) as { name: string; url: string }[];
                const originals = files.filter((file) => !file.name.startsWith('small-'));

                const ready: PendingImage[] = [];
                for (const original of originals) {
                    const card = cardsByUploadName.current.get(original.name);
                    if (!card) continue;
                    cardsByUploadName.current.delete(original.name);

                    const small = files.find((file) => file.name === `small-${original.name}`);
                    const [full, thumb] = await Promise.all([measure(original.url), small ? measure(small.url) : Promise.resolve(null)]);

                    ready.push({
                        key: card.key,
                        fileName: card.fileName,
                        title: '',
                        stage: 'ready',
                        imagePath: original.url,
                        width: full.width,
                        height: full.height,
                        thumbnailPath: small?.url,
                        thumbnailWidth: thumb?.width,
                        thumbnailHeight: thumb?.height,
                    });
                }

                onReady(ready);
                /* Anything storage never returned would otherwise sit on "Uploading" forever. */
                failRemaining('Storage did not return this file');
            } finally {
                cardsByUploadName.current.clear();
                setBusy(false);
                setProgress(0);
            }
        },
    });

    const upload = useCallback(
        async (fileList: FileList) => {
            const files = Array.from(fileList);
            if (files.length === 0) return;

            setBusy(true);
            setProgress(0);
            cardsByUploadName.current.clear();

            /* Every file gets a card immediately, so nothing about the batch is invisible. */
            const staged = files.map((file, index) => {
                const key = `${file.name}-${index}-${file.size}`;
                const uploadName = `${index}-${file.name}`;
                cardsByUploadName.current.set(uploadName, { key, fileName: file.name });
                return {
                    key,
                    uploadName,
                    fileName: file.name,
                    title: '',
                    stage: 'resizing' as const,
                    previewUrl: URL.createObjectURL(file),
                };
            });
            onReady(staged.map(({ uploadName: _uploadName, ...card }) => card));

            const toUpload: File[] = [];
            for (const [index, file] of files.entries()) {
                const { key, uploadName } = staged[index];
                try {
                    const [full, small] = await Promise.all([resize(file, MAX_EDGE), resize(file, THUMBNAIL_EDGE)]);
                    toUpload.push(
                        new File([small], `small-${uploadName}`, { type: small.type }),
                        new File([full], uploadName, { type: full.type }),
                    );
                    onStageChange({ key, stage: 'uploading' } as PendingImage);
                } catch (error) {
                    onStageChange({
                        key,
                        stage: 'failed',
                        error: error instanceof Error ? error.message : 'Could not prepare this file',
                    } as PendingImage);
                    cardsByUploadName.current.delete(uploadName);
                }
            }

            if (toUpload.length === 0) {
                setBusy(false);
                return;
            }

            await startUpload(toUpload);
        },
        [onReady, onStageChange, startUpload],
    );

    return { upload, progress, busy };
}
