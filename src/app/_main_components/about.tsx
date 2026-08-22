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
                            Certified through the{' '}
                            <Link
                                href="https://www.realestatestagingassociation.com/"
                                className="text-gold-300 hover:text-gold-200 font-semibold"
                            >
                                Real Estate Staging Association
                            </Link>
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-forest-200 text-xs font-bold tracking-[0.2em] uppercase">Who you&rsquo;ll work with</p>
                    <h2 className="font-display gradient-gold-main-text mt-3 text-3xl font-bold sm:text-4xl">Mia Dofflemyer</h2>
                    <p className="text-body-muted mt-1.5">Founder, Capital City Staging</p>
                    <p className="text-body-subtle text-sm">Licensed California real estate agent since 2020</p>

                    <div className="text-body-muted mt-6 space-y-4">
                        <p>
                            I grew up in the valley, studied at UC Davis, and have spent the years since helping people in Sacramento buy
                            and sell homes. Staging is the part I kept coming back to &mdash; it&rsquo;s what most reliably changes the
                            outcome.
                        </p>
                        <p>
                            Selling a house is a transaction to everyone except the person who lived in it. I stage for the buyer&rsquo;s
                            first impression without forgetting whose home it still is.
                        </p>
                        <p>You deal with me directly, from walkthrough to pickup. No account manager, no handoff.</p>
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
                            onClick={() => track('cta_clicked', { cta: 'get_a_quote', placement: 'about' })}
                        >
                            Get a free quote
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
