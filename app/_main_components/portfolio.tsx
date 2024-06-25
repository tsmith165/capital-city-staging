import React from 'react';
import Image from 'next/image';

const images = [
    { src: '/portfolio/job_1/entry.jpg', width: 1001, height: 1000 },
    { src: '/portfolio/job_1/dining.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/entry_2.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/dining_2.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/office.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/dining_3.jpg', width: 1500, height: 1000 },
    { src: '/portfolio/job_1/dining_4.jpg', width: 1500, height: 1000 },
];

export default function Portfolio() {
    return (
        <div className="min-h-[calc(100dvh-50px)] flex flex-col items-center justify-center p-4 space-y-4">
            <h1 className="h-fit text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary from-10% via-secondary_light via-70% to-secondary_dark to-90%">
                Staged by Mia
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div key={index} className="relative">
                        <Image
                            src={image.src}
                            alt={`Portfolio image ${index + 1}`}
                            width={image.width}
                            height={image.height}
                            className="object-cover w-full rounded-lg"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}