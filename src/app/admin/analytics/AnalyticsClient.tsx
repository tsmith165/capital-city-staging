'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import AdminShell from '@/components/admin/AdminShell';
import { AdminEmpty, AdminHeading, AdminMetric, AdminPanel } from '@/components/admin/AdminPrimitives';
import { POSTHOG_RANGES, type PostHogAnalytics, type PostHogRange } from '@/data/posthogAnalytics.types';

import BarList from './BarList';

const number = new Intl.NumberFormat('en-US');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const RANGE_LABELS: Record<PostHogRange, string> = {
    '7d': '7 days',
    '30d': '30 days',
    '90d': '90 days',
    '365d': '12 months',
};

export default function AnalyticsClient({ analytics, range }: { analytics: PostHogAnalytics; range: PostHogRange }) {
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
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <AdminMetric
                            label="Revenue this year"
                            value={summary ? money.format(summary.projects.revenueThisYear) : '—'}
                            hint="Completed projects only"
                        />
                        <AdminMetric
                            label="Completed projects"
                            value={summary ? number.format(summary.projects.completed) : '—'}
                            hint={summary ? `${number.format(summary.projects.active)} active now` : undefined}
                        />
                        <AdminMetric
                            label="Inventory utilisation"
                            value={summary ? `${utilisation}%` : '—'}
                            hint={
                                summary
                                    ? `${number.format(summary.inventory.inUse)} of ${number.format(summary.inventory.units)} units staged`
                                    : undefined
                            }
                        />
                        <AdminMetric
                            label="Quote requests"
                            value={summary ? number.format(summary.inbox.total) : '—'}
                            hint={summary ? `${number.format(summary.inbox.unanswered)} awaiting a reply` : undefined}
                        />
                    </div>
                </section>

                <section className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-display text-xl font-normal text-body">Website traffic</h2>
                        {analytics.status === 'ready' && (
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
                        )}
                    </div>

                    {analytics.status !== 'ready' ? (
                        <div className="flex items-start gap-3 rounded-lg border border-line bg-surface-raised p-5">
                            <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-warning" />
                            <div className="flex flex-col gap-1">
                                <strong className="text-sm font-bold text-body">
                                    {analytics.status === 'unconfigured'
                                        ? 'Traffic analytics are not connected yet'
                                        : 'Traffic analytics could not be loaded'}
                                </strong>
                                <p className="text-sm text-body-muted">{analytics.message}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <AdminMetric label="Page views" value={number.format(analytics.pageViews)} hint={analytics.rangeLabel} />
                                <AdminMetric label="Visitors" value={number.format(analytics.visitors)} hint={analytics.rangeLabel} />
                                <AdminMetric
                                    label="Quote page views"
                                    value={number.format(analytics.quotePageViews)}
                                    hint={
                                        analytics.pageViews
                                            ? `${Math.round((analytics.quotePageViews / analytics.pageViews) * 100)}% of all views`
                                            : undefined
                                    }
                                />
                            </div>

                            <div className="grid gap-5 xl:grid-cols-2">
                                <AdminPanel eyebrow="Content" title="Most viewed pages">
                                    {analytics.topPages.length ? (
                                        <BarList entries={analytics.topPages} />
                                    ) : (
                                        <AdminEmpty>No page views recorded in this range.</AdminEmpty>
                                    )}
                                </AdminPanel>
                                <AdminPanel eyebrow="Acquisition" title="Where visitors come from">
                                    {analytics.topSources.length ? (
                                        <BarList entries={analytics.topSources} />
                                    ) : (
                                        <AdminEmpty>No referrers recorded in this range.</AdminEmpty>
                                    )}
                                </AdminPanel>
                            </div>

                            {analytics.trend.length > 0 && (
                                <AdminPanel eyebrow="Trend" title="Views over time">
                                    <div className="flex items-center gap-2 px-5 py-3 text-xs text-body-subtle">
                                        <TrendingUp size={14} aria-hidden="true" />
                                        {analytics.trend.length} {analytics.trend.length === 1 ? 'day' : 'days'} with recorded traffic
                                    </div>
                                    <BarList
                                        entries={analytics.trend.slice(-14).map((point) => ({ label: point.date, value: point.views }))}
                                    />
                                </AdminPanel>
                            )}
                        </>
                    )}
                </section>
            </div>
        </AdminShell>
    );
}
