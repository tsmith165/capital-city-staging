'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import AdminShell from '@/components/admin/AdminShell';
import { AdminHeading, AdminMetric } from '@/components/admin/AdminPrimitives';
import { SkeletonMetricGrid } from '@/components/admin/AdminSkeleton';
import { POSTHOG_RANGES, type PostHogRange } from '@/data/posthogAnalytics.types';

const number = new Intl.NumberFormat('en-US');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const RANGE_LABELS: Record<PostHogRange, string> = {
    '7d': '7 days',
    '30d': '30 days',
    '90d': '90 days',
    '365d': '12 months',
};

/**
 * The page shell. It renders immediately: the business figures come from Convex over a websocket,
 * and the traffic section arrives as an already-suspended server component from the route. Nothing
 * on this page blocks the navigation to it.
 */
export default function AnalyticsClient({ range, traffic }: { range: PostHogRange; traffic: ReactNode }) {
    const summary = useQuery(api.dashboard.getDashboardSummary);

    const utilisation =
        summary && summary.inventory.units > 0 ? Math.round((summary.inventory.inUse / summary.inventory.units) * 100) : 0;

    return (
        <AdminShell title="Analytics">
            <div className="flex flex-col gap-8 p-5 sm:p-8">
                <AdminHeading
                    eyebrow="Insights"
                    title="Analytics"
                    description="How the business is performing, and how people are finding and moving through the website."
                />

                <section className="flex flex-col gap-4">
                    <h2 className="font-display text-xl font-normal text-body">Business</h2>
                    {summary ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <AdminMetric
                                label="Revenue this year"
                                value={money.format(summary.projects.revenueThisYear)}
                                hint="Completed projects only"
                            />
                            <AdminMetric
                                label="Completed projects"
                                value={number.format(summary.projects.completed)}
                                hint={`${number.format(summary.projects.active)} active now`}
                            />
                            <AdminMetric
                                label="Inventory utilisation"
                                value={`${utilisation}%`}
                                hint={`${number.format(summary.inventory.inUse)} of ${number.format(
                                    summary.inventory.units,
                                )} units staged`}
                            />
                            <AdminMetric
                                label="Quote requests"
                                value={number.format(summary.inbox.total)}
                                hint={`${number.format(summary.inbox.unanswered)} awaiting a reply`}
                            />
                        </div>
                    ) : (
                        <SkeletonMetricGrid count={4} columns={4} label="Loading business figures" />
                    )}
                </section>

                <section className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-display text-xl font-normal text-body">Website traffic</h2>

                        {/* Plain links, so the range is switchable before the figures have loaded. */}
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Select date range">
                            {POSTHOG_RANGES.map((value) => (
                                <Link
                                    key={value}
                                    href={`/admin/analytics?range=${value}`}
                                    aria-current={value === range ? 'true' : undefined}
                                    className={`rounded-md border px-3 py-1.5 text-xs font-bold transition-colors ${
                                        value === range
                                            ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                                            : 'border-line text-body-muted hover:bg-surface-raised hover:text-body'
                                    }`}
                                >
                                    {RANGE_LABELS[value]}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {traffic}
                </section>
            </div>
        </AdminShell>
    );
}
