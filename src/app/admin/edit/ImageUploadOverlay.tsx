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
    inventoryId: Id<"inventory">;
    inventoryOId: number;
    mode: 'main' | 'extra';
    onClose: () => void;
    onSuccess: () => void;
}

const ImageUploadOverlay: React.FC<ImageUploadOverlayProps> = ({
    inventoryId,
    inventoryOId,
    mode,
    onClose,
    onSuccess
}) => {
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

    const handleUploadComplete = useCallback((
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
    }, []);

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
                    }
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
                message: error instanceof Error ? error.message : 'Failed to save image' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = imageUrl !== '' && imageUrl !== 'Not yet uploaded';

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] bg-stone-900 rounded-lg shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 bg-stone-800 border-b border-stone-700">
                        <h2 className="text-2xl font-bold gradient-secondary-main-text">
                            {mode === 'main' ? 'Change Main Image' : 'Add Extra Image'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-stone-100 transition-colors"
                            data-tooltip-id="close-btn"
                            data-tooltip-content="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Upload Section */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-stone-200 mb-3">Upload Image</h3>
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
                                        label: selectedOption === 'main' ? 'Main Image' : 'Extra Image' 
                                    }}
                                    select_options={[
                                        ['main', 'Main Image'],
                                        ['extra', 'Extra Image'],
                                    ]}
                                    onChange={(e) => setSelectedOption(e.target.value as 'main' | 'extra')}
                                />

                                <InputTextbox 
                                    idName="title" 
                                    name="Title" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                />
                            </div>

                            {/* Preview Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-stone-200">Preview</h3>
                                
                                {imageUrl ? (
                                    <div className="space-y-4">
                                        <div className="aspect-square bg-stone-800 rounded-lg overflow-hidden">
                                            <Image
                                                src={imageUrl}
                                                alt="Preview"
                                                width={width}
                                                height={height}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm text-stone-400">
                                            <div>
                                                <span className="block font-medium">Dimensions:</span>
                                                <span>{width} × {height}px</span>
                                            </div>
                                            <div>
                                                <span className="block font-medium">Small:</span>
                                                <span>{smallWidth} × {smallHeight}px</span>
                                            </div>
                                        </div>

                                        {width < 800 || height < 800 ? (
                                            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                                                ⚠️ Warning: Image dimensions are less than 800px. Consider uploading a larger image for better quality.
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-stone-800 rounded-lg flex items-center justify-center">
                                        <div className="text-center text-stone-400">
                                            <Upload size={48} className="mx-auto mb-2 opacity-50" />
                                            <p>Upload an image to see preview</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Message */}
                        {statusMessage && (
                            <div className={`mt-6 rounded-lg p-3 ${
                                statusMessage.type === 'success' 
                                    ? 'bg-green-900 text-green-300' 
                                    : 'bg-red-900 text-red-300'
                            }`}>
                                {statusMessage.message}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 p-6 bg-stone-800 border-t border-stone-700">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-stone-600 hover:bg-stone-500 text-stone-300 hover:text-stone-100 rounded-lg transition-colors disabled:opacity-50"
                            data-tooltip-id="cancel-btn"
                            data-tooltip-content="Cancel upload"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={!isFormValid || isSubmitting}
                            className="px-6 py-2 bg-secondary hover:bg-secondary_light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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