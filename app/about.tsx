// File: /app/about.tsx

import React from 'react';
import Image from 'next/image';

export default function About() {
    return (
        <div className="h-auto md:h-[calc(100vh-50px)] w-full flex flex-row justify-center items-center p-4">
            <div className="relative flex flex-col h-full w-full max-h-full">
                <Image
                    src="/bio_pic.jpg"
                    alt="Mia Dofflemyer"
                    width={936}
                    height={1248}
                    className="rounded-lg shadow-lg w-fit h-1/3 md:h-[calc(100vh-50px-2rem)] m-auto md:m-0 lg:m-auto"
                />
                <div className="md:absolute md:top-[5%] md:right-0 lg:right-0 md:w-1/2 h-fit bg-secondary_dark text-white p-4 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400">
                        Mia Dofflemyer
                    </h1>
                    <p className="text-md md:text-lg">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nulla sit amet aliquam lacinia, nisl nisl
                        aliquam nisl, nec aliquam nisl nisl sit amet nisl. Nullam euismod, nulla sit amet aliquam lacinia, nisl nisl aliquam
                        nisl, nec aliquam nisl nisl sit amet nisl.
                    </p>
                    <div className="mt-4">
                        <p className="text-md">mdofflemyer.realestate@gmail.com</p>
                        <p className="text-md">1 (209) 817-4240</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
