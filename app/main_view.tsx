import React from 'react';
import Image from 'next/image';

export default function MainView() {
    return (
        <div className="relative h-full">
            <Image
                src="/staging-stock-3.jpg"
                width={2560}
                height={1695}
                className="absolute inset-0 w-full h-full object-cover"
                alt="One of our recently staged homes"
            />
            <div className="absolute inset-0 flex flex-col items-center w-full h-full">
                <Image src="/CCS_logo.png" alt="Capital City Staging Logo" width={500} height={500} />
            </div>
        </div>
    );
}
