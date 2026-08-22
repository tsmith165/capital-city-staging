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
        <aside className="border-line bg-surface-raised shadow-card rounded-xl border p-6 sm:p-8">
            <h2 className="font-display text-gold-300 text-2xl font-semibold">{heading}</h2>
            <p className="text-body-muted mt-3">{body}</p>
            <Link
                href="/contact"
                className="bg-forest-400 text-body hover:bg-forest-300 mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors"
            >
                {action}
                <ArrowRight size={16} aria-hidden="true" />
            </Link>
        </aside>
    );
}
