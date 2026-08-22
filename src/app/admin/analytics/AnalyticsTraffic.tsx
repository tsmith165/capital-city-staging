import { AlertTriangle, TrendingUp } from 'lucide-react';

import { AdminEmpty, AdminMetric, AdminPanel } from '@/components/admin/AdminPrimitives';
import { readPostHogAnalytics } from '@/data/posthogAnalytics';
import type { PostHogRange } from '@/data/posthogAnalytics.types';

import BarList from './BarList';

const number = new Intl.NumberFormat('en-US');
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Everything on this page that needs PostHog. It lives in its own async server component so the
 * page shell can be sent immediately and this streams in behind a Suspense boundary. Awaiting the
 * eight HogQL queries in the page itself meant the browser sat on the previous route, with no
 * feedback, until the slowest query came back.
 */
export default async function AnalyticsTraffic({ range }: { range: PostHogRange }) {
    const analytics = await readPostHogAnalytics(range);

    if (analytics.status !== 'ready') {
        return (
            <div className="border-line bg-surface-raised flex items-start gap-3 rounded-lg border p-5">
                <AlertTriangle size={18} aria-hidden="true" className="text-warning mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                    <strong className="text-body text-sm font-bold">
                        {analytics.status === 'unconfigured'
                            ? 'Traffic analytics are not connected yet'
                            : 'Traffic analytics could not be loaded'}
                    </strong>
                    <p className="text-body-muted text-sm">{analytics.message}</p>
                </div>
            </div>
        );
    }

    const { conversions } = analytics;
    const sendRate = conversions.quotesStarted
        ? `${Math.round((conversions.quotesSubmitted / conversions.quotesStarted) * 100)}% went on to send`
        : 'Nobody opened the calculator yet';

    return (
        <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AdminMetric
                    label="Quotes submitted"
                    value={number.format(conversions.quotesSubmitted)}
                    hint={`${conversions.conversionRate.toFixed(1)}% of visitors`}
                />
                <AdminMetric label="Estimated value" value={currency.format(conversions.quoteValue)} hint="Sum of the quoted estimates" />
                <AdminMetric label="Quotes started" value={number.format(conversions.quotesStarted)} hint={sendRate} />
                <AdminMetric
                    label="Calls and emails"
                    value={number.format(conversions.phoneClicks + conversions.emailClicks)}
                    hint={`${number.format(conversions.phoneClicks)} phone, ${number.format(conversions.emailClicks)} email`}
                />
            </div>

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
                <AdminPanel eyebrow="Conversion" title="Which buttons get pressed">
                    {conversions.topCtas.length ? (
                        <BarList entries={conversions.topCtas} />
                    ) : (
                        <AdminEmpty>No call-to-action clicks recorded in this range.</AdminEmpty>
                    )}
                </AdminPanel>
            </div>

            {analytics.trend.length > 0 && (
                <AdminPanel eyebrow="Trend" title="Views over time">
                    <div className="text-body-subtle flex items-center gap-2 px-5 py-3 text-xs">
                        <TrendingUp size={14} aria-hidden="true" />
                        {analytics.trend.length} {analytics.trend.length === 1 ? 'day' : 'days'} with recorded traffic
                    </div>
                    <BarList entries={analytics.trend.slice(-14).map((point) => ({ label: point.date, value: point.views }))} />
                </AdminPanel>
            )}
        </>
    );
}
