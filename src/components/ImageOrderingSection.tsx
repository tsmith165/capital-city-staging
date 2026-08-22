'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface ImageOrderingSectionProps {
    inventoryId: Id<'inventory'>;
    allImages: Array<{
        src: string;
        label: string;
        isMain: boolean;
        _id: string | null;
    }>;
    onReorderComplete?: () => void;
}

const ImageOrderingSection: React.FC<ImageOrderingSectionProps> = ({ inventoryId, allImages, onReorderComplete }) => {
    const [isReordering, setIsReordering] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const reorderImages = useMutation(api.inventory.reorderImagesBySwapping);
    const deleteExtraImage = useMutation(api.inventory.deleteExtraImage);

    const handleMove = async (currentPosition: number, direction: 'up' | 'down') => {
        const totalImages = allImages.length;
        let targetPosition: number;

        if (direction === 'up') {
            // Wrap around: if position 1, move to last position
            targetPosition = currentPosition === 1 ? totalImages : currentPosition - 1;
        } else {
            // Wrap around: if last position, move to position 1
            targetPosition = currentPosition === totalImages ? 1 : currentPosition + 1;
        }

        try {
            setIsReordering(currentPosition);
            await reorderImages({
                inventoryId,
                position1: currentPosition,
                position2: targetPosition,
            });
            onReorderComplete?.();
        } catch (error) {
            console.error('Failed to reorder images:', error);
        } finally {
            setIsReordering(null);
        }
    };

    const handleDelete = async (imageId: string | null, _position: number) => {
        if (!imageId) return; // Can't delete main image

        if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(imageId);
            await deleteExtraImage({ id: imageId as Id<'extraImages'> });
            onReorderComplete?.();
        } catch (error) {
            console.error('Failed to delete image:', error);
        } finally {
            setIsDeleting(null);
        }
    };

    const getImageFilename = (src: string) => {
        return src.split('/').pop() || src;
    };

    if (allImages.length <= 1) {
        return null; // No need to show reordering if there's only one image
    }

    return (
        <>
            <div className="mt-6 w-full">
                <h3 className="text-body mb-4 text-lg font-semibold">Image Order</h3>
                <div className="space-y-2">
                    {allImages.map((image, index) => {
                        const position = index + 1;
                        const isProcessing = isReordering === position;
                        const isDeletingThis = isDeleting === image._id;

                        return (
                            <div
                                key={`${image.src}-${position}`}
                                className={`bg-surface-raised flex items-center rounded-lg p-3 transition-opacity ${
                                    isProcessing || isDeletingThis ? 'opacity-50' : 'opacity-100'
                                }`}
                            >
                                {/* Thumbnail */}
                                <div className="relative mr-3 h-12 w-12 flex-shrink-0">
                                    <Image src={image.src} alt={image.label} fill className="rounded object-cover" sizes="48px" />
                                </div>

                                {/* Position Badge */}
                                <div
                                    className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                                        image.isMain ? 'bg-secondary' : 'bg-surface-hover'
                                    }`}
                                >
                                    {position}
                                </div>

                                {/* Filename */}
                                <div className="min-w-0 flex-grow">
                                    <span className="text-body block truncate text-sm">{getImageFilename(image.src)}</span>
                                    {image.isMain && <span className="text-secondary text-xs">Main Image</span>}
                                </div>

                                {/* Controls */}
                                <div className="ml-3 flex space-x-1">
                                    <button
                                        onClick={() => handleMove(position, 'up')}
                                        disabled={isProcessing || isDeletingThis}
                                        className="bg-surface-overlay hover:bg-surface-hover text-body-muted hover:text-body flex h-8 w-8 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                        data-tooltip-id={`move-up-${position}`}
                                        data-tooltip-content={`Move ${position === 1 ? 'main image to end (makes next image main)' : 'up one position'}`}
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleMove(position, 'down')}
                                        disabled={isProcessing || isDeletingThis}
                                        className="bg-surface-overlay hover:bg-surface-hover text-body-muted hover:text-body flex h-8 w-8 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                        data-tooltip-id={`move-down-${position}`}
                                        data-tooltip-content={`Move ${position === allImages.length ? 'to start (may become main image)' : 'down one position'}`}
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(image._id, position)}
                                        disabled={isProcessing || isDeletingThis || image.isMain}
                                        className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${
                                            image.isMain
                                                ? 'bg-surface-overlay text-body-subtle cursor-not-allowed'
                                                : 'bg-surface-overlay text-body-muted hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
                                        }`}
                                        data-tooltip-id={`delete-${position}`}
                                        data-tooltip-content={
                                            image.isMain ? 'Main image cannot be deleted' : isDeletingThis ? 'Deleting...' : 'Delete image'
                                        }
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-body-subtle mt-3 text-xs">
                    Use the arrows to reorder images. Position #1 is the main image. When you move the main image, the image that takes
                    position #1 becomes the new main image.
                </div>
            </div>

            {/* Tooltips */}
            {allImages.map((_, index) => {
                const position = index + 1;
                return (
                    <div key={`tooltips-${position}`}>
                        <Tooltip id={`move-up-${position}`} />
                        <Tooltip id={`move-down-${position}`} />
                        <Tooltip id={`delete-${position}`} />
                    </div>
                );
            })}
        </>
    );
};

export default ImageOrderingSection;
