import React from 'react';
import Image from 'next/image';
import ContactForm from './contact_form';

import dynamic from 'next/dynamic';
const PostHogPageView = dynamic(() => import('@/app/PostHogPageView'), {
    ssr: false,
});

export default function Contact() {
    return (
        <div className="h-full w-full overflow-y-auto">
            <PostHogPageView />
            <div className="flex h-fit w-full flex-col items-center justify-center p-4 md:h-full md:flex-row">
                <div className="md:max-w-1/3 flex h-full w-full items-center justify-center md:h-auto md:w-fit">
                    <Image
                        src="/bio/bio_pic.jpg"
                        alt="Mia Dofflemyer"
                        width={936}
                        height={1248}
                        className="h-[calc(45dvh-50px)] w-auto rounded-lg shadow-lg md:h-[calc(55dvh-50px)] lg:h-[calc(55dvh-50px)]"
                    />
                </div>

                <div className="flex h-full w-full flex-col justify-center space-y-2 rounded-lg p-4 shadow-lg md:w-2/3">
                    <h1 className="text-2xl font-bold gradient-gold-main-text">Get in touch with Mia</h1>
                    <p className="text-md text-stone-300 md:text-lg">
                        Reach out to Mia for a personalized home staging consultation. Discuss your needs, budget, and timeline to create a
                        tailored staging plan that showcases your home's best features and attracts potential buyers.
                    </p>
                    <div className="mt-4">
                        <p className="text-md text-stone-300">mdofflemyer.realestate@gmail.com</p>
                        <p className="text-md text-stone-300">1 (209) 817-4240</p>
                    </div>
                    <div className="mt-4">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
