'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { X, Package, Edit, Eye, Loader2 } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';

interface AddInventoryOverlayProps {
    onClose: () => void;
    onSuccess?: (oId: number) => void;
    defaultAction?: 'edit' | 'view' | 'stay';
}

const AddInventoryOverlay: React.FC<AddInventoryOverlayProps> = ({
    onClose,
    onSuccess,
    defaultAction = 'stay'
}) => {
    const [imageUrl, setImageUrl] = useState('Not yet uploaded');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [title, setTitle] = useState('Not yet uploaded');
    const [smallImageUrl, setSmallImageUrl] = useState('Not yet uploaded');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const router = useRouter();
    const createInventory = useMutation(api.inventory.createInventory);
    const mostRecentOId = useQuery(api.inventory.getMostRecentOId);

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
            setTitle(fileName.split('.')[0] || 'New Item');
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

    const handleResetInputs = useCallback(() => {
        setImageUrl('Not yet uploaded');
        setWidth(0);
        setHeight(0);
        setTitle('Not yet uploaded');
        setSmallImageUrl('Not yet uploaded');
        setSmallWidth(0);
        setSmallHeight(0);
        setStatusMessage(null);
    }, []);

    const handleCreateInventory = async (action: 'edit' | 'view' | 'stay') => {
        if (mostRecentOId === undefined) {
            setStatusMessage({ type: 'error', message: 'Unable to get next ID. Please try again.' });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            const nextOId = (mostRecentOId || 0) + 1;

            const inventoryId = await createInventory({
                oId: nextOId,
                pId: nextOId,
                active: true,
                name: title,
                cost: 0,
                price: 0,
                vendor: '',
                category: '',
                description: '',
                count: 0,
                location: '',
                realWidth: 0,
                realHeight: 0,
                realDepth: 0,
                imagePath: imageUrl,
                width: width,
                height: height,
                smallImagePath: smallImageUrl,
                smallWidth: smallWidth,
                smallHeight: smallHeight,
            });

            setStatusMessage({ type: 'success', message: 'Inventory created successfully!' });

            // Call onSuccess callback if provided
            onSuccess?.(nextOId);

            // Close overlay after short delay for success message
            setTimeout(() => {
                onClose();
                
                // Navigate if requested
                switch (action) {
                    case 'edit':
                        router.push(`/admin/edit?id=${nextOId}`);
                        break;
                    case 'view':
                        router.push(`/admin/inventory?item=${nextOId}`);
                        break;
                    case 'stay':
                        // Just refresh the current page
                        router.refresh();
                        break;
                }
            }, 1500);

        } catch (error) {
            console.error('Error creating inventory:', error);
            setStatusMessage({ 
                type: 'error', 
                message: error instanceof Error ? error.message : 'Failed to create inventory' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = imageUrl !== 'Not yet uploaded' && title !== 'Not yet uploaded' && !isSubmitting;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                <div className="relative w-full max-w-3xl mx-4 max-h-[90vh] bg-stone-900 rounded-lg shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 bg-stone-800 border-b border-stone-700">
                        <h2 className="text-2xl font-bold gradient-secondary-main-text">
                            Create New Inventory
                        </h2>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="p-2 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-stone-100 transition-colors disabled:opacity-50"
                            data-tooltip-id="close-btn"
                            data-tooltip-content="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div className="space-y-4">
                            <ResizeUploader
                                handleUploadComplete={handleUploadComplete}
                                handleResetInputs={handleResetInputs}
                                backToEditLink="/admin/inventory"
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
                            
                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                            
                            <InputTextbox 
                                idName="small_image_path" 
                                name="Small Path" 
                                value={smallImageUrl}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <InputTextbox 
                                    idName="small_px_width" 
                                    name="Small Width" 
                                    value={smallWidth.toString()}
                                />
                                <InputTextbox 
                                    idName="small_px_height" 
                                    name="Small Height" 
                                    value={smallHeight.toString()}
                                />
                            </div>

                            {/* Warning messages */}
                            {imageUrl !== 'Not yet uploaded' && (
                                <>
                                    {width < 800 && height < 800 && (
                                        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                                            ⚠️ Warning: Image width and height are less than 800px.
                                        </div>
                                    )}
                                    {width < 800 && height >= 800 && (
                                        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                                            ⚠️ Warning: Image width is less than 800px.
                                        </div>
                                    )}
                                    {height < 800 && width >= 800 && (
                                        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                                            ⚠️ Warning: Image height is less than 800px.
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Status Message */}
                            {statusMessage && (
                                <div className={`rounded-lg p-3 ${
                                    statusMessage.type === 'success' 
                                        ? 'bg-green-900 text-green-300' 
                                        : 'bg-red-900 text-red-300'
                                }`}>
                                    {statusMessage.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 p-6 bg-stone-800 border-t border-stone-700">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-stone-600 hover:bg-stone-500 text-stone-300 hover:text-stone-100 rounded-lg transition-colors disabled:opacity-50"
                            data-tooltip-id="cancel-btn"
                            data-tooltip-content="Cancel creation"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => handleCreateInventory('stay')}
                            disabled={!isFormValid}
                            className="flex items-center space-x-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-stone-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            data-tooltip-id="create-stay-btn"
                            data-tooltip-content="Create and stay on current page"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Package size={16} />
                                    <span>Create</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => handleCreateInventory('edit')}
                            disabled={!isFormValid}
                            className="flex items-center space-x-2 px-4 py-2 bg-secondary hover:bg-secondary_light text-stone-200 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            data-tooltip-id="create-edit-btn"
                            data-tooltip-content="Create and go to edit page"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Edit size={16} />
                                    <span>Create & Edit</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => handleCreateInventory('view')}
                            disabled={!isFormValid}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary_dark text-stone-900 hover:text-stone-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            data-tooltip-id="create-view-btn"
                            data-tooltip-content="Create and view in inventory"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Eye size={16} />
                                    <span>Create & View</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Tooltips */}
            <Tooltip id="close-btn" />
            <Tooltip id="cancel-btn" />
            <Tooltip id="create-stay-btn" />
            <Tooltip id="create-edit-btn" />
            <Tooltip id="create-view-btn" />
        </>
    );
};

export default AddInventoryOverlay;