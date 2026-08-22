'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

type HomepageImage = {
    src: string;
    width: number;
    height: number;
};

const FALLBACK_IMAGES: HomepageImage[] = [
    { src: '/portfolio/stock/staging-stock-3.jpg', width: 2560, height: 1695 },
    { src: '/portfolio/stock/staging-stock-7.jpg', width: 564, height: 705 },
    { src: '/portfolio/stock/staging-stock-1.png', width: 2048, height: 1366 },
    { src: '/portfolio/stock/staging-stock-4.png', width: 828, height: 984 },
    { src: '/portfolio/stock/staging-stock-6.jpg', width: 1280, height: 960 },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface InitialHomepageImage {
    imagePath: string;
    width: number;
    height: number;
}

export default function Home({
    initialHomepageImages,
}: {
    initialHomepageImages?: InitialHomepageImage[] | null;
}) {
    // Client-side query for real-time updates after hydration
    const homepageImagesData = useQuery(api.homepageImages.getHomepageImages);

    const [isStagingImageVisible, setStagingImageVisible] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Priority: live Convex data > SSR-preloaded data > hardcoded fallback
    const images: HomepageImage[] = useMemo(() => {
        // 1. Use live Convex data once available (real-time, always up-to-date)
        if (homepageImagesData && homepageImagesData.length > 0) {
            return homepageImagesData.map((img: { imagePath: string; width: number; height: number }) => ({
                src: img.imagePath,
                width: img.width,
                height: img.height,
            }));
        }
        // 2. Use SSR-preloaded data (available immediately, no loading delay)
        if (initialHomepageImages && initialHomepageImages.length > 0) {
            return initialHomepageImages.map((img) => ({
                src: img.imagePath,
                width: img.width,
                height: img.height,
            }));
        }
        // 3. Ultimate fallback to hardcoded local images
        return FALLBACK_IMAGES;
    }, [homepageImagesData, initialHomepageImages]);

    // Preload all images for smooth transitions
    useEffect(() => {
        images.forEach((image) => {
            const img = new window.Image();
            img.src = image.src;
        });
    }, [images]);

    // Image rotation interval
    useEffect(() => {
        const interval = setInterval(async () => {
            setStagingImageVisible(false);
            await delay(1500);
            setCurrentImageIndex((index) => (index + 1) % images.length);
            setStagingImageVisible(true);
        }, 5500);

        return () => clearInterval(interval);
    }, [images.length]);

    // The image list can shrink underneath us when an admin removes a homepage image, so clamp
    // during render rather than correcting it in an effect one paint later.
    const activeImage = images[currentImageIndex] ?? images[0];

    const circularFadeVariants = {
        hidden: {
            background: 'radial-gradient(circle, transparent 0%, rgba(23, 23, 23, 0) 60%)',
        },
        visible: {
            background: 'radial-gradient(circle, transparent 20%, rgba(23, 23, 23, 1) 100%)',
            transition: { duration: 2 },
        },
    };

    return (
        <div className="section-viewport relative w-full overflow-hidden">
            <AnimatePresence>
                {isStagingImageVisible && (
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1.3 }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{ duration: 3 }}
                        className="absolute inset-0 h-full w-full"
                    >
                        <Image
                            src={activeImage.src}
                            width={activeImage.width}
                            height={activeImage.height}
                            className="absolute inset-0 h-full w-full object-cover"
                            alt="One of our recently staged homes"
                            priority
                            sizes="100vw"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                variants={circularFadeVariants}
                initial="hidden"
                animate={isStagingImageVisible ? 'visible' : 'hidden'}
                transition={{ duration: 2 }}
                className="absolute inset-0 bg-surface"
            ></motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <div className="relative flex h-[350px] w-[350px] items-center justify-center rounded-full bg-surface opacity-70">
                    <Image src={'/logo/CCS_logo.png'} alt="Capital City Staging Logo" width={300} height={300} />
                </div>
            </motion.div>
        </div>
    );
}
