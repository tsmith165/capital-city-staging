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
        <header className="border-line flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-gold-300 text-[10px] font-extrabold tracking-[0.14em] uppercase">{eyebrow}</span>
                <h1 className="font-display text-body text-3xl leading-tight font-normal">{title}</h1>
                <p className="text-body-muted max-w-2xl text-sm">{description}</p>
            </div>
            {action}
        </header>
    );
}

export function AdminStatus({ tone = 'neutral', children }: { tone?: AdminStatusTone; children: ReactNode }) {
    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] uppercase ${ADMIN_STATUS_TONE_CLASSES[tone]}`}
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
        <article className="border-line bg-surface-raised shadow-card hover:border-line-strong flex flex-col gap-3 rounded-lg border p-5 transition-colors">
            <span className="text-body-subtle flex items-center gap-2 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                <Icon size={16} aria-hidden="true" />
                {label}
            </span>
            <h2 className="font-display text-body text-xl leading-snug font-normal">{headline}</h2>
            <p className="text-body-muted text-sm">{description}</p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <Link
                    href={href}
                    className="text-gold-300 hover:text-gold-200 inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
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
        <div className="border-line bg-surface flex flex-col gap-1 rounded-lg border px-4 py-3.5">
            <span className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">{label}</span>
            <strong className="font-display text-body text-2xl leading-none font-normal">{value}</strong>
            {hint && <small className="text-body-subtle text-[11px]">{hint}</small>}
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
        <section className="border-line bg-surface-raised flex min-w-0 flex-col rounded-lg border">
            <header className="border-line flex items-center justify-between gap-3 border-b px-5 py-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">{eyebrow}</span>
                    <h2 className="font-display text-body truncate text-lg leading-tight font-normal">{title}</h2>
                </div>
                {href && (
                    <Link
                        href={href}
                        className="text-gold-300 hover:text-gold-200 inline-flex shrink-0 items-center gap-1.5 text-xs font-bold transition-colors"
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
    return <p className="text-body-subtle px-5 py-8 text-center text-sm">{children}</p>;
}
