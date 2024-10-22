import React from 'react';
import Image from 'next/image';
import ContactForm from './contact_form'; 

import dynamic from 'next/dynamic'
const PostHogPageView = dynamic(() => import('@/app/PostHogPageView'), {
    ssr: false,
})

export default function Contact() {
    return (
        <div className="h-full w-full overflow-y-auto">
            <PostHogPageView/>
            <div className="h-fit md:h-full w-full flex p-4 flex-col md:flex-row items-center justify-center ">
                <div className="flex w-full md:w-fit md:max-w-1/3 h-full md:h-auto items-center justify-center">
                    <Image
                        src="/bio/bio_pic.jpg"
                        alt="Mia Dofflemyer"
                        width={936}
                        height={1248}
                        className="rounded-lg shadow-lg w-auto h-[calc(45dvh-50px)] md:h-[calc(55dvh-50px)] lg:h-[calc(55dvh-50px)]"
                    />
                </div>

                <div className="flex flex-col h-full w-full md:w-2/3 p-4 space-y-2 rounded-lg shadow-lg justify-center">                      
                    <h1 className="text-2xl font-bold gradient-gold-main-text">
                        Get in touch with Mia
                    </h1>
                    <p className="text-md md:text-lg text-stone-300">
                        Reach out to Mia for a personalized home staging consultation. Discuss your needs, budget, and timeline to create a tailored staging plan that showcases your home's best features and attracts potential buyers.
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