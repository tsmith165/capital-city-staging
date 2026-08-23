'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Check, Mail, Phone, RotateCcw, Trash2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import AdminShell from '@/components/admin/AdminShell';
import { AdminEmpty, AdminHeading, AdminStatus } from '@/components/admin/AdminPrimitives';
import { SkeletonTiles } from '@/components/admin/AdminSkeleton';

import { INBOX_FILTERS } from './AdminInbox.constants';
import type { InboxFilter } from './AdminInbox.types';

const fullDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

export default function AdminInboxClient() {
    const [filter, setFilter] = useState<InboxFilter>('unanswered');
    const [error, setError] = useState<string | null>(null);

    const submissions = useQuery(api.contactSubmissions.getSubmissions, filter === 'all' ? {} : { responded: filter === 'answered' });
    const setResponded = useMutation(api.contactSubmissions.setResponded);
    const deleteSubmission = useMutation(api.contactSubmissions.deleteSubmission);

    const runOrFail = async (action: Promise<unknown>, message: string) => {
        setError(null);
        try {
            await action;
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : message);
        }
    };

    const handleDelete = async (id: Id<'contactSubmissions'>, name: string) => {
        if (!window.confirm(`Delete the message from ${name}? This cannot be undone.`)) return;
        await runOrFail(deleteSubmission({ id }), 'Could not delete that message.');
    };

    return (
        <AdminShell title="Inbox">
            <div className="flex flex-col gap-6 p-5 sm:p-8">
                <AdminHeading
                    eyebrow="Clients"
                    title="Inbox"
                    description="Quote requests, including any whose notification email failed."
                />

                {error && (
                    <p role="alert" className="border-danger/40 bg-danger-soft text-danger rounded-md border px-4 py-2.5 text-sm">
                        {error}
                    </p>
                )}

                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter messages">
                    {INBOX_FILTERS.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            aria-pressed={filter === value}
                            className={`rounded-md border px-3.5 py-2 text-xs font-bold transition-colors ${
                                filter === value
                                    ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                                    : 'border-line text-body-muted hover:bg-surface-raised hover:text-body'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {submissions === undefined ? (
                    <SkeletonTiles count={4} label="Loading messages" className="flex flex-col gap-3" />
                ) : submissions.length === 0 ? (
                    <div className="border-line bg-surface-raised rounded-lg border">
                        <AdminEmpty>
                            {filter === 'unanswered'
                                ? 'No messages need a reply.'
                                : filter === 'answered'
                                  ? 'No answered messages yet.'
                                  : 'No messages yet.'}
                        </AdminEmpty>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {submissions.map((submission) => (
                            <li
                                key={submission._id}
                                className="border-line bg-surface-raised shadow-card flex flex-col gap-3 rounded-lg border p-5"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <strong className="font-display text-body text-lg leading-tight font-normal">
                                            {submission.name}
                                        </strong>
                                        <div className="text-body-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                            <a
                                                href={`mailto:${submission.email}`}
                                                className="hover:text-gold-300 inline-flex items-center gap-1.5 transition-colors"
                                            >
                                                <Mail size={13} aria-hidden="true" /> {submission.email}
                                            </a>
                                            {submission.phone && (
                                                <a
                                                    href={`tel:${submission.phone}`}
                                                    className="hover:text-gold-300 inline-flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Phone size={13} aria-hidden="true" /> {submission.phone}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <AdminStatus tone={submission.responded ? 'good' : 'warning'}>
                                        {submission.responded ? 'Answered' : 'New'}
                                    </AdminStatus>
                                </div>

                                <p className="text-body-muted text-sm leading-relaxed whitespace-pre-wrap">{submission.message}</p>

                                <div className="border-line flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                                    <small className="text-body-subtle text-[11px]">
                                        Received {fullDate.format(new Date(submission.createdAt))}
                                        {submission.respondedAt ? ` · answered ${fullDate.format(new Date(submission.respondedAt))}` : ''}
                                    </small>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void runOrFail(
                                                    setResponded({ id: submission._id, responded: !submission.responded }),
                                                    'Could not update that message.',
                                                )
                                            }
                                            className="border-line text-body-muted hover:bg-surface-overlay hover:text-body inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold transition-colors"
                                        >
                                            {submission.responded ? (
                                                <>
                                                    <RotateCcw size={13} aria-hidden="true" /> Mark unanswered
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={13} aria-hidden="true" /> Mark answered
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(submission._id, submission.name)}
                                            aria-label={`Delete message from ${submission.name}`}
                                            className="border-line text-body-muted hover:border-danger/40 hover:bg-danger-soft hover:text-danger inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold transition-colors"
                                        >
                                            <Trash2 size={13} aria-hidden="true" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AdminShell>
    );
}
