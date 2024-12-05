'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack, IoIosSpeedometer } from 'react-icons/io';
import { FaPlay, FaPause, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { InventoryWithImages } from '@/db/schema';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { updateInventoryField } from '@/app/actions';
import InputSelect from '@/components/inputs/InputSelect';

interface SelectedItemViewProps {
    selectedItem: InventoryWithImages;
    currentImageIndex: number;
    imageList: { src: string; width: number; height: number }[];
    imageLoadStates: { [key: number]: boolean };
    handleImageLoad: () => void;
    setIsFullScreenImage: (isFullScreen: boolean) => void;
    selectedItemIndex: number | null;
    selectedImageRef: React.RefObject<HTMLDivElement | null>;
    handleNext: () => void;
    handlePrev: () => void;
    togglePlayPause: () => void;
    isPlaying: boolean;
    speed: number;
    setSpeed: (speed: number) => void;
}

interface InventoryDetailItemProps {
    label: string;
    value: string | number;
    itemId: number;
    fieldName: string;
    isAdmin: boolean;
    realWidth?: number | null;
    realHeight?: number | null;
    realDepth?: number | null;
}

const CATEGORY_OPTIONS: [string, string][] = [
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
];

const InventoryDetailItem: React.FC<InventoryDetailItemProps> = ({
    label,
    value,
    itemId,
    fieldName,
    isAdmin,
    realWidth,
    realHeight,
    realDepth,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value.toString());
    const [dimensionValues, setDimensionValues] = useState({
        width: realWidth?.toString() ?? '',
        height: realHeight?.toString() ?? '',
        depth: realDepth?.toString() ?? '',
    });
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async () => {
        setIsPending(true);
        let result;

        if (fieldName === 'dimensions') {
            // Handle dimensions update
            const updates = [
                updateInventoryField(itemId, 'real_width', parseFloat(dimensionValues.width) || 0),
                updateInventoryField(itemId, 'real_height', parseFloat(dimensionValues.height) || 0),
            ];

            if (dimensionValues.depth) {
                updates.push(updateInventoryField(itemId, 'real_depth', parseFloat(dimensionValues.depth)));
            }

            const results = await Promise.all(updates);
            result = results.every((r) => r.success) ? { success: true } : { success: false, error: 'Failed to update dimensions' };
        } else {
            // Handle regular field update
            const parsedValue = fieldName === 'cost' || fieldName === 'price' || fieldName === 'count' ? parseFloat(editValue) : editValue;

            result = await updateInventoryField(itemId, fieldName, parsedValue);
        }

        if (result.success) {
            setIsEditing(false);
        }
        setIsPending(false);
    };

    const handleCancel = () => {
        setEditValue(value.toString());
        setDimensionValues({
            width: realWidth?.toString() ?? '',
            height: realHeight?.toString() ?? '',
            depth: realDepth?.toString() ?? '',
        });
        setIsEditing(false);
    };

    const renderEditContent = () => {
        if (fieldName === 'category') {
            return (
                <div className="flex flex-grow items-center space-x-2">
                    <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        disabled={isPending}
                        className="flex-grow rounded-md border border-stone-400 bg-stone-400 px-2 py-1.5 text-sm font-bold text-stone-950 focus:border-primary focus:outline-none md:text-base"
                    >
                        {CATEGORY_OPTIONS.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleSubmit} disabled={isPending} className="rounded-md p-1 text-green-600 hover:bg-green-100">
                        <FaCheck />
                    </button>
                    <button onClick={handleCancel} disabled={isPending} className="rounded-md p-1 text-red-600 hover:bg-red-100">
                        <FaTimes />
                    </button>
                </div>
            );
        }

        if (fieldName === 'dimensions') {
            return (
                <div className="flex flex-grow items-center space-x-2">
                    <div className="flex flex-grow space-x-2">
                        <span className="w-fit text-nowrap text-base leading-[48px] text-secondary_light">W:</span>
                        <input
                            type="text"
                            value={dimensionValues.width}
                            onChange={(e) => setDimensionValues((prev) => ({ ...prev, width: e.target.value }))}
                            placeholder="Width"
                            className="w-12 rounded-md border border-stone-400 bg-white px-2 py-1 text-base text-secondary_light focus:border-primary focus:outline-none md:text-lg"
                            disabled={isPending}
                        />
                        <span className="w-fit text-nowrap text-base leading-[48px] text-secondary_light">H:</span>
                        <input
                            type="text"
                            value={dimensionValues.height}
                            onChange={(e) => setDimensionValues((prev) => ({ ...prev, height: e.target.value }))}
                            placeholder="Height"
                            className="w-12 rounded-md border border-stone-400 bg-white px-2 py-1 text-base text-secondary_light focus:border-primary focus:outline-none md:text-lg"
                            disabled={isPending}
                        />
                        <span className="w-fit text-nowrap text-base leading-[48px] text-secondary_light">D:</span>
                        <input
                            type="text"
                            value={dimensionValues.depth}
                            onChange={(e) => setDimensionValues((prev) => ({ ...prev, depth: e.target.value }))}
                            placeholder="Depth"
                            className="w-12 rounded-md border border-stone-400 bg-white px-2 py-1 text-base text-secondary_light focus:border-primary focus:outline-none md:text-lg"
                            disabled={isPending}
                        />
                    </div>
                    <button onClick={handleSubmit} disabled={isPending} className="rounded-md p-1 text-green-600 hover:bg-green-100">
                        <FaCheck />
                    </button>
                    <button onClick={handleCancel} disabled={isPending} className="rounded-md p-1 text-red-600 hover:bg-red-100">
                        <FaTimes />
                    </button>
                </div>
            );
        }

        return (
            <div className="flex flex-grow items-center space-x-2">
                <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-grow rounded-md border border-stone-400 bg-white px-2 py-1 text-base text-secondary_light focus:border-primary focus:outline-none md:text-lg"
                    disabled={isPending}
                />
                <button onClick={handleSubmit} disabled={isPending} className="rounded-md p-1 text-green-600 hover:bg-green-100">
                    <FaCheck />
                </button>
                <button onClick={handleCancel} disabled={isPending} className="rounded-md p-1 text-red-600 hover:bg-red-100">
                    <FaTimes />
                </button>
            </div>
        );
    };

    return (
        <div className="group mx-4 flex flex-row justify-start space-x-4 rounded-md px-2 hover:bg-stone-300">
            <p className="w-[100px] text-base font-bold text-primary_dark group-hover:text-secondary_dark md:text-lg">{label}:</p>
            {isEditing ? (
                renderEditContent()
            ) : (
                <div className="flex flex-grow items-center justify-between">
                    <p className="text-base text-secondary_light md:text-lg">
                        {fieldName === 'cost' || fieldName === 'price' ? `$${value}` : value}
                    </p>
                    {isAdmin && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="invisible rounded-md p-1 text-stone-600 hover:bg-stone-200 group-hover:visible"
                        >
                            <FaEdit />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const SelectedItemView: React.FC<SelectedItemViewProps> = ({
    selectedItem,
    currentImageIndex,
    imageList,
    imageLoadStates,
    handleImageLoad,
    setIsFullScreenImage,
    selectedItemIndex,
    selectedImageRef,
    handleNext,
    handlePrev,
    togglePlayPause,
    isPlaying,
    speed,
    setSpeed,
}) => {
    const { user } = useUser();
    const isAdmin = !!user;
    const [showSlider, setShowSlider] = useState(false);

    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSpeed = parseInt(e.target.value, 10);
        setSpeed(newSpeed);
    };

    return (
        <motion.div
            className={`mx-auto flex h-fit w-full flex-col items-center p-4 pb-0 md:w-4/5 md:flex-row`}
            ref={selectedImageRef}
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.75 }}
        >
            <div className="relative flex w-2/5 cursor-pointer flex-col items-center justify-center space-y-2 pb-2 md:w-fit">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${selectedItemIndex}-${currentImageIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: imageLoadStates[currentImageIndex] ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsFullScreenImage(true)}
                        className="flex w-auto items-center justify-center rounded-md md:max-h-[50dvh]"
                    >
                        {imageList.map((image, index) =>
                            index === currentImageIndex ? (
                                <motion.img
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: imageLoadStates[index] ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={`selected-${index}`}
                                    src={image.src}
                                    alt={selectedItem.name}
                                    width={image.width}
                                    height={image.height}
                                    className="max-h-[40dvh] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh]"
                                    onLoad={handleImageLoad}
                                />
                            ) : (
                                <motion.img
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: imageLoadStates[index] ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={`selected-${index}`}
                                    src={image.src}
                                    alt={selectedItem.name}
                                    width={image.width}
                                    height={image.height}
                                    hidden
                                    className="max-h-[40dvh] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh]"
                                    onLoad={handleImageLoad}
                                />
                            ),
                        )}
                    </motion.div>
                </AnimatePresence>
                <div className="flex h-7 w-full items-center justify-center space-x-4 pb-1">
                    <div className="flex w-full flex-row">
                        <div className="flex w-full flex-grow justify-end pr-1">
                            <Link href={`/admin/edit?id=${selectedItem.id}`} className="ml-2 flex items-center justify-center">
                                <FaEdit className="fill-stone-600 text-xl hover:fill-primary" />
                            </Link>
                            {imageList.length > 1 && (
                                <button aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlayPause} className="ml-2">
                                    {isPlaying ? (
                                        <FaPause className="fill-stone-600 text-xl hover:fill-primary" />
                                    ) : (
                                        <FaPlay className="fill-stone-600 text-xl hover:fill-primary" />
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="flex w-fit items-center justify-center space-x-2">
                            {imageList.length > 1 && (
                                <button aria-label="Previous" onClick={handlePrev} className="">
                                    <IoIosArrowBack className="fill-stone-600 text-2xl hover:fill-primary" />
                                </button>
                            )}
                            {imageList.map((_, index) => (
                                <div
                                    key={`dot-${index}`}
                                    className={`h-3 w-3 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-stone-600'}`}
                                />
                            ))}
                            {imageList.length > 1 && (
                                <button aria-label="Next" onClick={handleNext} className="">
                                    <IoIosArrowForward className="fill-stone-600 text-2xl hover:fill-primary" />
                                </button>
                            )}
                        </div>
                        <div
                            className="group relative flex w-full flex-grow flex-row justify-start pl-1"
                            onMouseEnter={() => setShowSlider(true)}
                            onMouseLeave={() => setShowSlider(false)}
                        >
                            {imageList.length > 1 && (
                                <>
                                    {showSlider ? (
                                        <div className="mr-0.5 w-6 text-center leading-6 text-primary">{speed / 1000}s</div>
                                    ) : (
                                        <IoIosSpeedometer
                                            className={`${
                                                showSlider ? 'fill-primary' : 'fill-stone-600'
                                            } relative z-10 h-[24px] w-[24px] cursor-pointer fill-stone-600 hover:fill-primary`}
                                        />
                                    )}
                                    {showSlider && (
                                        <div className="z-0 flex h-[24px] transform items-center justify-center rounded-md px-2">
                                            <div className="jutify-center flex items-center justify-center">
                                                <input
                                                    type="range"
                                                    min={2000}
                                                    max={10000}
                                                    step={100}
                                                    value={speed}
                                                    onChange={handleSpeedChange}
                                                    className="w-16 cursor-pointer appearance-none rounded-lg bg-stone-600 xs:w-20 md:w-24 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:bg-stone-600 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex h-fit w-full flex-col space-y-2 md:w-3/5">
                <h1 className="font-cinzel text-center text-lg font-bold text-primary md:text-2xl">{selectedItem.name}</h1>
                <InventoryDetailItem
                    label="Category"
                    value={selectedItem.category ?? ''}
                    itemId={selectedItem.id}
                    fieldName="category"
                    isAdmin={isAdmin}
                />
                <InventoryDetailItem
                    label="Dimensions"
                    value={`${selectedItem.real_width ?? 0}in. x ${selectedItem.real_height ?? 0}in.${
                        selectedItem.real_depth ? ` x ${selectedItem.real_depth}in.` : ''
                    }`}
                    itemId={selectedItem.id}
                    fieldName="dimensions"
                    isAdmin={isAdmin}
                    realWidth={selectedItem.real_width}
                    realHeight={selectedItem.real_height}
                    realDepth={selectedItem.real_depth}
                />
                <InventoryDetailItem
                    label="Cost"
                    value={selectedItem.cost ?? 0}
                    itemId={selectedItem.id}
                    fieldName="cost"
                    isAdmin={isAdmin}
                />
                <InventoryDetailItem
                    label="Price"
                    value={selectedItem.price ?? 0}
                    itemId={selectedItem.id}
                    fieldName="price"
                    isAdmin={isAdmin}
                />
                <InventoryDetailItem
                    label="Vendor"
                    value={selectedItem.vendor ?? ''}
                    itemId={selectedItem.id}
                    fieldName="vendor"
                    isAdmin={isAdmin}
                />
                <InventoryDetailItem
                    label="Location"
                    value={selectedItem.location ?? ''}
                    itemId={selectedItem.id}
                    fieldName="location"
                    isAdmin={isAdmin}
                />
                <InventoryDetailItem
                    label="In Stock"
                    value={selectedItem.count ?? 0}
                    itemId={selectedItem.id}
                    fieldName="count"
                    isAdmin={isAdmin}
                />
                <InventoryDetailItem
                    label="Description"
                    value={selectedItem.description ?? ''}
                    itemId={selectedItem.id}
                    fieldName="description"
                    isAdmin={isAdmin}
                />
            </div>
        </motion.div>
    );
};

export default SelectedItemView;
