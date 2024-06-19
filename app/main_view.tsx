// File 1: /app/main_view.tsx

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const images = [
    { src: '/staging-stock-3.jpg', width: 2560, height: 1695 },
    { src: '/staging-stock-1.png', width: 2048, height: 1366 },
    { src: '/staging-stock-2.png', width: 2000, height: 1334 },
];

// Delay function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MainView() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLogoVisible, setLogoVisible] = useState(true);
    const [isStagingImageVisible, setStagingImageVisible] = useState(false);

    useEffect(() => {
        const animationSequence = async () => {
            await delay(2000);
            setLogoVisible(false);
            await delay(2000);
            setLogoVisible(true);
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
            animationSequence();
        };

        const initialAnimationSequence = async () => {
            await delay(2000);
            setStagingImageVisible(true);
            animationSequence();
        };

        initialAnimationSequence();
    }, []);

    console.log(
        `currentImageIndex: ${currentImageIndex} | isLogoVisible: ${isLogoVisible} | isStagingImageVisible: ${isStagingImageVisible}`
    );

    return (
        <div className="relative h-full">
            <div className="absolute inset-0 bg-neutral-950 transition-opacity duration-2000 ease-in-out opacity-100"></div>
            {isStagingImageVisible && (
                <div
                    key={currentImageIndex}
                    className="absolute inset-0 w-full h-full transition-opacity duration-2000 ease-in-out opacity-100 scale-110">
                    <Image
                        src={images[currentImageIndex].src}
                        width={images[currentImageIndex].width}
                        height={images[currentImageIndex].height}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="One of our recently staged homes"
                    />
                </div>
            )}
            {isLogoVisible && (
                <div className="absolute inset-0 flex justify-center items-center">
                    <div className="relative bg-neutral-950 rounded-full w-[350px] h-[350px] flex justify-center items-center opacity-70">
                        <Image src={require('/public/CCS_logo.png')} alt="Capital City Staging Logo" width={300} height={300} />
                    </div>
                </div>
            )}
        </div>
    );
}
