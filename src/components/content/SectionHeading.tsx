import React from 'react';

interface SectionHeadingProps {
    eyebrow?: string;
    title: string;
    lead?: string;
    align?: 'center' | 'left';
    id?: string;
}

/**
 * Every homepage section previously stacked its own heading treatment: an h2, a second
 * paragraph styled larger than the h2, and a lead. Three competing sizes read as three
 * headings rather than one.
 *
 * Left is the default axis. The hero and the bio were always left-aligned, so centring the
 * sections between them gave the page two spines and left every wrapped lead ragged.
 */
export default function SectionHeading({ eyebrow, title, lead, align = 'left', id }: SectionHeadingProps) {
    const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';

    return (
        <div className={`flex w-full flex-col gap-3 ${alignment}`}>
            {eyebrow ? (
                <p className="text-xs font-bold tracking-[0.2em] text-forest-200 uppercase">{eyebrow}</p>
            ) : null}
            <h2 id={id} className="font-display text-3xl font-bold text-balance gradient-gold-main-text sm:text-4xl">
                {title}
            </h2>
            {lead ? <p className="max-w-xl text-base text-pretty text-body-muted sm:text-lg">{lead}</p> : null}
        </div>
    );
}
