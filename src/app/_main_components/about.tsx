'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail, Phone } from 'lucide-react';

import { PRIMARY_ACTION } from '@/components/content/content.constants';
import { CONTACT_DETAILS } from '@/lib/menu_list';
import { track } from '@/lib/analytics';

export default function About() {
    return (
        <section className="w-full px-5 py-20 sm:px-8">
            <div className="mx-auto grid w-full max-w-[1100px] items-start gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-14">
                <div className="mx-auto w-full max-w-[340px] lg:mx-0">
                    <Image
                        src="/bio/bio_pic.jpg"
                        alt="Mia Dofflemyer, founder of Capital City Staging"
                        width={936}
                        height={1248}
                        className="border-line shadow-card h-auto w-full rounded-xl border object-cover"
                        sizes="(min-width: 1024px) 340px, 100vw"
                    />

                    <div className="border-line bg-surface-raised mt-5 flex items-center gap-3 rounded-lg border p-3.5">
                        <Image
                            src="/logo/RESA_logo.png"
                            alt=""
                            aria-hidden="true"
                            width={1024}
                            height={512}
                            className="bg-body h-9 w-auto shrink-0 rounded p-1"
                        />
                        <p className="text-body-subtle text-xs leading-snug">
                            <Link
                                href="https://www.realestatestagingassociation.com/"
                                className="text-gold-300 hover:text-gold-200 font-semibold"
                            >
                                RESA Certified Professional Home Stager
                            </Link>
                        </p>
                    </div>
                </div>

                <div>
                    <h2 className="font-display gradient-gold-main-text text-3xl font-bold sm:text-4xl">Mia Dofflemyer</h2>
                    <p className="text-body-muted mt-1.5">Founder, Capital City Staging</p>
                    <p className="text-body-subtle text-sm">Licensed Real Estate Professional &bull; Home Staging Expert</p>

                    <div className="text-body-muted mt-6 space-y-4">
                        <p>
                            Hello! I&rsquo;m Mia Dofflemyer, the founder of Capital City Staging. Raised in the valley and educated at UC
                            Davis, I later settled in Sacramento to pursue my passion for real estate.
                        </p>
                        <p>
                            Obtaining my license in 2020, I&rsquo;ve dedicated myself to assisting individuals in buying and selling homes
                            ever since. My journey into real estate was driven by my love for home design and helping others.
                        </p>
                        <p>
                            Through my experiences, I&rsquo;ve come to understand the crucial role that home staging plays in the selling
                            process. With my combined passion for real estate and design, founding a staging business felt like a natural
                            progression.
                        </p>
                        <p className="text-gold-300 font-semibold">
                            Let me elevate the appeal of your home with my staging expertise, ensuring a swift sale at top value!
                        </p>
                    </div>

                    <div className="border-line mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6">
                        <a
                            href={CONTACT_DETAILS.phoneHref}
                            onClick={() => track('contact_channel_clicked', { channel: 'phone', placement: 'about' })}
                            className="text-body-muted hover:text-gold-300 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                        >
                            <Phone size={16} className="text-forest-200" aria-hidden="true" />
                            {CONTACT_DETAILS.phone}
                        </a>
                        <a
                            href={`mailto:${CONTACT_DETAILS.email}`}
                            onClick={() => track('contact_channel_clicked', { channel: 'email', placement: 'about' })}
                            className="text-body-muted hover:text-gold-300 inline-flex items-center gap-2 text-sm font-semibold break-all transition-colors"
                        >
                            <Mail size={16} className="text-forest-200" aria-hidden="true" />
                            {CONTACT_DETAILS.email}
                        </a>
                    </div>

                    <div className="mt-7">
                        <Link
                            href="/contact"
                            className={PRIMARY_ACTION}
                            onClick={() => track('cta_clicked', { cta: 'send_a_message', placement: 'about' })}
                        >
                            Send me a message
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
