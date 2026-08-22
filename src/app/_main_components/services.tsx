'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Sofa, Users } from 'lucide-react';

import SectionHeading from '@/components/content/SectionHeading';
import { PRIMARY_ACTION, QUIET_ACTION } from '@/components/content/content.constants';
import { track } from '@/lib/analytics';
import { SERVICES } from './services.constants';

const ICONS = { vacant: Sofa, occupied: Users } as const;

export default function Services() {
    return (
        <section className="w-full px-5 py-20 sm:px-8">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col">
                <SectionHeading
                    eyebrow="What we do"
                    title="Two ways to stage"
                    lead="Every quote starts with a walkthrough and a written plan — you see the cost before anything is moved or rented."
                />

                <div className="mt-12 grid w-full gap-6 md:grid-cols-2">
                    {SERVICES.map((service) => {
                        const Icon = ICONS[service.id];

                        return (
                            <article
                                key={service.id}
                                className="border-line bg-surface-raised shadow-card hover:border-line-strong flex flex-col rounded-xl border p-7 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="bg-forest-600/60 text-forest-100 grid h-10 w-10 place-items-center rounded-md">
                                        <Icon size={20} aria-hidden="true" />
                                    </span>
                                    <h3 className="font-display text-gold-300 text-2xl font-bold">{service.title}</h3>
                                </div>

                                <p className="text-body-muted mt-4">{service.summary}</p>

                                <p className="border-line bg-surface-overlay text-body-subtle mt-4 rounded-md border px-3.5 py-2.5 text-sm">
                                    <span className="text-body-muted font-semibold">Best for:</span> {service.bestFor}
                                </p>

                                <ul className="mt-6 flex flex-1 flex-col gap-3">
                                    {service.includedItems.map((item) => (
                                        <li key={item} className="text-body-muted flex items-start gap-2.5 text-sm">
                                            <Check size={16} className="text-forest-200 mt-0.5 shrink-0" aria-hidden="true" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-line mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-5">
                                    <Link
                                        href="/contact"
                                        className={PRIMARY_ACTION}
                                        onClick={() => track('cta_clicked', { cta: `quote_${service.id}`, placement: 'services_card' })}
                                    >
                                        Get a quote
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </Link>
                                    <Link
                                        href={service.href}
                                        className={QUIET_ACTION}
                                        onClick={() => track('cta_clicked', { cta: `learn_${service.id}`, placement: 'services_card' })}
                                    >
                                        How it works
                                        <ArrowRight size={14} aria-hidden="true" />
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
