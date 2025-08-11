import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';
import { Mail, Phone, MessageSquare } from 'lucide-react';

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

            <div className="flex h-full w-full flex-col justify-center space-y-6 rounded-lg p-6 text-stone-300 md:w-2/3 lg:p-8">
                {/* Name and RESA Badge */}
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold gradient-gold-main-text lg:text-5xl">Mia Dofflemyer</h1>
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
                            className="h-10 w-auto rounded bg-stone-300 p-1 hover:bg-stone-400 transition-colors lg:h-12"
                        />
                    </Link>
                </div>

                {/* Professional Title */}
                <div className="space-y-1">
                    <p className="text-lg font-medium text-primary">Founder, Capital City Staging</p>
                    <p className="text-sm text-stone-400">Licensed Real Estate Professional • Home Staging Expert</p>
                </div>

                {/* Bio - Split into paragraphs for better readability */}
                <div className="space-y-3 text-stone-300">
                    <p className="text-base leading-relaxed">
                        Hello! I'm Mia Dofflemyer, the founder of Capital City Staging. Raised in the valley and educated at UC Davis, 
                        I later settled in Sacramento to pursue my passion for real estate.
                    </p>
                    <p className="text-base leading-relaxed">
                        Obtaining my license in 2020, I've dedicated myself to assisting individuals in buying and selling homes ever since. 
                        My journey into real estate was driven by my love for home design and helping others.
                    </p>
                    <p className="text-base leading-relaxed">
                        Through my experiences, I've come to understand the crucial role that home staging plays in the selling process. 
                        With my combined passion for real estate and design, founding a staging business felt like a natural progression.
                    </p>
                    <p className="text-base font-medium text-primary">
                        Let me elevate the appeal of your home with my staging expertise, ensuring a swift sale at top value!
                    </p>
                </div>

                {/* Contact Info with Icons */}
                <div className="space-y-3 border-t border-stone-700 pt-4">
                    <div className="flex items-center gap-3 text-stone-300 hover:text-primary transition-colors">
                        <Mail size={18} className="text-primary" />
                        <a href="mailto:mdofflemyer.realestate@gmail.com" className="text-base">
                            mdofflemyer.realestate@gmail.com
                        </a>
                    </div>
                    <div className="flex items-center gap-3 text-stone-300 hover:text-primary transition-colors">
                        <Phone size={18} className="text-primary" />
                        <a href="tel:12098174240" className="text-base">
                            (209) 817-4240
                        </a>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                    <Link href="/contact" className="inline-flex">
                        <button className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary_dark px-6 py-3 text-white font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105">
                            <MessageSquare size={20} />
                            <span>Send me a message</span>
                        </button>
                    </Link>
                </div>
            </div>
            <Tooltip id="resa-tooltip" place="top" />
        </div>
    );
}
