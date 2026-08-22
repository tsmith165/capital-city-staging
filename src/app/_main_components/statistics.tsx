import React from 'react';

import { statistics } from '@/lib/statistics';

/**
 * What staging does to buyer behaviour, with the numbers attributed. Shallower vertical padding
 * than the surrounding sections: a single row of numbers does not need 160px of air around it.
 */
export default function Statistics() {
    return (
        <div className="w-full px-5 py-12 sm:px-8">
            <section
                aria-labelledby="staging-impact"
                className="border-line bg-surface-raised shadow-card mx-auto w-full max-w-[1200px] rounded-xl border p-7"
            >
                <h3 id="staging-impact" className="text-forest-200 text-center text-xs font-bold tracking-[0.2em] uppercase">
                    How buyers respond
                </h3>

                {/* Numbers are the one thing on this page that should stay centred. */}
                <dl className="mx-auto mt-7 grid max-w-3xl gap-8 sm:grid-cols-2">
                    {statistics.map((stat) => (
                        <div key={stat.value + stat.claim} className="text-center">
                            <dt className="font-display gradient-gold-main-text text-4xl font-bold">{stat.value}</dt>
                            <dd className="text-body-muted mt-2 text-sm text-pretty">
                                {stat.claim}
                                <span className="text-body-subtle mt-2 block text-xs">{stat.source}</span>
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>
        </div>
    );
}
