import type { Metadata } from 'next';

import { parsePostHogRange, readPostHogAnalytics } from '@/data/posthogAnalytics';

import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = {
    title: 'Analytics',
    description: 'Business and website analytics for Capital City Staging.',
    robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const range = parsePostHogRange((await searchParams).range);
    const analytics = await readPostHogAnalytics(range);

    return <AnalyticsClient analytics={analytics} range={range} />;
}
