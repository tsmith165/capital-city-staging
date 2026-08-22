'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { X, Upload, Check, Loader2 } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import ResizeUploader from './ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';

interface ImageUploadOverlayProps {
    inventoryId: Id<'inventory'>;
    inventoryOId: number;
    mode: 'main' | 'extra';
    onClose: () => void;
    onSuccess: () => void;
}

const ImageUploadOverlay: React.FC<ImageUploadOverlayProps> = ({ inventoryId, inventoryOId, mode, onClose, onSuccess }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [title, setTitle] = useState('');
    const [selectedOption, setSelectedOption] = useState(mode);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [smallImageUrl, setSmallImageUrl] = useState('');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const updateInventory = useMutation(api.inventory.updateInventory);
    const addExtraImage = useMutation(api.inventory.addExtraImage);

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
            console.log('Upload complete:', {
                fileName,
                originalImageUrl,
                smallImageUrl,
                originalWidth,
                originalHeight,
                smallWidth,
                smallHeight,
            });

            setTitle(fileName.split('.')[0] || '');
            setImageUrl(originalImageUrl);
            setSmallImageUrl(smallImageUrl);
            setWidth(originalWidth);
            setHeight(originalHeight);
            setSmallWidth(smallWidth);
            setSmallHeight(smallHeight);
            setStatusMessage(null);
        },
        [],
    );

    const resetInputs = useCallback(() => {
        setImageUrl('');
        setTitle('');
        setWidth(0);
        setHeight(0);
        setSmallImageUrl('');
        setSmallWidth(0);
        setSmallHeight(0);
        setStatusMessage(null);
    }, []);

    const handleSubmit = async () => {
        if (!imageUrl) {
            setStatusMessage({ type: 'error', message: 'Please upload an image first' });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            if (selectedOption === 'main') {
                // Update main image
                await updateInventory({
                    id: inventoryId,
                    updates: {
                        imagePath: imageUrl,
                        width: width,
                        height: height,
                        smallImagePath: smallImageUrl,
                        smallWidth: smallWidth,
                        smallHeight: smallHeight,
                    },
                });
                setStatusMessage({ type: 'success', message: 'Main image updated successfully!' });
            } else {
                // Add extra image
                await addExtraImage({
                    inventoryId: inventoryId,
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

            // Close overlay after short delay
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error saving image:', error);
            setStatusMessage({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to save image',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = imageUrl !== '' && imageUrl !== 'Not yet uploaded';

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
                <div className="bg-surface relative mx-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg shadow-2xl">
                    {/* Header */}
                    <div className="bg-surface-raised border-line flex items-center justify-between border-b p-6">
                        <h2 className="gradient-secondary-main-text text-2xl font-bold">
                            {mode === 'main' ? 'Change Main Image' : 'Add Extra Image'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="bg-surface-overlay hover:bg-surface-hover text-body-muted hover:text-body rounded-full p-2 transition-colors"
                            data-tooltip-id="close-btn"
                            data-tooltip-content="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Upload Section */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-body mb-3 text-lg font-semibold">Upload Image</h3>
                                    <ResizeUploader
                                        handleUploadComplete={handleUploadComplete}
                                        handleResetInputs={resetInputs}
                                        backToEditLink={`/admin/edit?id=${inventoryOId}`}
                                    />
                                </div>

                                <InputSelect
                                    idName="image_type"
                                    name="Image Type"
                                    defaultValue={{
                                        value: selectedOption,
                                        label: selectedOption === 'main' ? 'Main Image' : 'Extra Image',
                                    }}
                                    select_options={[
                                        ['main', 'Main Image'],
                                        ['extra', 'Extra Image'],
                                    ]}
                                    onChange={(e) => setSelectedOption(e.target.value as 'main' | 'extra')}
                                />

                                <InputTextbox idName="title" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>

                            {/* Preview Section */}
                            <div className="space-y-4">
                                <h3 className="text-body text-lg font-semibold">Preview</h3>

                                <div className="bg-surface-raised flex aspect-square items-center justify-center overflow-hidden rounded-lg">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt="Preview"
                                            width={width}
                                            height={height}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-body-subtle text-center">
                                            <Upload size={48} className="mx-auto mb-2 opacity-50" />
                                            <p>Upload an image to see preview</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Image Dimensions and Warnings */}
                        {imageUrl && imageUrl !== 'Not yet uploaded' && (
                            <div className="mt-6 space-y-4">
                                <div className="text-body-subtle bg-surface-raised grid grid-cols-2 gap-4 rounded-lg p-4 text-sm">
                                    <div>
                                        <span className="text-body-muted block font-medium">Dimensions:</span>
                                        <span>
                                            {width} × {height}px
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-body-muted block font-medium">Small:</span>
                                        <span>
                                            {smallWidth} × {smallHeight}px
                                        </span>
                                    </div>
                                </div>

                                {width < 800 || height < 800 ? (
                                    <div className="rounded bg-red-900/20 p-3 text-sm text-red-400">
                                        ⚠️ Warning: Image dimensions are less than 800px. Consider uploading a larger image for better
                                        quality.
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Status Message */}
                        {statusMessage && (
                            <div
                                className={`mt-6 rounded-lg p-3 ${
                                    statusMessage.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                }`}
                            >
                                {statusMessage.message}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-surface-raised border-line flex justify-end space-x-3 border-t p-6">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="bg-surface-hover text-body-muted hover:text-body rounded-lg px-4 py-2 transition-colors hover:bg-stone-500 disabled:opacity-50"
                            data-tooltip-id="cancel-btn"
                            data-tooltip-content="Cancel upload"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={!isFormValid || isSubmitting}
                            className="bg-secondary hover:bg-secondary_light flex items-center space-x-2 rounded-lg px-6 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            data-tooltip-id="save-btn"
                            data-tooltip-content={!isFormValid ? 'Please upload an image first' : 'Save image'}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    <span>Save Image</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tooltips */}
            <Tooltip id="close-btn" />
            <Tooltip id="cancel-btn" />
            <Tooltip id="save-btn" />
        </>
    );
};

export default ImageUploadOverlay;
