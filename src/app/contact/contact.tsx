import React from 'react';
import Image from 'next/image';

import ContactForm from './contact_form';
import ContactChannels from './ContactChannels';

export default function Contact() {
    return (
        <div className="bg-ink w-full">
            <div className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-18">
                <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-12">
                    <Image
                        src="/bio/bio_pic.jpg"
                        alt="Mia Dofflemyer, founder of Capital City Staging"
                        width={936}
                        height={1248}
                        priority
                        sizes="(min-width: 1024px) 260px, 200px"
                        className="border-line shadow-card mx-auto h-auto w-[200px] rounded-xl border object-cover lg:mx-0 lg:w-full"
                    />

                    <div>
                        <p className="text-forest-200 text-xs font-bold tracking-[0.2em] uppercase">Get a quote</p>
                        <h1 className="font-display gradient-gold-main-text mt-3 text-4xl leading-tight font-bold lg:text-5xl">
                            Let&rsquo;s stage your home
                        </h1>
                        <p className="text-body-muted mt-4 max-w-xl text-lg text-pretty">
                            Tell Mia about the property and timing; she&rsquo;ll follow up to schedule a walkthrough.
                        </p>

                        <div className="mt-7">
                            <ContactChannels />
                        </div>
                    </div>
                </div>

                <div className="border-line mt-14 border-t pt-14">
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
