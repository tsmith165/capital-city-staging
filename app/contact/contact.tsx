import React from 'react';
import Image from 'next/image';

export default function Contact() {
    return (
        <div className="h-auto md:h-[calc(100dvh-50px)] w-full flex flex-row justify-center items-center p-4">
            <div className="relative flex flex-col h-full w-full max-h-full">
                <Image
                    src="/bio/bio_pic.jpg"
                    alt="Mia Dofflemyer"
                    width={936}
                    height={1248}
                    className="rounded-lg shadow-lg w-auto max-h-[60vh] md:max-h-full md:h-[calc(100dvh-50px-2rem)] md:w-fit m-auto md:m-0 lg:ml-[15%]"
                />
                <div className="md:absolute md:top-[5%] md:right-0 lg:right-[4%] md:w-1/2 h-fit bg-secondary_dark text-white p-4 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400">
                        Get in Touch with Mia
                    </h1>
                    <p className="text-md md:text-lg">
                        Reach out to Mia for a personalized home staging consultation. Discuss your needs, budget, and timeline to create a tailored staging plan that showcases your home's best features and attracts potential buyers.
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