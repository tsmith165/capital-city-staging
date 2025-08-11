import React from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import ContactForm from './contact_form';

export default function Contact() {
    return (
        <div className="h-full w-full overflow-y-auto bg-stone-900">
            {/* Top Section - Image and Header */}
            <div className="flex flex-col items-center justify-center gap-8 p-6 lg:flex-row lg:p-8">
                {/* Left side - Mia's Image */}
                <div className="flex-shrink-0">
                    <Image
                        src="/bio/bio_pic.jpg"
                        alt="Mia Dofflemyer"
                        width={936}
                        height={1248}
                        className="h-[300px] w-auto rounded-lg shadow-2xl lg:h-[400px]"
                    />
                </div>

                {/* Right side - Header and Quick Contact */}
                <div className="max-w-2xl flex-1 space-y-6">
                    <div>
                        <h1 className="mb-4 pb-2 overflow-visible text-center text-4xl font-bold gradient-gold-main-text leading-tight lg:text-left lg:text-5xl lg:leading-tight">
                            Let's Stage Your Home
                        </h1>
                        <p className="text-center text-lg leading-relaxed text-stone-300 lg:text-left">
                            Ready to transform your property into a buyer's dream? Get in touch below!
                        </p>
                    </div>

                    {/* Quick Contact Card */}
                    <div className="space-y-4 rounded-lg border border-stone-700 bg-stone-800/50 p-6">
                        <h3 className="mb-4 text-xl font-bold gradient-gold-main-text">Quick Contact</h3>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <a
                                href="mailto:mdofflemyer.realestate@gmail.com"
                                className="group flex items-center gap-3 text-stone-300 transition-colors hover:text-primary"
                            >
                                <Mail size={18} className="text-primary" />
                                <span className="text-sm">mdofflemyer.realestate@gmail.com</span>
                            </a>

                            <a
                                href="tel:12098174240"
                                className="group flex items-center gap-3 text-stone-300 transition-colors hover:text-primary"
                            >
                                <Phone size={18} className="text-primary" />
                                <span className="text-sm">(209) 817-4240</span>
                            </a>

                            <div className="flex items-center gap-3 text-stone-300">
                                <MapPin size={18} className="text-primary" />
                                <span className="text-sm">Sacramento, California</span>
                            </div>

                            <div className="flex items-center gap-3 text-stone-300">
                                <Clock size={18} className="text-primary" />
                                <span className="text-sm">Mon-Fri: 9AM-6PM PST</span>
                            </div>
                        </div>

                        <div className="border-t border-stone-700 pt-3 text-center">
                            <p className="text-xs italic text-stone-400">Response time: Within 24 hours</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Form Section */}
            <div className="w-full px-4 pb-8">
                <div className="mx-auto max-w-4xl">
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
