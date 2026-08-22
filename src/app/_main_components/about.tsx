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
                        className="h-auto w-full rounded-xl border border-line object-cover shadow-card"
                        sizes="(min-width: 1024px) 340px, 100vw"
                    />

                    <div className="mt-5 flex items-center gap-3 rounded-lg border border-line bg-surface-raised p-3.5">
                        <Image
                            src="/logo/RESA_logo.png"
                            alt=""
                            aria-hidden="true"
                            width={1024}
                            height={512}
                            className="h-9 w-auto shrink-0 rounded bg-body p-1"
                        />
                        <p className="text-xs leading-snug text-body-subtle">
                            Certified through the{' '}
                            <Link
                                href="https://www.realestatestagingassociation.com/"
                                className="font-semibold text-gold-300 hover:text-gold-200"
                            >
                                Real Estate Staging Association
                            </Link>
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold tracking-[0.2em] text-forest-200 uppercase">Who you will work with</p>
                    <h2 className="mt-3 font-display text-3xl font-bold gradient-gold-main-text sm:text-4xl">Mia Dofflemyer</h2>
                    <p className="mt-1.5 text-body-muted">Founder, Capital City Staging</p>
                    <p className="text-sm text-body-subtle">Licensed California real estate agent since 2020</p>

                    <div className="mt-6 space-y-4 text-body-muted">
                        <p>
                            I grew up in the valley, studied at UC Davis, and have spent the years since helping people in Sacramento
                            buy and sell homes. Staging is the part of that work I kept coming back to, because it is the part that
                            most reliably changes the outcome.
                        </p>
                        <p>
                            Selling a house is a transaction to everyone except the person who lived in it. I stage with both in mind:
                            what a buyer needs to see in the first ten seconds, and what it takes to hand your home over well.
                        </p>
                        <p>
                            You deal with me directly, from the walkthrough through to collection. There is no account manager and no
                            handoff.
                        </p>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
                        <a
                            href={CONTACT_DETAILS.phoneHref}
                            onClick={() => track('contact_channel_clicked', { channel: 'phone', placement: 'about' })}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-body-muted transition-colors hover:text-gold-300"
                        >
                            <Phone size={16} className="text-forest-200" aria-hidden="true" />
                            {CONTACT_DETAILS.phone}
                        </a>
                        <a
                            href={`mailto:${CONTACT_DETAILS.email}`}
                            onClick={() => track('contact_channel_clicked', { channel: 'email', placement: 'about' })}
                            className="inline-flex items-center gap-2 break-all text-sm font-semibold text-body-muted transition-colors hover:text-gold-300"
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
