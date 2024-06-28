import React from 'react';
import Image from 'next/image';
import ContactForm from './contact_form';

export default function Contact() {
    return (
        <div className="h-[calc(100dvh-50px)] w-full flex first-line:justify-center items-center p-4">
            <div className="flex flex-col md:flex-row h-full w-full max-h-full overflow-y-scroll items-center justify-center">
                <div className="flex flex-col md:flex-row w-full md:w-fit md:max-w-1/3 h-full md:h-auto items-center justify-center">
                    <Image
                        src="/bio/bio_pic.jpg"
                        alt="Mia Dofflemyer"
                        width={936}
                        height={1248}
                        className="rounded-lg shadow-lg w-auto h-[calc(45dvh-50px)] md:h-[calc(55dvh-50px)] lg:h-[calc(55dvh-50px)]"
                    />
                </div>

                <div className="flex flex-col h-full w-full md:w-2/3 text-white p-4 space-y-2 rounded-lg shadow-lg justify-center">                      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400">
                        Get in Touch with Mia
                    </h1>
                    <p className="text-md md:text-lg">
                        Reach out to Mia for a personalized home staging consultation. Discuss your needs, budget, and timeline to create a tailored staging plan that showcases your home's best features and attracts potential buyers.
                    </p>
                    <div className="mt-4">
                        <p className="text-md">mdofflemyer.realestate@gmail.com</p>
                        <p className="text-md">1 (209) 817-4240</p>
                    </div>
                    <div className="mt-4">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}