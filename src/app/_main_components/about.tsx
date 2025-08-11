import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';

export default function About() {
    return (
        <div className="flex h-fit w-full flex-col items-center justify-center p-4 md:h-[calc(100dvh-50px)] md:flex-row">
            <div className="md:max-w-1/3 flex h-full w-full items-center justify-center md:h-auto md:w-fit">
                <Image
                    src="/bio/bio_pic.jpg"
                    alt="Mia Dofflemyer"
                    width={936}
                    height={1248}
                    className="h-[calc(45dvh-50px)] w-auto rounded-lg shadow-lg md:h-[calc(55dvh-50px)] lg:h-[calc(55dvh-50px)]"
                />
            </div>

            <div className="flex h-full w-full flex-col justify-center space-y-2 rounded-lg p-4 text-stone-300 shadow-lg md:w-2/3">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold gradient-gold-main-text">Mia Dofflemyer</h1>
                    <Link 
                        href="https://www.realestatestagingassociation.com/" 
                        className="flex"
                        data-tooltip-id="resa-tooltip"
                        data-tooltip-content="RESA Certified Professional Home Stager"
                    >
                        <Image
                            src="/logo/RESA_logo.png"
                            alt="RESA Logo"
                            width={1024}
                            height={512}
                            className="h-10 w-auto rounded bg-stone-300 p-1 hover:bg-stone-400 transition-colors"
                        />
                    </Link>
                </div>
                <p className="text-md text-stone-300 md:text-lg">
                    Hello! I'm Mia Dofflemyer, the founder of Capital City Staging. Raised in the valley and educated at UC Davis, I later
                    settled in Sacramento to pursue my passion for real estate. Obtaining my license in 2020, I've dedicated myself to
                    assisting individuals in buying and selling homes ever since. My journey into real estate was driven by my love for home
                    design and helping others. Through my experiences, I've come to understand the crucial role that home staging plays in
                    the selling process. With my combined passion for real estate and design, founding a staging business felt like a
                    natural progression. Let me elevate the appeal of your home with my staging expertise, ensuring a swift sale at top
                    value!
                </p>
                <div className="">
                    <p className="text-md text-stone-300">mdofflemyer.realestate@gmail.com</p>
                    <p className="text-md text-stone-300">1 (209) 817-4240</p>
                </div>
                <div className="flex h-[2.5rem] flex-row">
                    <Link href="/contact" className="flex">
                        <div
                            className={
                                `group flex w-full items-center justify-center rounded-md px-8 py-2 text-base font-bold gradient-gold-main ` +
                                +`hover:from-secondary hover:via-secondary_light hover:to-secondary`
                            }
                        >
                            <div className="gradient-text w-full gradient-secondary-main-text group-hover:text-white">
                                {`Send me a message`}
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
            <Tooltip id="resa-tooltip" place="top" />
        </div>
    );
}
