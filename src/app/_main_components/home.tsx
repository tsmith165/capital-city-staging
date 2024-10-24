'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
    { src: '/portfolio/stock/staging-stock-3.jpg', width: 2560, height: 1695 },
    { src: '/portfolio/stock/staging-stock-7.jpg', width: 564, height: 705 },
    { src: '/portfolio/stock/staging-stock-1.png', width: 2048, height: 1366 },
    { src: '/portfolio/stock/staging-stock-4.png', width: 828, height: 984 },
    { src: '/portfolio/stock/staging-stock-6.jpg', width: 1280, height: 960 },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
    const [isLogoVisible, setLogoVisible] = useState(true);
    const [isStagingImageVisible, setStagingImageVisible] = useState(true);
    const currentImageIndexRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(async () => {
            setStagingImageVisible(false);
            await delay(1500);
            currentImageIndexRef.current = (currentImageIndexRef.current + 1) % images.length;
            setStagingImageVisible(true);
        }, 5500);

        return () => clearInterval(interval);
    }, []);

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
        <div className="relative h-[calc(100dvh-50px)] w-full overflow-hidden">
            <AnimatePresence>
                {isStagingImageVisible && (
                    <motion.div
                        key={currentImageIndexRef.current}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1.3 }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{ duration: 3 }}
                        className="absolute inset-0 h-full w-full"
                    >
                        <Image
                            src={images[currentImageIndexRef.current].src}
                            width={images[currentImageIndexRef.current].width}
                            height={images[currentImageIndexRef.current].height}
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
                className="absolute inset-0 bg-stone-900"
            ></motion.div>
            {isLogoVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="relative flex h-[350px] w-[350px] items-center justify-center rounded-full bg-stone-900 opacity-70">
                        <Image src={require('/public/logo/CCS_logo.png')} alt="Capital City Staging Logo" width={300} height={300} />
                    </div>
                </motion.div>
            )}
        </div>
    );
}
