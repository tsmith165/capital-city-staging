'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import ImageOrderingSection from './ImageOrderingSection';

interface ImageEditorConvexProps {
    inventoryId: string;
}

const ImageEditorConvex: React.FC<ImageEditorConvexProps> = ({ inventoryId }) => {
    const [imageUrl, setImageUrl] = useState('Not yet uploaded');
    const [title, setTitle] = useState('Not yet uploaded');
    const [selectedOption, setSelectedOption] = useState('extra');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [smallImageUrl, setSmallImageUrl] = useState('Not yet uploaded');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const router = useRouter();
    
    // Convex mutations
    const updateInventory = useMutation(api.inventory.updateInventory);
    const addExtraImage = useMutation(api.inventory.addExtraImage);
    const deleteExtraImage = useMutation(api.inventory.deleteExtraImage);
    
    // Get inventory item to show current images
    const inventoryItem = useQuery(api.inventory.getInventoryItem, { 
        id: inventoryId as Id<"inventory"> 
    });

    const resetInputs = useCallback(() => {
        console.log('Resetting inputs');
        setImageUrl('Not yet uploaded');
        setTitle('Not yet uploaded');
        setWidth(0);
        setHeight(0);
        setSmallImageUrl('Not yet uploaded');
        setSmallWidth(0);
        setSmallHeight(0);
        setIsSubmitting(false);
        setStatusMessage(null);
    }, []);

    const handleUploadComplete = useCallback(
        (
            fileName: string,
            originalImageUrl: string,
            smallImageUrl: string,
            originalWidth: number,
            originalHeight: number,
            smallWidth: number,
            smallHeight: number,
        ) => {
            console.log('handleUploadComplete called with:', {
                fileName,
                originalImageUrl,
                smallImageUrl,
                originalWidth,
                originalHeight,
                smallWidth,
                smallHeight,
            });

            setTitle(fileName.split('.')[0] || 'Not yet uploaded');
            setImageUrl(originalImageUrl);
            setSmallImageUrl(smallImageUrl);
            setWidth(originalWidth);
            setHeight(originalHeight);
            setSmallWidth(smallWidth);
            setSmallHeight(smallHeight);
            setIsSubmitting(false);
            setStatusMessage(null);
        },
        [],
    );

    const handleSubmit = async () => {
        if (imageUrl === 'Not yet uploaded') {
            setStatusMessage({ type: 'error', message: 'Please upload an image first' });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            if (selectedOption === 'main') {
                // Update main image
                await updateInventory({
                    id: inventoryId as Id<"inventory">,
                    updates: {
                        imagePath: imageUrl,
                        width: width,
                        height: height,
                        smallImagePath: smallImageUrl,
                        smallWidth: smallWidth,
                        smallHeight: smallHeight,
                    }
                });
                setStatusMessage({ type: 'success', message: 'Main image updated successfully!' });
            } else {
                // Add extra image
                await addExtraImage({
                    inventoryId: inventoryId as Id<"inventory">,
                    title: title,
                    imagePath: imageUrl,
                    width: width,
                    height: height,
                    smallImagePath: smallImageUrl,
                    smallWidth: smallWidth,
                    smallHeight: smallHeight,
                });
                setStatusMessage({ type: 'success', message: 'Extra image added successfully!' });
            }

            // Reset form after successful upload
            setTimeout(() => {
                resetInputs();
                router.refresh();
            }, 2000);

        } catch (error) {
            console.error('Error saving image:', error);
            setStatusMessage({ 
                type: 'error', 
                message: error instanceof Error ? error.message : 'Failed to save image' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const options = [
        { value: 'extra', label: 'Extra Image' },
        { value: 'main', label: 'Main Image' },
    ];

    const handleReset = () => {
        resetInputs();
    };

    // Helper function to get all images
    const getAllImages = () => {
        if (!inventoryItem) return [];
        
        const images: Array<{
            src: string;
            label: string;
            isMain: boolean;
            _id: string | null;
        }> = [
            {
                src: inventoryItem.imagePath,
                label: 'Main Image',
                isMain: true,
                _id: null
            }
        ];
        
        if (inventoryItem.extraImages) {
            inventoryItem.extraImages.forEach((img: any, idx: number) => {
                images.push({
                    src: img.imagePath,
                    label: `Extra ${idx + 1}`,
                    isMain: false,
                    _id: img._id
                });
            });
        }
        
        return images;
    };

    const allImages = getAllImages();
    const currentImage = allImages[currentImageIndex] || null;

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0);
    };

    const handleDotClick = (index: number) => {
        setCurrentImageIndex(index);
    };

    return (
        <div className="flex h-full w-full bg-stone-900">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row h-full">
                {/* Header - full width on mobile, hidden on desktop */}
                <div className="md:hidden w-full p-4 text-center text-3xl font-bold gradient-secondary-main-text">
                    Edit Images
                </div>

                {/* Images Section - Top on mobile, Left on desktop */}
                <div className="w-full md:w-2/5 p-4 flex flex-col">
                    {/* Desktop Header */}
                    <div className="hidden md:block text-center text-4xl font-bold gradient-secondary-main-text mb-6">
                        Edit Images
                    </div>

                    {/* Current Image Display */}
                    {inventoryItem && allImages.length > 0 && (
                        <div className="flex-grow flex flex-col items-center justify-center">
                            <div className="relative w-full max-w-sm aspect-square bg-stone-800 rounded-lg overflow-hidden mb-4">
                                <img 
                                    src={currentImage?.src} 
                                    alt={currentImage?.label} 
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Delete button for extra images */}
                                {currentImage && !currentImage.isMain && currentImage._id && (
                                    <button
                                        onClick={async () => {
                                            if (confirm('Delete this extra image?')) {
                                                try {
                                                    await deleteExtraImage({ id: currentImage._id as Id<"extraImages"> });
                                                    // Reset to first image after deletion
                                                    setCurrentImageIndex(0);
                                                    router.refresh();
                                                } catch (error) {
                                                    console.error('Failed to delete image:', error);
                                                }
                                            }
                                        }}
                                        className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full hover:bg-red-700 flex items-center justify-center transition-colors"
                                        title="Delete Image"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            {/* Image Label */}
                            <div className="text-center mb-4">
                                <span className="text-lg font-medium text-stone-200">
                                    {currentImage?.label}
                                </span>
                            </div>

                            {/* Pagination Controls */}
                            {allImages.length > 1 && (
                                <div className="flex items-center space-x-3">
                                    {/* Left Arrow */}
                                    <button
                                        onClick={handlePrevImage}
                                        className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-full flex items-center justify-center text-stone-300 hover:text-stone-100 transition-colors"
                                        title="Previous Image"
                                    >
                                        ←
                                    </button>

                                    {/* Dots */}
                                    <div className="flex space-x-2">
                                        {allImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleDotClick(index)}
                                                className={`w-3 h-3 rounded-full transition-colors ${
                                                    index === currentImageIndex 
                                                        ? 'bg-stone-500' 
                                                        : 'bg-stone-700 hover:bg-stone-600'
                                                }`}
                                                title={`View ${allImages[index].label}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Right Arrow */}
                                    <button
                                        onClick={handleNextImage}
                                        className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-full flex items-center justify-center text-stone-300 hover:text-stone-100 transition-colors"
                                        title="Next Image"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Image Ordering Section - Below images on desktop */}
                    <div className="hidden md:block w-full">
                        <ImageOrderingSection
                            inventoryId={inventoryId as Id<"inventory">}
                            allImages={allImages}
                            onReorderComplete={() => router.refresh()}
                        />
                    </div>
                </div>

                {/* Form Section - Bottom on mobile, Right on desktop */}
                <div className="w-full md:w-3/5 p-4 overflow-y-auto">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-bold text-stone-200 mb-6">Upload New Image</h2>
                        
                        <div className="space-y-4">
                            <ResizeUploader
                                handleUploadComplete={handleUploadComplete}
                                handleResetInputs={resetInputs}
                                backToEditLink={`/admin/edit?id=${inventoryItem?.oId || ''}`}
                            />
                            
                            <InputSelect
                                idName="inventory_type"
                                key="image_type"
                                name="Image Type"
                                defaultValue={{ value: selectedOption, label: selectedOption === 'extra' ? 'Add Extra Image' : 'Modify Main Image' }}
                                select_options={[
                                    ['main', 'Modify Main Image'],
                                    ['extra', 'Add Extra Image'],
                                ]}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            />
                            
                            <InputTextbox 
                                idName="title" 
                                name="Title" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                            />
                            <InputTextbox 
                                idName="image_path" 
                                name="Image Path" 
                                value={imageUrl}
                            />
                            <InputTextbox 
                                idName="px_width" 
                                name="Width (px)" 
                                value={width.toString()}
                            />
                            <InputTextbox 
                                idName="px_height" 
                                name="Height (px)" 
                                value={height.toString()}
                            />
                            <InputTextbox 
                                idName="small_image_path" 
                                name="Small Path" 
                                value={smallImageUrl}
                            />
                            <InputTextbox 
                                idName="small_px_width" 
                                name="Sm Width" 
                                value={smallWidth.toString()}
                            />
                            <InputTextbox 
                                idName="small_px_height" 
                                name="Sm Height" 
                                value={smallHeight.toString()}
                            />
                            
                            {imageUrl !== '' && imageUrl !== null ? null : width < 800 && height < 800 ? (
                                <div className="text-red-500">Warning: Image width and height are less than 800px.</div>
                            ) : width < 800 ? (
                                <div className="text-red-500">Warning: Image width is less than 800px.</div>
                            ) : height < 800 ? (
                                <div className="text-red-500">Warning: Image height is less than 800px.</div>
                            ) : null}
                            
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={isSubmitting}
                                    className={
                                        'relative rounded-md px-4 py-2 text-lg font-bold transition-colors ' +
                                        (!isSubmitting
                                            ? 'bg-stone-600 text-stone-300 hover:bg-stone-500 hover:text-stone-100'
                                            : 'cursor-not-allowed bg-stone-300 text-secondary_dark')
                                    }
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || imageUrl === 'Not yet uploaded'}
                                    className={
                                        'relative rounded-md px-6 py-2 text-lg font-bold transition-colors ' +
                                        (!isSubmitting && imageUrl !== 'Not yet uploaded'
                                            ? 'bg-secondary text-stone-300 hover:bg-secondary_light hover:text-stone-100'
                                            : 'cursor-not-allowed bg-stone-300 text-secondary_dark hover:bg-stone-300 hover:text-red-600')
                                    }
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Image'}
                                </button>
                            </div>
                            
                            {statusMessage && (
                                <div
                                    className={`mt-4 rounded p-3 ${statusMessage.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}
                                >
                                    {statusMessage.message}
                                </div>
                            )}
                        </div>

                        {/* Image Ordering Section - Below form on mobile */}
                        <div className="md:hidden mt-8">
                            <ImageOrderingSection
                                inventoryId={inventoryId as Id<"inventory">}
                                allImages={allImages}
                                onReorderComplete={() => router.refresh()}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorConvex;