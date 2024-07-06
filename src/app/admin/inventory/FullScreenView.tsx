import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { InventoryWithImages } from '@/db/schema';

interface FullScreenViewProps {
    selectedItem: InventoryWithImages | null;
    currentImageIndex: number;
    setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
    imageList: { src: string; width: number; height: number }[];
    setIsFullScreenImage: (isFullScreen: boolean) => void;
    selectedItemIndex: number | null;
}

const FullScreenView: React.FC<FullScreenViewProps> = ({
    selectedItem,
    currentImageIndex,
    setCurrentImageIndex,
    imageList,
    setIsFullScreenImage,
    selectedItemIndex,
}) => {
    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageList.length) % imageList.length);
    };

    return (
        <AnimatePresence>
            {selectedItem && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="relative flex h-full w-full items-center justify-center">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={`${selectedItemIndex}-${currentImageIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="h-[80vh] w-[90vw]"
                                onClick={() => setIsFullScreenImage(false)}
                            >
                                <motion.img
                                    src={imageList[currentImageIndex].src}
                                    alt={selectedItem.name}
                                    className="h-full w-full object-contain"
                                />
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <div className="flex h-7 w-full items-center justify-center space-x-4">
                                {imageList.length > 1 && (
                                    <>
                                        <button aria-label="Previous" onClick={handlePrev} className="">
                                            <IoIosArrowBack className="fill-stone-600 text-2xl hover:fill-primary" />
                                        </button>
                                        <div className="flex space-x-2">
                                            {imageList.map((_, index) => (
                                                <div
                                                    key={`dot-${index}`}
                                                    className={`h-3 w-3 rounded-full ${
                                                        index === currentImageIndex ? 'bg-primary' : 'bg-stone-600'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <button aria-label="Next" onClick={handleNext} className="">
                                            <IoIosArrowForward className="fill-stone-600 text-2xl hover:fill-primary" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullScreenView;