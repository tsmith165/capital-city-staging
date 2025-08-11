import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function Portfolio() {
    const projects = useQuery(api.projects.getHighlightedProjects);
    const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState(false);

    const currentProject = projects?.[selectedProjectIndex];
    const images = currentProject?.images || [];

    if (!projects || projects.length === 0) {
        return (
            <div className="flex min-h-[calc(100dvh-50px)] flex-col items-center justify-center space-y-4 p-4">
                <h1 className="text-4xl font-bold gradient-secondary-main-text">Portfolio Coming Soon</h1>
                <p className="text-stone-400">Check back soon to see our latest staging projects!</p>
            </div>
        );
    }

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
        <div className="min-h-[calc(100dvh-50px)] p-4">
            {/* Header Section */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold gradient-secondary-main-text mb-6">Staged by Mia</h1>
                
                {/* Project Pills */}
                {projects.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {projects.map((project, index) => (
                            <button
                                key={project._id}
                                onClick={() => setSelectedProjectIndex(index)}
                                className={`rounded-full border-2 px-4 py-2 font-medium transition-all ${
                                    index === selectedProjectIndex
                                        ? 'border-secondary bg-secondary text-stone-300'
                                        : 'border-primary bg-transparent text-primary hover:border-secondary hover:bg-secondary hover:text-stone-300'
                                }`}
                            >
                                {project.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Project Info */}
                {currentProject && (
                    <div className="mb-8">
                        {currentProject.address && <p className="text-stone-400 text-lg mb-1">{currentProject.address}</p>}
                        {currentProject.startDate && (
                            <p className="text-stone-500">{new Date(currentProject.startDate).toLocaleDateString()}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Images Grid */}
            {images.length > 0 ? (
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {images.map((image, index) => (
                            <div key={image._id} className="relative group">
                                <Image
                                    src={image.thumbnailPath || image.imagePath}
                                    alt={`${currentProject?.name} - Image ${index + 1}`}
                                    width={image.thumbnailWidth || image.width}
                                    height={image.thumbnailHeight || image.height}
                                    className="w-full h-auto cursor-pointer rounded-lg object-cover transition-transform duration-300 group-hover:scale-105 shadow-lg"
                                    onClick={() => handleImageClick(index)}
                                    priority={index < 4}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-stone-400 text-lg">No images available for this project yet.</p>
                </div>
            )}
            <AnimatePresence>
                {fullScreenImage && selectedImageIndex !== null && (
                    <motion.div
                        className="fixed inset-0 z-50 m-0 flex h-full w-full bg-black bg-opacity-85"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setFullScreenImage(false)}
                    >
                        <div className="relative flex h-full w-full items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImageIndex}
                                    src={images[selectedImageIndex].imagePath}
                                    alt={`${currentProject?.name} - Full-screen image ${selectedImageIndex + 1}`}
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
                                        className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-2"
                                    >
                                        <IoIosArrowBack className="text-4xl text-white" />
                                    </button>
                                    <button
                                        aria-label="Next"
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-2"
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
