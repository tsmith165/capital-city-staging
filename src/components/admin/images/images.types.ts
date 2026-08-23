/** An upload in flight or finished, held in the browser until the batch is committed. */
export interface PendingImage {
    /** Stable client-side key. Not a Convex id — nothing is written yet. */
    key: string;
    fileName: string;
    title: string;
    stage: 'resizing' | 'uploading' | 'ready' | 'failed';
    error?: string;
    /** Populated once the upload lands. */
    imagePath?: string;
    width?: number;
    height?: number;
    thumbnailPath?: string;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    /** Local object URL, so a thumbnail is visible while the bytes are still going up. */
    previewUrl?: string;
}

/** One image already written to whatever it belongs to. */
export interface CommittedImage {
    _id: string;
    title?: string;
    imagePath: string;
    width: number;
    height: number;
    thumbnailPath?: string;
    displayOrder: number;
}

export const UPLOAD_STAGE_LABELS: Record<PendingImage['stage'], string> = {
    resizing: 'Resizing',
    uploading: 'Uploading',
    ready: 'Ready',
    failed: 'Failed',
};
