import React from 'react';

import { statistics } from '@/lib/statistics';

/** Why staging is worth paying for, stated once, with the numbers attributed. */
export default function Statistics() {
    return (
        <section aria-labelledby="staging-impact" className="rounded-xl border border-line bg-surface-raised p-7 shadow-card">
            <h3 id="staging-impact" className="text-center text-xs font-bold tracking-[0.2em] text-forest-200 uppercase">
                What staging changes
            </h3>

            <dl className="mt-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {statistics.map((stat) => (
                    <div key={stat.value + stat.claim} className="text-center">
                        <dt className="font-display text-4xl font-bold gradient-gold-main-text">{stat.value}</dt>
                        <dd className="mt-2 text-sm text-pretty text-body-muted">
                            {stat.claim}
                            <span className="mt-2 block text-xs text-body-subtle">{stat.source}</span>
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
