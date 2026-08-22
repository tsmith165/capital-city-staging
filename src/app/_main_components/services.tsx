'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Sofa, Users } from 'lucide-react';

import SectionHeading from '@/components/content/SectionHeading';
import { PRIMARY_ACTION, QUIET_ACTION } from '@/components/content/content.constants';
import { track } from '@/lib/analytics';
import Statistics from '@/app/_main_components/statistics';
import { SERVICES } from './services.constants';

const ICONS = { vacant: Sofa, occupied: Users } as const;

export default function Services() {
    return (
        <section className="w-full px-5 py-20 sm:px-8">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center">
                <SectionHeading
                    eyebrow="What we do"
                    title="Two ways to stage, one goal"
                    lead="Every quote starts with a walkthrough and a written plan. You see the cost and the reasoning before anything is moved or rented."
                />

                <div className="mt-12 grid w-full gap-6 md:grid-cols-2">
                    {SERVICES.map((service) => {
                        const Icon = ICONS[service.id];

                        return (
                            <article
                                key={service.id}
                                className="flex flex-col rounded-xl border border-line bg-surface-raised p-7 shadow-card transition-colors hover:border-line-strong"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="grid h-10 w-10 place-items-center rounded-md bg-forest-600/60 text-forest-100">
                                        <Icon size={20} aria-hidden="true" />
                                    </span>
                                    <h3 className="font-display text-2xl font-bold text-gold-300">{service.title}</h3>
                                </div>

                                <p className="mt-4 text-body-muted">{service.summary}</p>

                                <p className="mt-4 rounded-md border border-line bg-surface-overlay px-3.5 py-2.5 text-sm text-body-subtle">
                                    <span className="font-semibold text-body-muted">Best for:</span> {service.bestFor}
                                </p>

                                <ul className="mt-6 flex flex-1 flex-col gap-3">
                                    {service.includedItems.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-body-muted">
                                            <Check size={16} className="mt-0.5 shrink-0 text-forest-200" aria-hidden="true" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-5">
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

                <div className="mt-16 w-full">
                    <Statistics />
                </div>
            </div>
        </section>
    );
}
