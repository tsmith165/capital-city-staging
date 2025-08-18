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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
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
        <div className="container mx-auto max-w-4xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    Manage Images for: {inventoryItem?.name || 'Loading...'}
                </h1>
                <button
                    onClick={() => router.back()}
                    className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                    Back
                </button>
            </div>

            {/* Current Images Display */}
            {inventoryItem && (
                <div className="mb-8 rounded-lg bg-gray-100 p-4">
                    <h2 className="mb-4 text-xl font-semibold">Current Images</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <img 
                                src={inventoryItem.imagePath} 
                                alt="Main" 
                                className="w-full rounded border-2 border-primary"
                            />
                            <span className="text-sm font-medium">Main Image</span>
                        </div>
                        {inventoryItem.extraImages?.map((img: any, idx: number) => (
                            <div key={img._id} className="relative text-center group">
                                <img 
                                    src={img.imagePath} 
                                    alt={`Extra ${idx + 1}`}
                                    className="w-full rounded border"
                                />
                                <span className="text-sm">Extra {idx + 1}</span>
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
                                    className="absolute top-1 right-1 hidden group-hover:block bg-red-500 text-white p-1 rounded hover:bg-red-600"
                                    title="Delete Image"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-lg">
                <h2 className="text-2xl font-bold">Upload New Image</h2>

                {statusMessage && (
                    <div className={`rounded p-3 ${
                        statusMessage.type === 'success' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {statusMessage.message}
                    </div>
                )}

                <InputSelect
                    idName="image_type"
                    name="Image Type"
                    select_options={[
                        ['extra', 'Extra Image'],
                        ['main', 'Main Image']
                    ]}
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                />

                <ResizeUploader
                    handleUploadComplete={handleUploadComplete}
                    handleResetInputs={resetInputs}
                    backToEditLink={`/admin/edit?id=${inventoryItem?.oId || ''}`}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={true}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Size Image URL</label>
                        <input
                            type="text"
                            value={imageUrl}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Small Image URL</label>
                        <input
                            type="text"
                            value={smallImageUrl}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Width</label>
                        <input
                            type="text"
                            value={width.toString()}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Height</label>
                        <input
                            type="text"
                            value={height.toString()}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Small Width</label>
                        <input
                            type="text"
                            value={smallWidth.toString()}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Small Height</label>
                        <input
                            type="text"
                            value={smallHeight.toString()}
                            disabled={true}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || imageUrl === 'Not yet uploaded'}
                        className="rounded bg-primary px-6 py-2 text-white hover:bg-primary_dark disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Image'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ImageEditorConvex;