'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface ImageOrderingSectionProps {
    inventoryId: Id<"inventory">;
    allImages: Array<{
        src: string;
        label: string;
        isMain: boolean;
        _id: string | null;
    }>;
    onReorderComplete?: () => void;
}

const ImageOrderingSection: React.FC<ImageOrderingSectionProps> = ({ 
    inventoryId, 
    allImages, 
    onReorderComplete 
}) => {
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

    const handleDelete = async (imageId: string | null, position: number) => {
        if (!imageId) return; // Can't delete main image
        
        if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(imageId);
            await deleteExtraImage({ id: imageId as Id<"extraImages"> });
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
            <div className="w-full mt-6">
                <h3 className="text-lg font-semibold text-stone-200 mb-4">Image Order</h3>
                <div className="space-y-2">
                    {allImages.map((image, index) => {
                        const position = index + 1;
                        const isProcessing = isReordering === position;
                        const isDeletingThis = isDeleting === image._id;
                        
                        return (
                            <div
                                key={`${image.src}-${position}`}
                                className={`flex items-center p-3 bg-stone-800 rounded-lg transition-opacity ${
                                    isProcessing || isDeletingThis ? 'opacity-50' : 'opacity-100'
                                }`}
                            >
                                {/* Thumbnail */}
                                <div className="w-12 h-12 relative flex-shrink-0 mr-3">
                                    <Image
                                        src={image.src}
                                        alt={image.label}
                                        fill
                                        className="object-cover rounded"
                                        sizes="48px"
                                    />
                                </div>

                                {/* Position Badge */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${
                                    image.isMain ? 'bg-secondary' : 'bg-stone-600'
                                }`}>
                                    {position}
                                </div>

                                {/* Filename */}
                                <div className="flex-grow min-w-0">
                                    <span className="text-stone-200 text-sm truncate block">
                                        {getImageFilename(image.src)}
                                    </span>
                                    {image.isMain && (
                                        <span className="text-xs text-secondary">Main Image</span>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex space-x-1 ml-3">
                                    <button
                                        onClick={() => handleMove(position, 'up')}
                                        disabled={isProcessing || isDeletingThis}
                                        className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded flex items-center justify-center text-stone-300 hover:text-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        data-tooltip-id={`move-up-${position}`}
                                        data-tooltip-content={`Move ${position === 1 ? 'main image to end (makes next image main)' : 'up one position'}`}
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleMove(position, 'down')}
                                        disabled={isProcessing || isDeletingThis}
                                        className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded flex items-center justify-center text-stone-300 hover:text-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        data-tooltip-id={`move-down-${position}`}
                                        data-tooltip-content={`Move ${position === allImages.length ? 'to start (may become main image)' : 'down one position'}`}
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(image._id, position)}
                                        disabled={isProcessing || isDeletingThis || image.isMain}
                                        className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                                            image.isMain
                                                ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
                                                : 'bg-stone-700 hover:bg-red-600 text-stone-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                        }`}
                                        data-tooltip-id={`delete-${position}`}
                                        data-tooltip-content={
                                            image.isMain 
                                                ? 'Main image cannot be deleted' 
                                                : isDeletingThis 
                                                    ? 'Deleting...' 
                                                    : 'Delete image'
                                        }
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-3 text-xs text-stone-400">
                    Use the arrows to reorder images. Position #1 is the main image. When you move the main image, the image that takes position #1 becomes the new main image.
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