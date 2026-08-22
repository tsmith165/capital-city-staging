import React from 'react';
import Image from 'next/image';

import ContactForm from './contact_form';
import ContactChannels from './ContactChannels';

export default function Contact() {
    return (
        <div className="w-full bg-ink">
            <div className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-18">
                <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-12">
                    <Image
                        src="/bio/bio_pic.jpg"
                        alt="Mia Dofflemyer, founder of Capital City Staging"
                        width={936}
                        height={1248}
                        priority
                        sizes="(min-width: 1024px) 260px, 200px"
                        className="mx-auto h-auto w-[200px] rounded-xl border border-line object-cover shadow-card lg:mx-0 lg:w-full"
                    />

                    <div>
                        <p className="text-xs font-bold tracking-[0.2em] text-forest-200 uppercase">Get a quote</p>
                        <h1 className="mt-3 font-display text-4xl leading-tight font-bold gradient-gold-main-text lg:text-5xl">
                            Let&rsquo;s stage your home
                        </h1>
                        <p className="mt-4 max-w-xl text-lg text-pretty text-body-muted">
                            Tell us about the property and you will get a price range straight away. Mia reviews every request
                            personally and follows up with a walkthrough date.
                        </p>

                        <div className="mt-7">
                            <ContactChannels />
                        </div>
                    </div>
                </div>

                <div className="mt-14 border-t border-line pt-14">
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
