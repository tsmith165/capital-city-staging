import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
    return (
        <div className="h-fit md:h-[calc(100dvh-50px)] w-full flex p-4 flex-col md:flex-row items-center justify-center">
            <div className="flex w-full md:w-fit md:max-w-1/3 h-full md:h-auto items-center justify-center">
                <Image
                    src="/bio/bio_pic.jpg"
                    alt="Mia Dofflemyer"
                    width={936}
                    height={1248}
                    className="rounded-lg shadow-lg w-auto h-[calc(45dvh-50px)] md:h-[calc(55dvh-50px)] lg:h-[calc(55dvh-50px)]"
                />
            </div>

            <div className="flex flex-col h-full w-full md:w-2/3 text-stone-300 p-4 space-y-2 rounded-lg shadow-lg justify-center">                    
                <h1 className="text-2xl font-bold gradient-gold-main-text">
                    Mia Dofflemyer
                </h1>
                <p className="text-md md:text-lg text-stone-300">
                    Hello! I'm Mia Dofflemyer, the founder of Capital City Staging. Raised in the valley and educated at UC Davis, I
                    later settled in Sacramento to pursue my passion for real estate. Obtaining my license in 2020, I've dedicated
                    myself to assisting individuals in buying and selling homes ever since. My journey into real estate was driven by my
                    love for home design and helping others. Through my experiences, I've come to understand the crucial role that home
                    staging plays in the selling process. With my combined passion for real estate and design, founding a staging
                    business felt like a natural progression. Let me elevate the appeal of your home with my staging expertise, ensuring
                    a swift sale at top value!
                </p>
                <div className="">
                    <p className="text-md text-stone-300">mdofflemyer.realestate@gmail.com</p>
                    <p className="text-md text-stone-300">1 (209) 817-4240</p>
                </div>
                <div className="flex flex-row h-[2.5rem]">
                    <Link href="/contact" className='flex'>
                        <div className={
                            `flex group items-center justify-center w-full py-2 font-bold rounded-md px-8 text-base gradient-gold-main ` +
                            + `hover:from-secondary hover:via-secondary_light hover:to-secondary`
                        }>
                            <div className="group-hover:text-white gradient-text gradient-secondary-main-text w-full">
                                {`Send me a message`}
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="flex flex-row h-[8rem]">
                    <Link href="https://www.realestatestagingassociation.com/" className='flex'>
                        <Image src="/logo/RESA_logo.png" alt="RESA Logo" width={1024} height={512} className="max-h-full w-auto bg-stone-300 rounded-3xl p-2 hover:bg-stone-400"/>
                    </Link>
                </div>
            </div>
        </div>
    );
}
