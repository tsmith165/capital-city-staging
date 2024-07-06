import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { InventoryWithImages } from '@/db/schema';

interface SelectedItemViewProps {
    selectedItem: InventoryWithImages;
    currentImageIndex: number;
    imageList: { src: string; width: number; height: number }[];
    imageLoadStates: { [key: number]: boolean };
    setIsFullScreenImage: (isFullScreen: boolean) => void;
    selectedItemIndex: number | null;
    selectedImageRef: React.RefObject<HTMLDivElement>;
}

const SelectedItemView: React.FC<SelectedItemViewProps> = ({
    selectedItem,
    currentImageIndex,
    imageList,
    imageLoadStates,
    setIsFullScreenImage,
    selectedItemIndex,
    selectedImageRef,
}) => {
    const [currentIndex, setCurrentIndex] = useState(currentImageIndex);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + imageList.length) % imageList.length);
    };

    const handleImageLoad = () => {
        // Update image load state
    };

    return (
        <motion.div
            className={`flex h-fit w-full flex-col items-center p-4 pb-0`}
            ref={selectedImageRef}
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.75 }}
        >
            <h1 className="pb-2 text-center font-cinzel text-2xl font-bold text-primary">{selectedItem.name}</h1>
            <div className="relative flex w-fit cursor-pointer items-center justify-center space-y-2 pb-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${selectedItemIndex}-${currentIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: imageLoadStates[currentIndex] ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsFullScreenImage(true)}
                        className="flex max-h-[40dvh] min-h-[40dvh] w-auto items-center justify-center rounded-md md:max-h-[50dvh] md:min-h-[50dvh]"
                    >
                        <motion.img
                            src={imageList[currentIndex].src}
                            alt={selectedItem.name}
                            width={imageList[currentIndex].width}
                            height={imageList[currentIndex].height}
                            className="max-h-[40dvh] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh] md:min-h-[50dvh]"
                            onLoad={handleImageLoad}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="flex h-7 w-full items-center justify-center space-x-4 pb-1">
                {imageList.length > 1 && (
                    <>
                        <button aria-label="Previous" onClick={handlePrev} className="">
                            <IoIosArrowBack className="fill-stone-600 text-2xl hover:fill-primary" />
                        </button>
                        <div className="flex space-x-2">
                            {imageList.map((_, index) => (
                                <div
                                    key={`dot-${index}`}
                                    className={`h-3 w-3 rounded-full ${index === currentIndex ? 'bg-primary' : 'bg-stone-600'}`}
                                />
                            ))}
                        </div>
                        <button aria-label="Next" onClick={handleNext} className="">
                            <IoIosArrowForward className="fill-stone-600 text-2xl hover:fill-primary" />
                        </button>
                    </>
                )}
            </div>
            <div className="flex h-fit w-full flex-col items-center space-y-2">
                <p className="text-lg font-bold text-primary">{selectedItem.category}</p>
                <p className="text-lg font-bold text-primary">
                    {`${selectedItem.real_width}" x ${selectedItem.real_height}" x ${selectedItem.real_depth}"`}
                </p>
                <p className="text-lg font-bold text-primary">${selectedItem.price}</p>
                <p className="text-lg font-bold text-primary">Vendor: {selectedItem.vendor}</p>
                <p className="text-lg text-primary">Location: {selectedItem.location}</p>
                <p className="text-lg text-primary">In Stock: {selectedItem.count}</p>
                <p className="text-center text-primary">{selectedItem.description}</p>
            </div>
        </motion.div>
    );
};

export default SelectedItemView;