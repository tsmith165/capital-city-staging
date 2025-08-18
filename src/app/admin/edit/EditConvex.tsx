'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { MdPageview } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import EditFormConvex from './EditFormConvex';
import FullScreenView from '../inventory/FullScreenView';

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

    const imageList = getImageList();

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

    if (!inventoryData) {
        return <div className="text-center text-xl">Loading inventory data...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Navigation and Title */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/inventory"
                        className="rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-primary_dark"
                    >
                        Back to Inventory
                    </Link>
                    
                    {/* Navigation Arrows */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleNavigation(prevOId)}
                            disabled={!prevOId}
                            className={`rounded p-2 ${
                                prevOId 
                                    ? 'bg-primary text-white hover:bg-primary_dark' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title="Previous Item"
                        >
                            <IoIosArrowUp size={20} />
                        </button>
                        <button
                            onClick={() => handleNavigation(nextOId)}
                            disabled={!nextOId}
                            className={`rounded p-2 ${
                                nextOId 
                                    ? 'bg-primary text-white hover:bg-primary_dark' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title="Next Item"
                        >
                            <IoIosArrowDown size={20} />
                        </button>
                    </div>
                </div>

                {/* Title Input */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onBlur={handleTitleUpdate}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleTitleUpdate();
                            }
                        }}
                        className="rounded border border-gray-300 px-3 py-1 text-lg font-semibold"
                    />
                    {submitMessage && (
                        <span className={`text-sm ${submitMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {submitMessage.text}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="relative">
                        <Image
                            src={inventoryData.imagePath}
                            alt={inventoryData.name}
                            width={inventoryData.width}
                            height={inventoryData.height}
                            className="w-full rounded-lg shadow-lg cursor-pointer"
                            onClick={() => setIsFullScreenImage(true)}
                        />
                        <button
                            onClick={() => setIsFullScreenImage(true)}
                            className="absolute bottom-2 right-2 rounded bg-black/50 p-2 text-white hover:bg-black/70"
                            title="View Fullscreen"
                        >
                            <MdPageview size={24} />
                        </button>
                    </div>

                    {/* Extra Images */}
                    {inventoryData.extraImages && inventoryData.extraImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {inventoryData.extraImages.map((image: any, index: number) => (
                                <Image
                                    key={image._id}
                                    src={image.imagePath}
                                    alt={`Extra ${index + 1}`}
                                    width={image.width}
                                    height={image.height}
                                    className="w-full rounded cursor-pointer hover:opacity-80"
                                    onClick={() => {
                                        setCurrentImageIndex(index + 1);
                                        setIsFullScreenImage(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add/Edit Images Link */}
                    <Link
                        href={`/admin/edit/images/${inventoryData._id}`}
                        className="block rounded bg-secondary px-4 py-2 text-center text-white transition-colors hover:bg-secondary_dark"
                    >
                        Manage Extra Images
                    </Link>
                </div>

                {/* Form Section */}
                <div>
                    <EditFormConvex 
                        inventoryData={inventoryData}
                        onUpdate={() => {
                            // Refresh the page to show updated data
                            router.refresh();
                        }}
                    />
                </div>
            </div>

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
        </div>
    );
};

export default EditConvex;