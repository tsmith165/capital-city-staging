'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { X, Package, Edit, Eye, Loader2, Upload, RotateCcw } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';

interface AddInventoryOverlayProps {
    onClose: () => void;
    onSuccess?: (oId: number) => void;
    defaultAction?: 'edit' | 'view' | 'stay';
}

const AddInventoryOverlay: React.FC<AddInventoryOverlayProps> = ({ onClose, onSuccess }) => {
    const [imageUrl, setImageUrl] = useState('Not yet uploaded');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [title, setTitle] = useState('Not yet uploaded');
    const [smallImageUrl, setSmallImageUrl] = useState('Not yet uploaded');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Additional form fields
    const [category, setCategory] = useState('');
    const [vendor, setVendor] = useState('');
    const [price, setPrice] = useState(0);
    const [cost, setCost] = useState(0);
    const [location, setLocation] = useState('');
    const [count, setCount] = useState(1);
    const [realWidth, setRealWidth] = useState(0);
    const [realHeight, setRealHeight] = useState(0);
    const [realDepth, setRealDepth] = useState(0);

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
            setIsUploading(false);
        },
        [],
    );

    const handleFileSelect = useCallback((file: File) => {
        // Create local preview URL
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setTitle(file.name.split('.')[0] || 'New Item');
        setStatusMessage(null);
        setIsUploading(true);
    }, []);

    const handleResetInputs = useCallback(() => {
        // Clean up preview URL
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setImageUrl('Not yet uploaded');
        setWidth(0);
        setHeight(0);
        setTitle('Not yet uploaded');
        setSmallImageUrl('Not yet uploaded');
        setSmallWidth(0);
        setSmallHeight(0);
        setStatusMessage(null);
        setPreviewUrl(null);
        setIsUploading(false);
        setCategory('');
        setVendor('');
        setPrice(0);
        setCost(0);
        setLocation('');
        setCount(1);
        setRealWidth(0);
        setRealHeight(0);
        setRealDepth(0);
    }, [previewUrl]);

    const handleCreateInventory = async (action: 'edit' | 'view' | 'stay') => {
        if (mostRecentOId === undefined) {
            setStatusMessage({ type: 'error', message: 'Unable to get next ID. Please try again.' });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            const nextOId = (mostRecentOId || 0) + 1;

            await createInventory({
                oId: nextOId,
                pId: nextOId,
                active: true,
                name: title,
                cost: cost,
                price: price,
                vendor: vendor,
                category: category,
                description: '',
                count: count,
                location: location,
                realWidth: realWidth,
                realHeight: realHeight,
                realDepth: realDepth,
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
                message: error instanceof Error ? error.message : 'Failed to create inventory',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = imageUrl !== 'Not yet uploaded' && title !== 'Not yet uploaded' && !isSubmitting;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
                <div className="bg-surface relative mx-4 max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg shadow-2xl">
                    {/* Header */}
                    <div className="bg-surface-raised border-line flex items-center justify-between border-b p-6">
                        <h2 className="gradient-secondary-main-text text-2xl font-bold">Create New Inventory</h2>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="bg-surface-overlay hover:bg-surface-hover text-body-muted hover:text-body rounded-full p-2 transition-colors disabled:opacity-50"
                            data-tooltip-id="close-btn"
                            data-tooltip-content="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex h-[calc(90vh-200px)]">
                        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Preview Section - Left Side */}
                            <div className="space-y-4 p-6">
                                <div className="bg-surface-raised flex aspect-square items-center justify-center overflow-hidden rounded-lg">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : imageUrl && imageUrl !== 'Not yet uploaded' ? (
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
                                            <p>Image preview will appear here</p>
                                        </div>
                                    )}
                                </div>

                                {imageUrl && imageUrl !== 'Not yet uploaded' && (
                                    <>
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

                                        {width < 800 ||
                                            (height < 800 && (
                                                <div className="rounded bg-red-900/20 p-3 text-sm text-red-400">
                                                    ⚠️ Warning: Image dimensions are less than 800px. Consider uploading a larger image for
                                                    better quality.
                                                </div>
                                            ))}
                                    </>
                                )}
                            </div>

                            {/* Form Section - Right Side */}
                            <div className="overflow-y-auto p-6">
                                <div className="space-y-4 pb-6">
                                    {!previewUrl && imageUrl === 'Not yet uploaded' ? (
                                        /* Upload Button State */
                                        <div>
                                            <ResizeUploader
                                                handleUploadComplete={handleUploadComplete}
                                                handleResetInputs={handleResetInputs}
                                                onFileSelect={handleFileSelect}
                                            />
                                        </div>
                                    ) : (
                                        /* Form Fields State */
                                        <>
                                            {/* Upload Status */}
                                            {isUploading && (
                                                <div className="bg-surface-raised border-line-strong flex items-center space-x-2 rounded-lg border p-3">
                                                    <Loader2 size={20} className="text-secondary animate-spin" />
                                                    <span className="text-body-muted">Processing image...</span>
                                                </div>
                                            )}

                                            <InputTextbox
                                                idName="title"
                                                name="Item Title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                            />

                                            <InputSelect
                                                idName="category"
                                                name="Category"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                select_options={[
                                                    ['', 'Select Category...'],
                                                    ['Couch', 'Couch'],
                                                    ['Table', 'Table'],
                                                    ['Chair', 'Chair'],
                                                    ['Bedroom', 'Bedroom'],
                                                    ['Bathroom', 'Bathroom'],
                                                    ['Kitchen', 'Kitchen'],
                                                    ['Pillow', 'Pillow'],
                                                    ['Bookcase', 'Bookcase'],
                                                    ['Book', 'Book'],
                                                    ['Lamp', 'Lamp'],
                                                    ['Art', 'Art'],
                                                    ['Decor', 'Decor'],
                                                    ['Bench', 'Bench'],
                                                    ['Barstool', 'Barstool'],
                                                    ['Rug', 'Rug'],
                                                    ['Plant', 'Plant'],
                                                    ['Desk', 'Desk'],
                                                    ['Other', 'Other'],
                                                ]}
                                            />

                                            <InputTextbox
                                                idName="vendor"
                                                name="Vendor"
                                                value={vendor}
                                                onChange={(e) => setVendor(e.target.value)}
                                            />

                                            <InputTextbox
                                                idName="location"
                                                name="Location"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                            />

                                            <InputTextbox
                                                idName="price"
                                                name="Price ($)"
                                                value={price.toString()}
                                                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                                            />

                                            <InputTextbox
                                                idName="cost"
                                                name="Cost ($)"
                                                value={cost.toString()}
                                                onChange={(e) => setCost(Number(e.target.value) || 0)}
                                            />

                                            <InputTextbox
                                                idName="count"
                                                name="Count"
                                                value={count.toString()}
                                                onChange={(e) => setCount(Number(e.target.value) || 1)}
                                            />

                                            <InputTextbox
                                                idName="realWidth"
                                                name="Width (in)"
                                                value={realWidth.toString()}
                                                onChange={(e) => setRealWidth(Number(e.target.value) || 0)}
                                            />

                                            <InputTextbox
                                                idName="realHeight"
                                                name="Height (in)"
                                                value={realHeight.toString()}
                                                onChange={(e) => setRealHeight(Number(e.target.value) || 0)}
                                            />

                                            <InputTextbox
                                                idName="realDepth"
                                                name="Depth (in)"
                                                value={realDepth.toString()}
                                                onChange={(e) => setRealDepth(Number(e.target.value) || 0)}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    {statusMessage && (
                        <div
                            className={`mx-6 mb-4 rounded-lg p-3 ${
                                statusMessage.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                            }`}
                        >
                            {statusMessage.message}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="bg-surface-raised border-line flex items-center justify-between border-t p-6">
                        <div>
                            {imageUrl !== 'Not yet uploaded' && (
                                <button
                                    onClick={handleResetInputs}
                                    disabled={isSubmitting}
                                    className="bg-surface-overlay hover:bg-surface-hover text-body-muted hover:text-body flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                                    data-tooltip-id="change-image-btn"
                                    data-tooltip-content="Change the selected image"
                                >
                                    <RotateCcw size={16} />
                                    <span>Change Image</span>
                                </button>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="bg-surface-hover text-body-muted hover:text-body rounded-lg px-4 py-2 transition-colors hover:bg-stone-500 disabled:opacity-50"
                                data-tooltip-id="cancel-btn"
                                data-tooltip-content="Cancel creation"
                            >
                                Cancel
                            </button>

                            {imageUrl !== 'Not yet uploaded' && (
                                <>
                                    <button
                                        onClick={() => handleCreateInventory('stay')}
                                        disabled={!isFormValid}
                                        className="bg-surface-overlay hover:bg-surface-hover text-body-muted hover:text-body flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
                                        className="bg-secondary hover:bg-secondary_light text-body flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                                        className="bg-primary hover:bg-primary_dark text-body-inverse hover:text-body-inverse flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltips */}
            <Tooltip id="close-btn" />
            <Tooltip id="cancel-btn" />
            <Tooltip id="change-image-btn" />
            <Tooltip id="create-stay-btn" />
            <Tooltip id="create-edit-btn" />
            <Tooltip id="create-view-btn" />
        </>
    );
};

export default AddInventoryOverlay;
