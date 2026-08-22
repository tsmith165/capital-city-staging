'use client';

import React from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { CONTACT_DETAILS } from '@/lib/menu_list';
import { track } from '@/lib/analytics';

const ROW = 'flex items-center gap-3 text-sm text-body-muted';

export default function ContactChannels() {
    return (
        <div className="rounded-xl border border-line bg-surface-raised p-6 shadow-card">
            <h2 className="text-xs font-bold tracking-[0.2em] text-forest-200 uppercase">Reach Mia directly</h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <a
                    href={CONTACT_DETAILS.phoneHref}
                    onClick={() => track('contact_channel_clicked', { channel: 'phone', placement: 'contact_page' })}
                    className={`${ROW} font-semibold transition-colors hover:text-gold-300`}
                >
                    <Phone size={17} className="shrink-0 text-forest-200" aria-hidden="true" />
                    {CONTACT_DETAILS.phone}
                </a>

                <a
                    href={`mailto:${CONTACT_DETAILS.email}`}
                    onClick={() => track('contact_channel_clicked', { channel: 'email', placement: 'contact_page' })}
                    className={`${ROW} font-semibold break-all transition-colors hover:text-gold-300`}
                >
                    <Mail size={17} className="shrink-0 text-forest-200" aria-hidden="true" />
                    {CONTACT_DETAILS.email}
                </a>

                <p className={ROW}>
                    <MapPin size={17} className="shrink-0 text-forest-200" aria-hidden="true" />
                    Sacramento, California
                </p>

                <p className={ROW}>
                    <Clock size={17} className="shrink-0 text-forest-200" aria-hidden="true" />
                    Monday to Friday, 9am to 6pm Pacific
                </p>
            </div>

            <p className="mt-5 border-t border-line pt-4 text-xs text-body-subtle">
                Quote requests are answered within one business day. If a listing goes live sooner than that, call and say so.
            </p>
        </div>
    );
}
