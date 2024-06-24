import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
    return (
        <div className="h-[calc(100dvh-50px)] w-full flex first-line:justify-center items-center p-4">
            <div className="relative flex flex-col h-full w-full max-h-full overflow-y-scroll ">
                <Image
                    src="/bio/bio_pic.jpg"
                    alt="Mia Dofflemyer"
                    width={936}
                    height={1248}
                    className="absolute rounded-lg shadow-lg w-auto h-[calc(45dvh-50px)] md:h-[calc(55dvh-50px)] lg:h-[calc(55dvh-50px)] m-auto left-0 right-0"
                />
                <div className="absolute top-[calc(40dvh-50px)] md:top-[calc(50dvh-50px)] lg:top-[calc(50dvh-50px)] w-full h-fit bg-secondary_dark text-white p-4 space-y-2 rounded-lg shadow-lg">                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400">
                        Mia Dofflemyer
                    </h1>
                    <p className="text-md md:text-lg">
                        Hello! I'm Mia Dofflemyer, the founder of Capital City Staging. Raised in the valley and educated at UC Davis, I
                        later settled in Sacramento to pursue my passion for real estate. Obtaining my license in 2020, I've dedicated
                        myself to assisting individuals in buying and selling homes ever since. My journey into real estate was driven by my
                        love for home design and helping others. Through my experiences, I've come to understand the crucial role that home
                        staging plays in the selling process. With my combined passion for real estate and design, founding a staging
                        business felt like a natural progression. Let me elevate the appeal of your home with my staging expertise, ensuring
                        a swift sale at top value!
                    </p>
                    <div className="">
                        <p className="text-md">mdofflemyer.realestate@gmail.com</p>
                        <p className="text-md">1 (209) 817-4240</p>
                    </div>
                    <Link href="/contact" className='flex'>
                        <div className={
                            `flex group items-center justify-center w-full py-2 font-bold rounded-md px-2 text-md ` +
                            `bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 `
                            + `hover:from-secondary hover:via-secondary_light hover:to-secondary`
                        }>
                            <div className="group-hover:text-white text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary_light to-secondary">
                                {`Send me a message`}
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
