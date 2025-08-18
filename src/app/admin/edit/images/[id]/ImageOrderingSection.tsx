'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

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
    const reorderImages = useMutation(api.inventory.reorderImagesBySwapping);

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

    const getImageFilename = (src: string) => {
        return src.split('/').pop() || src;
    };

    if (allImages.length <= 1) {
        return null; // No need to show reordering if there's only one image
    }

    return (
        <div className="w-full mt-6">
            <h3 className="text-lg font-semibold text-stone-200 mb-4">Image Order</h3>
            <div className="space-y-2">
                {allImages.map((image, index) => {
                    const position = index + 1;
                    const isProcessing = isReordering === position;
                    
                    return (
                        <div
                            key={`${image.src}-${position}`}
                            className={`flex items-center p-3 bg-stone-800 rounded-lg transition-opacity ${
                                isProcessing ? 'opacity-50' : 'opacity-100'
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

                            {/* Arrow Controls */}
                            <div className="flex space-x-1 ml-3">
                                <button
                                    onClick={() => handleMove(position, 'up')}
                                    disabled={isProcessing}
                                    className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded flex items-center justify-center text-stone-300 hover:text-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={`Move ${position === 1 ? 'to end' : 'up'}`}
                                >
                                    <IoIosArrowUp size={16} />
                                </button>
                                <button
                                    onClick={() => handleMove(position, 'down')}
                                    disabled={isProcessing}
                                    className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded flex items-center justify-center text-stone-300 hover:text-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={`Move ${position === allImages.length ? 'to start' : 'down'}`}
                                >
                                    <IoIosArrowDown size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-3 text-xs text-stone-400">
                Use the arrows to reorder images. Position #1 becomes the main image.
            </div>
        </div>
    );
};

export default ImageOrderingSection;