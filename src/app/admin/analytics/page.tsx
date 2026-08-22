import { Suspense } from 'react';
import type { Metadata } from 'next';

import { parsePostHogRange } from '@/data/posthogAnalytics';

import AnalyticsClient from './AnalyticsClient';
import AnalyticsTraffic from './AnalyticsTraffic';
import AnalyticsTrafficSkeleton from './AnalyticsTrafficSkeleton';

export const metadata: Metadata = {
    title: 'Analytics',
    description: 'Business and website analytics for Capital City Staging.',
    robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const range = parsePostHogRange((await searchParams).range);

    /*
     * The PostHog read is deliberately not awaited here. Keying the boundary on the range means
     * switching ranges shows the skeleton again instead of holding the old numbers on screen while
     * the new ones load, which would otherwise look like the switch had not registered.
     */
    return (
        <AnalyticsClient
            range={range}
            traffic={
                <Suspense key={range} fallback={<AnalyticsTrafficSkeleton />}>
                    <AnalyticsTraffic range={range} />
                </Suspense>
            }
        />
    );
}
