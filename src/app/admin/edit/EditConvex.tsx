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
        <div className="flex h-full w-full flex-col bg-stone-800 md:flex-row">
            <div className="flex h-1/3 items-center justify-center rounded-lg p-8 md:h-[calc(100dvh-50px)] md:w-2/5 lg:w-1/2">
                <Image
                    src={inventoryData.imagePath}
                    alt={inventoryData.name}
                    width={inventoryData.width}
                    height={inventoryData.height}
                    quality={100}
                    className="h-fit max-h-full w-auto cursor-pointer rounded-lg object-contain"
                    onClick={() => setIsFullScreenImage(true)}
                />
            </div>
            <div className="h-2/3 overflow-y-auto md:h-full md:w-3/5 lg:w-1/2">
                <div className="flex h-fit flex-row items-center space-x-2 p-2">
                    <div className="flex h-[48px] flex-col space-y-1">
                        <button
                            onClick={() => handleNavigation(nextOId)}
                            disabled={!nextOId}
                            className={`h-[22px] w-8 cursor-pointer rounded-lg ${
                                nextOId 
                                    ? 'bg-secondary fill-stone-400 hover:bg-primary hover:fill-secondary_dark' 
                                    : 'bg-gray-300 fill-gray-500 cursor-not-allowed'
                            }`}
                            title="Next Item"
                        >
                            <IoIosArrowUp className="h-[22px] w-8" />
                        </button>
                        <button
                            onClick={() => handleNavigation(prevOId)}
                            disabled={!prevOId}
                            className={`h-[22px] w-8 cursor-pointer rounded-lg ${
                                prevOId 
                                    ? 'bg-secondary fill-stone-400 hover:bg-primary hover:fill-secondary_dark' 
                                    : 'bg-gray-300 fill-gray-500 cursor-not-allowed'
                            }`}
                            title="Previous Item"
                        >
                            <IoIosArrowDown className="h-[22px] w-8" />
                        </button>
                    </div>
                    <Link href={`/admin/inventory/?item=${currentOId}`}>
                        <MdPageview className="h-[48px] w-[48px] cursor-pointer rounded-lg bg-secondary fill-stone-400 p-1 hover:bg-primary hover:fill-secondary_dark" />
                    </Link>
                    <form onSubmit={(e) => { e.preventDefault(); handleTitleUpdate(); }} className="flex w-full flex-grow flex-row rounded-lg bg-secondary_dark">
                        <input
                            type="text"
                            name="newTitle"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            className="m-0 flex w-full flex-grow rounded-lg border-none bg-secondary_dark px-3 py-1 text-2xl font-bold text-stone-400 outline-none"
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
                    <div className={`mt-2 rounded-md p-2 ${submitMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        {submitMessage.text}
                    </div>
                )}
                <EditFormConvex inventoryData={inventoryData} onUpdate={() => router.refresh()} />
                
                {/* Extra Images Section - matching original InventoryOrderPanel style */}
                {inventoryData.extraImages && inventoryData.extraImages.length > 0 && (
                    <div className="p-2">
                        <div className="mb-2 text-stone-400 font-bold">Extra Images</div>
                        <div className="grid grid-cols-3 gap-2">
                            {inventoryData.extraImages.map((image: any, index: number) => (
                                <div key={image._id} className="relative">
                                    <Image
                                        src={image.imagePath}
                                        alt={`Extra ${index + 1}`}
                                        width={image.width}
                                        height={image.height}
                                        className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 border-2 border-stone-600"
                                        onClick={() => {
                                            setCurrentImageIndex(index + 1);
                                            setIsFullScreenImage(true);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <Link
                            href={`/admin/edit/images/${inventoryData._id}`}
                            className="mt-2 inline-block rounded bg-secondary px-3 py-1 text-sm text-stone-400 hover:bg-primary hover:text-secondary_dark"
                        >
                            Manage Images
                        </Link>
                    </div>
                )}
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