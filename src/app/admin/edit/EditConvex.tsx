'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { MdPageview } from 'react-icons/md';
import { ChevronLeft, ChevronRight, ImagePlus, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Tooltip } from 'react-tooltip';
import EditFormConvex from './EditFormConvex';
import FullScreenView from '../inventory/FullScreenView';
import ImageUploadOverlay from './ImageUploadOverlay';
import ImageOrderingSection from './images/[id]/ImageOrderingSection';

interface EditConvexProps {
    inventoryData: any;
    currentOId: number;
    nextOId: number | null;
    prevOId: number | null;
}

const EditConvex: React.FC<EditConvexProps> = ({ 
    inventoryData, 
    currentOId, 
    nextOId, 
    prevOId 
}) => {
    const router = useRouter();
    const updateInventory = useMutation(api.inventory.updateInventory);
    
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [titleInput, setTitleInput] = useState(inventoryData?.name || '');
    const [isFullScreenImage, setIsFullScreenImage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(3000);
    const [showUploadOverlay, setShowUploadOverlay] = useState(false);
    const [uploadMode, setUploadMode] = useState<'main' | 'extra'>('extra');

    const getImageList = () => {
        if (!inventoryData) return [];
        return [
            {
                src: inventoryData.imagePath,
                width: inventoryData.width,
                height: inventoryData.height,
            },
            ...(inventoryData.extraImages || []).map((image: any) => ({
                src: image.imagePath,
                width: image.width,
                height: image.height,
            })),
        ];
    };

    // Helper function to get all images with IDs for ordering
    const getAllImages = () => {
        if (!inventoryData) return [];
        
        const images: Array<{
            src: string;
            label: string;
            isMain: boolean;
            _id: string | null;
        }> = [
            {
                src: inventoryData.imagePath,
                label: 'Main Image',
                isMain: true,
                _id: null
            }
        ];
        
        if (inventoryData.extraImages) {
            inventoryData.extraImages.forEach((img: any) => {
                images.push({
                    src: img.imagePath,
                    label: img.imagePath.split('/').pop() || 'Extra Image',
                    isMain: false,
                    _id: img._id
                });
            });
        }
        
        return images;
    };

    const imageList = getImageList();
    const allImages = getAllImages();
    const currentImage = allImages[currentImageIndex] || null;

    const handleTitleUpdate = async () => {
        if (!titleInput || titleInput === inventoryData.name) return;
        
        try {
            await updateInventory({
                id: inventoryData._id,
                updates: { name: titleInput }
            });
            
            setSubmitMessage({ type: 'success', text: 'Title updated successfully!' });
            setTimeout(() => setSubmitMessage(null), 3000);
        } catch (error) {
            console.error('Error updating title:', error);
            setSubmitMessage({ type: 'error', text: 'Failed to update title' });
            setTimeout(() => setSubmitMessage(null), 3000);
        }
    };

    const handleNavigation = (targetOId: number | null) => {
        if (targetOId) {
            router.push(`/admin/edit?id=${targetOId}`);
        }
    };

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0);
    };

    const handleDotClick = (index: number) => {
        setCurrentImageIndex(index);
    };

    const handleUploadSuccess = () => {
        router.refresh();
    };

    const handleChangeMainImage = () => {
        setUploadMode('main');
        setShowUploadOverlay(true);
    };

    const handleAddExtraImage = () => {
        setUploadMode('extra');
        setShowUploadOverlay(true);
    };

    if (!inventoryData) {
        return <div className="text-center text-xl">Loading inventory data...</div>;
    }

    return (
        <>
            <div className="flex h-full w-full bg-stone-900">
                <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row h-full">
                    {/* Images Section - Top on mobile, Left on desktop */}
                    <div className="w-full md:w-2/5 p-4 flex flex-col">
                        {/* Current Image Display */}
                        {allImages.length > 0 && (
                            <div className="flex-grow flex flex-col items-center justify-center">
                                <div className="relative w-full max-w-md aspect-square bg-stone-800 rounded-lg overflow-hidden mb-4">
                                    <Image 
                                        src={currentImage?.src || inventoryData.imagePath} 
                                        alt={currentImage?.label || inventoryData.name}
                                        fill
                                        className="object-cover cursor-pointer"
                                        onClick={() => setIsFullScreenImage(true)}
                                    />
                                </div>

                                {/* Image Label */}
                                <div className="text-center mb-4">
                                    <span className="text-lg font-medium text-stone-200">
                                        {currentImage?.label}
                                    </span>
                                    {currentImage?.isMain && (
                                        <span className="ml-2 text-xs text-secondary">(Main)</span>
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {allImages.length > 1 && (
                                    <div className="flex items-center space-x-3 mb-6">
                                        {/* Left Arrow */}
                                        <button
                                            onClick={handlePrevImage}
                                            className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-full flex items-center justify-center text-stone-300 hover:text-stone-100 transition-colors"
                                            data-tooltip-id="prev-image"
                                            data-tooltip-content="Previous Image"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        {/* Dots */}
                                        <div className="flex space-x-2">
                                            {allImages.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleDotClick(index)}
                                                    className={`w-3 h-3 rounded-full transition-colors ${
                                                        index === currentImageIndex 
                                                            ? 'bg-secondary' 
                                                            : 'bg-stone-700 hover:bg-stone-600'
                                                    }`}
                                                    data-tooltip-id={`dot-${index}`}
                                                    data-tooltip-content={`View ${allImages[index].label}`}
                                                />
                                            ))}
                                        </div>

                                        {/* Right Arrow */}
                                        <button
                                            onClick={handleNextImage}
                                            className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-full flex items-center justify-center text-stone-300 hover:text-stone-100 transition-colors"
                                            data-tooltip-id="next-image"
                                            data-tooltip-content="Next Image"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* Image Action Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleChangeMainImage}
                                        className="flex items-center space-x-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-stone-100 rounded-lg transition-colors"
                                        data-tooltip-id="change-main"
                                        data-tooltip-content="Change the main image"
                                    >
                                        <RotateCcw size={16} />
                                        <span>Change Main</span>
                                    </button>
                                    <button
                                        onClick={handleAddExtraImage}
                                        className="flex items-center space-x-2 px-4 py-2 bg-secondary hover:bg-secondary_light text-stone-200 hover:text-white rounded-lg transition-colors"
                                        data-tooltip-id="add-extra"
                                        data-tooltip-content="Add an extra image"
                                    >
                                        <ImagePlus size={16} />
                                        <span>Add Extra</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Section - Bottom on mobile, Right on desktop */}
                    <div className="w-full md:w-3/5 p-4 overflow-y-auto">
                        {/* Navigation and Title */}
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="flex flex-col space-y-1">
                                <button
                                    onClick={() => handleNavigation(nextOId)}
                                    disabled={!nextOId}
                                    className={`h-[22px] w-8 cursor-pointer rounded-lg flex items-center justify-center ${
                                        nextOId 
                                            ? 'bg-secondary text-stone-400 hover:bg-primary hover:text-secondary_dark' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    data-tooltip-id="next-item"
                                    data-tooltip-content="Next Item"
                                >
                                    <IoIosArrowUp className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleNavigation(prevOId)}
                                    disabled={!prevOId}
                                    className={`h-[22px] w-8 cursor-pointer rounded-lg flex items-center justify-center ${
                                        prevOId 
                                            ? 'bg-secondary text-stone-400 hover:bg-primary hover:text-secondary_dark' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    data-tooltip-id="prev-item"
                                    data-tooltip-content="Previous Item"
                                >
                                    <IoIosArrowDown className="h-4 w-4" />
                                </button>
                            </div>
                            <Link href={`/admin/inventory/?item=${currentOId}`}>
                                <MdPageview 
                                    className="h-[48px] w-[48px] cursor-pointer rounded-lg bg-secondary text-stone-400 p-1 hover:bg-primary hover:text-secondary_dark" 
                                    data-tooltip-id="view-item"
                                    data-tooltip-content="View in inventory"
                                />
                            </Link>
                            <form onSubmit={(e) => { e.preventDefault(); handleTitleUpdate(); }} className="flex flex-grow rounded-lg bg-secondary_dark">
                                <input
                                    type="text"
                                    name="newTitle"
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    className="flex-grow rounded-lg border-none bg-secondary_dark px-3 py-1 text-2xl font-bold text-stone-400 outline-none"
                                />
                                <button
                                    type="submit"
                                    className="ml-2 rounded-md bg-secondary px-3 py-1 font-bold text-stone-400 hover:bg-primary_dark hover:text-secondary_dark"
                                >
                                    Save
                                </button>
                            </form>
                        </div>

                        {submitMessage && (
                            <div className={`mb-4 rounded-md p-2 ${submitMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                {submitMessage.text}
                            </div>
                        )}

                        <EditFormConvex inventoryData={inventoryData} onUpdate={() => router.refresh()} />
                        
                        {/* Image Ordering Section */}
                        <ImageOrderingSection
                            inventoryId={inventoryData._id}
                            allImages={allImages}
                            onReorderComplete={() => router.refresh()}
                        />
                    </div>
                </div>
            </div>

            {/* Image Upload Overlay */}
            {showUploadOverlay && (
                <ImageUploadOverlay
                    inventoryId={inventoryData._id}
                    inventoryOId={inventoryData.oId}
                    mode={uploadMode}
                    onClose={() => setShowUploadOverlay(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}

            {/* Fullscreen View */}
            {isFullScreenImage && (
                <FullScreenView
                    selectedItem={inventoryData}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    imageList={imageList}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    setIsFullScreenImage={setIsFullScreenImage}
                    selectedItemIndex={null}
                    setSpeed={setSpeed}
                    speed={speed}
                />
            )}

            {/* Tooltips */}
            <Tooltip id="prev-image" />
            <Tooltip id="next-image" />
            <Tooltip id="change-main" />
            <Tooltip id="add-extra" />
            <Tooltip id="next-item" />
            <Tooltip id="prev-item" />
            <Tooltip id="view-item" />
            {allImages.map((_, index) => (
                <Tooltip key={`dot-tooltip-${index}`} id={`dot-${index}`} />
            ))}
        </>
    );
};

export default EditConvex;