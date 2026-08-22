import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ContactCalloutProps {
    heading?: string;
    body: string;
    action?: string;
}

/** The closing "contact us" block every long-form page ends with. */
export default function ContactCallout({ heading = 'Ready to get started?', body, action = 'Book a consultation' }: ContactCalloutProps) {
    return (
        <aside className="rounded-xl border border-line bg-surface-raised p-6 shadow-card sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-gold-300">{heading}</h2>
            <p className="mt-3 text-body-muted">{body}</p>
            <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-forest-400 px-5 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-forest-300"
            >
                {action}
                <ArrowRight size={16} aria-hidden="true" />
            </Link>
        </aside>
    );
}
