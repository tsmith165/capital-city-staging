import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack, IoIosSpeedometer } from 'react-icons/io';
import { FaPlay, FaPause, FaEdit } from 'react-icons/fa';
import { InventoryWithImages } from '@/db/schema';
import Link from 'next/link';

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
                <div className="group mx-4 flex flex-row justify-start space-x-4 rounded-md px-2 hover:bg-stone-300">
                    <p className="w-[100px] text-base font-bold text-primary_dark group-hover:text-secondary_dark md:text-lg">Category:</p>
                    <p className="text-base text-secondary_light md:text-lg">{selectedItem.category}</p>
                </div>
                <div className="group mx-4 flex flex-row justify-start space-x-4 rounded-md px-2 hover:bg-stone-300">
                    <p className="w-[100px] text-base font-bold text-primary_dark group-hover:text-secondary_dark md:text-lg">
                        Dimensions:
                    </p>
                    <p className="text-base text-secondary_light md:text-lg">
                        {`${selectedItem.width}in. x ${selectedItem.height}in.` + (selectedItem.depth ? ` x ${selectedItem.depth}in.` : '')}
                    </p>
                </div>
                <div className="group mx-4 flex flex-row justify-start space-x-4 rounded-md px-2 hover:bg-stone-300">
                    <p className="w-[100px] text-base font-bold text-primary_dark group-hover:text-secondary_dark md:text-lg">Price:</p>
                    <p className="text-base text-secondary_light md:text-lg">${selectedItem.cost}</p>
                </div>
                <div className="group mx-4 flex flex-row justify-start space-x-4 rounded-md px-2 hover:bg-stone-300">
                    <p className="w-[100px] text-base font-bold text-primary_dark group-hover:text-secondary_dark md:text-lg">Vendor:</p>
                    <p className="text-base text-secondary_light md:text-lg">{selectedItem.vendor}</p>
                </div>
                <div className="group mx-4 flex flex-row justify-start space-x-4 rounded-md px-2 hover:bg-stone-300">
                    <p className="w-[100px] text-base font-bold text-primary_dark group-hover:text-secondary_dark md:text-lg">Location:</p>
                    <p className="text-base text-secondary_light md:text-lg">{selectedItem.location}</p>
                </div>
                <div className="group mx-4 flex flex-row justify-start space-x-4 rounded-md px-2 hover:bg-stone-300">
                    <p className="w-[100px] text-base font-bold text-primary_dark group-hover:text-secondary_dark md:text-lg">In Stock:</p>
                    <p className="text-base text-secondary_light md:text-lg">{selectedItem.count}</p>
                </div>
                <div className="group mx-4 flex flex-row justify-start space-x-4 rounded-md px-2 hover:bg-stone-300">
                    <p className="w-[100px] text-base font-bold text-primary_dark group-hover:text-secondary_dark md:text-lg">
                        Description:
                    </p>
                    <p className="text-base text-secondary_light md:text-lg">{selectedItem.description}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default SelectedItemView;
