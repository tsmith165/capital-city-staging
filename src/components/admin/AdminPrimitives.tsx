import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { ADMIN_STATUS_TONE_CLASSES } from './AdminShell.constants';
import type { AdminStatusTone } from './AdminShell.types';

/** Page-level heading. Every admin page opens with the same eyebrow / title / description block. */
export function AdminHeading({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gold-300">{eyebrow}</span>
                <h1 className="font-display text-3xl font-normal leading-tight text-body">{title}</h1>
                <p className="max-w-2xl text-sm text-body-muted">{description}</p>
            </div>
            {action}
        </header>
    );
}

export function AdminStatus({ tone = 'neutral', children }: { tone?: AdminStatusTone; children: ReactNode }) {
    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${ADMIN_STATUS_TONE_CLASSES[tone]}`}
        >
            {children}
        </span>
    );
}

/** Attention card: an icon-labelled headline, one line of explanation, and a single way forward. */
export function AdminCard({
    icon: Icon,
    label,
    headline,
    description,
    href,
    linkLabel,
    tone = 'neutral',
}: {
    icon: LucideIcon;
    label: string;
    headline: string;
    description: string;
    href: string;
    linkLabel: string;
    tone?: AdminStatusTone;
}) {
    return (
        <article className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5 shadow-card transition-colors hover:border-line-strong">
            <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-body-subtle">
                <Icon size={16} aria-hidden="true" />
                {label}
            </span>
            <h2 className="font-display text-xl font-normal leading-snug text-body">{headline}</h2>
            <p className="text-sm text-body-muted">{description}</p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 transition-colors hover:text-gold-200"
                >
                    {linkLabel} <ArrowRight size={14} aria-hidden="true" />
                </Link>
                {tone !== 'neutral' && <AdminStatus tone={tone}>{tone === 'good' ? 'Clear' : 'Action needed'}</AdminStatus>}
            </div>
        </article>
    );
}

export function AdminMetric({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="flex flex-col gap-1 rounded-lg border border-line bg-surface px-4 py-3.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-body-subtle">{label}</span>
            <strong className="font-display text-2xl font-normal leading-none text-body">{value}</strong>
            {hint && <small className="text-[11px] text-body-subtle">{hint}</small>}
        </div>
    );
}

export function AdminPanel({
    eyebrow,
    title,
    href,
    linkLabel = 'View all',
    children,
}: {
    eyebrow: string;
    title: string;
    href?: string;
    linkLabel?: string;
    children: ReactNode;
}) {
    return (
        <section className="flex min-w-0 flex-col rounded-lg border border-line bg-surface-raised">
            <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-body-subtle">{eyebrow}</span>
                    <h2 className="truncate font-display text-lg font-normal leading-tight text-body">{title}</h2>
                </div>
                {href && (
                    <Link
                        href={href}
                        className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-gold-300 transition-colors hover:text-gold-200"
                    >
                        {linkLabel} <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                )}
            </header>
            {children}
        </section>
    );
}

/** Shared empty state so a quiet panel never reads as a broken one. */
export function AdminEmpty({ children }: { children: ReactNode }) {
    return <p className="px-5 py-8 text-center text-sm text-body-subtle">{children}</p>;
}
