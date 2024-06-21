import React from 'react';
import Image from 'next/image';

const images = [
    { src: '/portfolio/staging-stock-3.jpg', width: 2560, height: 1695, address: '123 Main St' },
    { src: '/portfolio/staging-stock-7.jpg', width: 564, height: 705, address: '456 Elm St' },
    { src: '/portfolio/staging-stock-1.png', width: 2048, height: 1366, address: '789 Oak St' },
    { src: '/portfolio/staging-stock-4.png', width: 828, height: 984, address: '101 Pine St' },
    { src: '/portfolio/staging-stock-6.jpg', width: 1280, height: 960, address: '202 Maple St' },
    { src: '/portfolio/staging-stock-2.png', width: 1024, height: 768, address: '303 Birch St' },
];

export default function Portfolio() {
    return (
        <div className="min-h-[calc(100dvh-50px)] flex flex-col items-center justify-center p-4 pt-0 space-y-4">
            <h1 className="h-fit text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary from-10% via-secondary_light via-70% to-secondary_dark to-90%">
                Staged by Mia
            </h1>
            <div className="columns-2 md:columns-3 gap-4">
                {images.map((image, index) => (
                    <div key={index} className="mb-4 relative break-inside-avoid">
                        <Image
                            src={image.src}
                            alt={`Portfolio image ${index + 1}`}
                            width={image.width}
                            height={image.height}
                            className="object-cover w-full rounded-lg"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {image.address}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
