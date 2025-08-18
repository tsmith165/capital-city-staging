'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';

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

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-stone-900">
            <div className="flex w-4/5 flex-col items-center justify-center rounded-lg bg-stone-900">
                <div id="header" className="w-full rounded-t-lg text-center text-4xl font-bold gradient-secondary-main-text">
                    Edit Images
                </div>

                {/* Compact Current Images Display */}
                {inventoryItem && (
                    <div className="w-full mb-4 p-3 bg-stone-800 rounded-lg">
                        <h3 className="mb-2 text-lg font-semibold text-stone-200">Current Images</h3>
                        <div className="flex gap-3 overflow-x-auto">
                            <div className="flex-shrink-0 text-center">
                                <img 
                                    src={inventoryItem.imagePath} 
                                    alt="Main" 
                                    className="w-16 h-16 object-cover rounded border-2 border-secondary"
                                />
                                <span className="text-xs text-stone-400 block mt-1">Main</span>
                            </div>
                            {inventoryItem.extraImages?.map((img: any, idx: number) => (
                                <div key={img._id} className="flex-shrink-0 relative text-center group">
                                    <img 
                                        src={img.imagePath} 
                                        alt={`Extra ${idx + 1}`}
                                        className="w-16 h-16 object-cover rounded border border-stone-600"
                                    />
                                    <span className="text-xs text-stone-400 block mt-1">Extra {idx + 1}</span>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Delete this extra image?')) {
                                                try {
                                                    await deleteExtraImage({ id: img._id });
                                                    router.refresh();
                                                } catch (error) {
                                                    console.error('Failed to delete image:', error);
                                                }
                                            }
                                        }}
                                        className="absolute -top-1 -right-1 hidden group-hover:block bg-red-600 text-white w-4 h-4 text-xs rounded-full hover:bg-red-700 flex items-center justify-center"
                                        title="Delete Image"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex w-full flex-col items-center space-y-2 p-2">
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
                    
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className={
                                'relative rounded-md px-4 py-1 text-lg font-bold ' +
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
                                'relative rounded-md px-4 py-1 text-lg font-bold ' +
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
                            className={`mt-4 rounded p-2 ${statusMessage.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}
                        >
                            {statusMessage.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditorConvex;