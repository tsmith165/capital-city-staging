import React from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import ContactForm from './contact_form';

export default function Contact() {
    return (
        <div className="h-full w-full overflow-y-auto bg-stone-900">
            {/* Top Section - Image and Header */}
            <div className="flex flex-col lg:flex-row items-center justify-center p-6 lg:p-8 gap-8">
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
                <div className="flex-1 max-w-2xl space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold gradient-gold-main-text mb-4 lg:text-5xl text-center lg:text-left">
                            Let's Stage Your Home
                        </h1>
                        <p className="text-lg text-stone-300 leading-relaxed text-center lg:text-left">
                            Ready to transform your property into a buyer's dream? Get an instant estimate with our quote calculator below.
                        </p>
                    </div>

                    {/* Quick Contact Card */}
                    <div className="rounded-lg bg-stone-800/50 border border-stone-700 p-6 space-y-4">
                        <h3 className="text-xl font-bold gradient-gold-main-text mb-4">Quick Contact</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <a href="mailto:mdofflemyer.realestate@gmail.com" 
                               className="flex items-center gap-3 text-stone-300 hover:text-primary transition-colors group">
                                <Mail size={18} className="text-primary" />
                                <span className="text-sm">mdofflemyer.realestate@gmail.com</span>
                            </a>
                            
                            <a href="tel:12098174240" 
                               className="flex items-center gap-3 text-stone-300 hover:text-primary transition-colors group">
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

                        <div className="pt-3 border-t border-stone-700 text-center">
                            <p className="text-xs text-stone-400 italic">
                                Response time: Within 24 hours
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Form Section */}
            <div className="w-full px-4 pb-8">
                <div className="max-w-4xl mx-auto">
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}