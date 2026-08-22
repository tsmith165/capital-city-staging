'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import AdminShell from '@/components/admin/AdminShell';
import { AdminEmpty, AdminHeading, AdminMetric, AdminPanel } from '@/components/admin/AdminPrimitives';
import { SkeletonBarRows, SkeletonMetricGrid } from '@/components/admin/AdminSkeleton';

import BarList from './BarList';
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
    const insights = useQuery(api.inventoryInsights.getInventoryInsights);

    return (
        <AdminShell title="Analytics">
            <div className="flex flex-col gap-8 p-5 sm:p-8">
                <AdminHeading
                    eyebrow="Insights"
                    title="Analytics"
                    description="How the business is performing, and how people are finding and moving through the website."
                />

                <section className="flex flex-col gap-4">
                    <h2 className="font-display text-body text-xl font-normal">Business</h2>
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
                            {/*
                             * This slot used to hold a utilisation percentage. It read 0% for the life
                             * of the app because it divided a counter nothing wrote, and even computed
                             * correctly it swings between 4% and 25% for reasons unrelated to how well
                             * the furniture is working. A count of what is out is the honest version.
                             */}
                            <AdminMetric
                                label="Out right now"
                                value={`${number.format(summary.inventory.out)} units`}
                                hint={`of ${number.format(summary.inventory.units)} owned`}
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
                    <h2 className="font-display text-body text-xl font-normal">Furniture</h2>

                    {insights ? (
                        <>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <AdminMetric
                                    label="Rental value deployed"
                                    value={money.format(insights.deployedValue)}
                                    hint="At houses being staged now"
                                />
                                <AdminMetric
                                    label="Furniture per job"
                                    value={money.format(insights.averagePerJob)}
                                    hint={`Average across ${number.format(insights.completedJobs)} completed ${insights.completedJobs === 1 ? 'job' : 'jobs'}`}
                                />
                                <AdminMetric
                                    label="Never staged"
                                    value={`${number.format(insights.neverStagedCount)} items`}
                                    hint="Have never been on a job"
                                />
                                <AdminMetric
                                    label="Awaiting check-in"
                                    value={`${number.format(insights.awaitingCheckIn)} units`}
                                    hint={insights.awaitingCheckIn === 0 ? 'Nothing outstanding' : 'Still assigned to finished jobs'}
                                />
                            </div>

                            <div className="grid gap-5 xl:grid-cols-3">
                                <AdminPanel eyebrow="Earning" title="Top earners">
                                    {insights.topEarners.length === 0 ? (
                                        <AdminEmpty>
                                            No assignment has carried a price yet, so nothing has recorded any rental value.
                                        </AdminEmpty>
                                    ) : (
                                        <BarList entries={insights.topEarners} format={(value) => money.format(value)} />
                                    )}
                                </AdminPanel>

                                <AdminPanel eyebrow="Demand" title="Most staged categories">
                                    {insights.stagingsByCategory.length === 0 ? (
                                        <AdminEmpty>Nothing has been assigned to a job yet.</AdminEmpty>
                                    ) : (
                                        <BarList entries={insights.stagingsByCategory} />
                                    )}
                                </AdminPanel>

                                <AdminPanel eyebrow="Dead capital" title="Never staged, by category">
                                    {insights.neverStaged.length === 0 ? (
                                        <AdminEmpty>Every item in the catalog has been used at least once.</AdminEmpty>
                                    ) : (
                                        <BarList entries={insights.neverStaged} />
                                    )}
                                </AdminPanel>
                            </div>
                        </>
                    ) : (
                        <>
                            <SkeletonMetricGrid count={4} columns={4} label="Loading furniture figures" />
                            <div className="grid gap-5 xl:grid-cols-3">
                                <AdminPanel eyebrow="Earning" title="Top earners">
                                    <SkeletonBarRows rows={6} label="Loading top earners" />
                                </AdminPanel>
                                <AdminPanel eyebrow="Demand" title="Most staged categories">
                                    <SkeletonBarRows rows={6} label="Loading categories" />
                                </AdminPanel>
                                <AdminPanel eyebrow="Dead capital" title="Never staged, by category">
                                    <SkeletonBarRows rows={6} label="Loading unused items" />
                                </AdminPanel>
                            </div>
                        </>
                    )}
                </section>

                <section className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-display text-body text-xl font-normal">Website traffic</h2>

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
