import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';

const images = [
    { src: '/portfolio/job_1/entry.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/dining.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/entry_2.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/dining_2.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/office.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/dining_3.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/dining_4.jpg', width: 1500, height: 1000 },
];

export default function Portfolio() {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState(false);

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
        setFullScreenImage(true);
    };

    const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setSelectedImageIndex((prevIndex) => {
            if (prevIndex === null) return 0;
            return (prevIndex + 1) % images.length;
        });
    };

    const handlePrev = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setSelectedImageIndex((prevIndex) => {
            if (prevIndex === null) return images.length - 1;
            return (prevIndex - 1 + images.length) % images.length;
        });
    };

    return (
        <div className="min-h-[calc(100dvh-50px)] flex flex-col items-center justify-center p-4 space-y-4">
            <h1 className="h-fit text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary from-10% via-secondary_light via-70% to-secondary_dark to-90%">
                Staged by Mia
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 px-8 lg:px-24 x2l:px-48">
                {images.map((image, index) => (
                    <div key={index} className="relative">
                        <Image
                            src={image.src}
                            alt={`Portfolio image ${index + 1}`}
                            width={image.width}
                            height={image.height}
                            className="object-cover w-full rounded-lg cursor-pointer"
                            onClick={() => handleImageClick(index)}
                            priority={true}
                        />
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {fullScreenImage && selectedImageIndex !== null && (
                    <motion.div
                        className="fixed inset-0 z-50 flex bg-black bg-opacity-85 m-0 w-full h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setFullScreenImage(false)}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImageIndex}
                                    src={images[selectedImageIndex].src}
                                    alt={`Full-screen image ${selectedImageIndex + 1}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="max-h-[90vh] max-w-[90vw] object-contain"
                                />
                            </AnimatePresence>
                            {images.length > 1 && (
                                <>
                                    <button
                                        aria-label="Previous"
                                        onClick={handlePrev}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2"
                                    >
                                        <IoIosArrowBack className="text-4xl text-white" />
                                    </button>
                                    <button
                                        aria-label="Next"
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2"
                                    >
                                        <IoIosArrowForward className="text-4xl text-white" />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}