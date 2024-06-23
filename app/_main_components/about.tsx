import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
    return (
        <div className="h-auto md:h-[calc(100dvh-50px)] w-full flex flex-row justify-center items-center p-4 pt-0">
            <div className="relative flex flex-col h-full w-full max-h-full">
                <Image
                    src="/bio/bio_pic.jpg"
                    alt="Mia Dofflemyer"
                    width={936}
                    height={1248}
                    className="rounded-lg shadow-lg w-auto max-h-[60vh] md:max-h-full md:h-[calc(100dvh-50px-2rem)] md:w-fit m-auto md:m-0 lg:ml-[15%]"
                />
                <div className="md:absolute md:top-[5%] md:right-0 lg:right-[4%] md:w-1/2 h-fit bg-secondary_dark text-white p-4 space-y-2 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400">
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
