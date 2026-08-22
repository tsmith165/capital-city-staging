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
 * The old uploader did all of this behind a single button label and then wrote every image straight
 * onto the project, so a ten-image drop was silent until it was already irreversible. Here each file
 * appears the moment it is chosen, carries its own stage, and lands in a pending list that is not
 * written anywhere until she says so.
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
    /* Maps the upload response back to the cards already on screen, which are keyed client-side. */
    const keysByFileName = useRef(new Map<string, string>());

    const { startUpload } = useUploadThing('imageUploader', {
        onUploadProgress: setProgress,
        onUploadError: (error: Error) => {
            reportUploadError(error, () => {});
            for (const key of keysByFileName.current.values()) {
                onStageChange({ key, stage: 'failed', error: 'Upload failed' } as PendingImage);
            }
            setBusy(false);
            setProgress(0);
        },
        onClientUploadComplete: async (response) => {
            try {
                const files = (response ?? []) as { name: string; url: string }[];
                const originals = files.filter((file) => !file.name.startsWith('small-'));

                const ready: PendingImage[] = [];
                for (const original of originals) {
                    const key = keysByFileName.current.get(original.name);
                    if (!key) continue;

                    const small = files.find((file) => file.name === `small-${original.name}`);
                    const [full, thumb] = await Promise.all([measure(original.url), small ? measure(small.url) : Promise.resolve(null)]);

                    ready.push({
                        key,
                        fileName: original.name,
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
            } finally {
                keysByFileName.current.clear();
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
            keysByFileName.current.clear();

            /* Every file gets a card immediately, so nothing about the batch is invisible. */
            const staged = files.map((file, index) => {
                const key = `${file.name}-${index}-${file.size}`;
                keysByFileName.current.set(file.name, key);
                return {
                    key,
                    fileName: file.name,
                    title: '',
                    stage: 'resizing' as const,
                    previewUrl: URL.createObjectURL(file),
                };
            });
            onReady(staged);

            const toUpload: File[] = [];
            for (const [index, file] of files.entries()) {
                try {
                    const [full, small] = await Promise.all([resize(file, MAX_EDGE), resize(file, THUMBNAIL_EDGE)]);
                    toUpload.push(new File([small], `small-${file.name}`, { type: small.type }), full);
                    onStageChange({ key: staged[index].key, stage: 'uploading' } as PendingImage);
                } catch (error) {
                    onStageChange({
                        key: staged[index].key,
                        stage: 'failed',
                        error: error instanceof Error ? error.message : 'Could not prepare this file',
                    } as PendingImage);
                    keysByFileName.current.delete(file.name);
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
