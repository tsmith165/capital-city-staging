import {
    POSTHOG_RANGES,
    type AnalyticsConversions,
    type AnalyticsEntry,
    type AnalyticsTrendPoint,
    type PostHogAnalytics,
    type PostHogRange,
} from './posthogAnalytics.types';

export { POSTHOG_RANGES } from './posthogAnalytics.types';
export type { PostHogAnalytics, PostHogRange } from './posthogAnalytics.types';

const RANGE_CONFIG: Record<PostHogRange, { label: string; sql: string }> = {
    '7d': { label: 'Last 7 days', sql: 'timestamp >= now() - INTERVAL 7 DAY' },
    '30d': { label: 'Last 30 days', sql: 'timestamp >= now() - INTERVAL 30 DAY' },
    '90d': { label: 'Last 90 days', sql: 'timestamp >= now() - INTERVAL 90 DAY' },
    '365d': { label: 'Last 12 months', sql: 'timestamp >= now() - INTERVAL 365 DAY' },
};

const PAGE_LABELS: Record<string, string> = {
    '/': 'Home',
    '/contact': 'Contact and quote',
    '/info': 'Info hub',
    '/services/home-staging': 'Home staging service',
    '/services/occupied-home-staging': 'Occupied staging service',
    '/profile': 'Profile',
};

export function parsePostHogRange(value: unknown): PostHogRange {
    return typeof value === 'string' && POSTHOG_RANGES.includes(value as PostHogRange) ? (value as PostHogRange) : '30d';
}

function dashboardHost(): string {
    const configured = process.env.POSTHOG_API_HOST?.replace(/\/$/, '');
    if (configured) return configured;

    const captureHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || '';
    return captureHost.includes('eu.i.posthog.com') ? 'https://eu.posthog.com' : 'https://us.posthog.com';
}

async function hogql(projectId: string, apiKey: string, query: string): Promise<unknown> {
    const response = await fetch(`${dashboardHost()}/api/projects/${encodeURIComponent(projectId)}/query/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
        cache: 'no-store',
    });

    if (!response.ok) throw new Error(`PostHog query failed with HTTP ${response.status}`);

    const payload = (await response.json()) as { results?: unknown };
    return payload.results;
}

function rows(value: unknown): unknown[][] {
    return Array.isArray(value) ? (value.filter(Array.isArray) as unknown[][]) : [];
}

function numberAt(row: unknown[], index: number): number {
    const value = Number(row[index]);
    return Number.isFinite(value) ? value : 0;
}

/** Admin and auth routes are the owner's own traffic and would distort every public metric. */
function publicPageviewWhere(range: PostHogRange): string {
    return `event = '$pageview'
        AND ${RANGE_CONFIG[range].sql}
        AND (
            properties.$current_url LIKE 'https://capitalcitystaging.com%'
            OR properties.$current_url LIKE 'https://www.capitalcitystaging.com%'
        )
        AND properties.$current_url NOT LIKE '%/admin%'
        AND properties.$current_url NOT LIKE '%/signin%'
        AND properties.$current_url NOT LIKE '%/signup%'
        AND properties.$current_url NOT LIKE '%/signout%'`;
}

/** Conversion events are emitted from the public site only, so no URL filtering is needed. */
function conversionWhere(range: PostHogRange): string {
    return `event IN ('quote_started', 'quote_submitted', 'contact_channel_clicked', 'cta_clicked')
        AND ${RANGE_CONFIG[range].sql}`;
}

function countFor(results: unknown, event: string): number {
    for (const row of rows(results)) {
        if (String(row[0]) === event) return numberAt(row, 1);
    }
    return 0;
}

function toPath(value: unknown): string | null {
    if (typeof value !== 'string' || !value) return null;

    try {
        const { pathname } = new URL(value);
        const trimmed = pathname.replace(/\/+$/, '');
        return trimmed === '' ? '/' : trimmed;
    } catch {
        return null;
    }
}

function pageLabel(path: string): string {
    if (PAGE_LABELS[path]) return PAGE_LABELS[path];

    const segments = path.split('/').filter(Boolean);
    if (segments[0] === 'locations' && segments[1]) {
        return `${segments[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} (location)`;
    }
    if (segments[0] === 'info' && segments[1]) {
        return segments[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return path;
}

function groupPages(results: unknown): AnalyticsEntry[] {
    const grouped = new Map<string, number>();

    for (const row of rows(results)) {
        const path = toPath(row[0]);
        if (!path) continue;
        grouped.set(path, (grouped.get(path) ?? 0) + numberAt(row, 1));
    }

    return [...grouped.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([path, value]) => ({ label: pageLabel(path), value }));
}

function sourceLabel(value: unknown): string {
    const raw = String(value || '').trim();
    if (!raw || raw === '$direct' || raw.toLowerCase().includes('direct')) return 'Direct';

    const domain = raw.replace(/^(www\.|m\.|l\.)/, '').toLowerCase();
    if (domain.includes('google')) return 'Google';
    if (domain.includes('facebook')) return 'Facebook';
    if (domain.includes('instagram')) return 'Instagram';
    if (domain.includes('zillow')) return 'Zillow';
    if (domain.includes('realtor')) return 'Realtor.com';
    return domain;
}

function groupSources(results: unknown): AnalyticsEntry[] {
    const grouped = new Map<string, number>();

    for (const row of rows(results)) {
        const label = sourceLabel(row[0]);
        grouped.set(label, (grouped.get(label) ?? 0) + numberAt(row, 1));
    }

    return [...grouped.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, value]) => ({ label, value }));
}

function toTrend(results: unknown): AnalyticsTrendPoint[] {
    return rows(results).map((row) => ({
        date: String(row[0] ?? ''),
        views: numberAt(row, 1),
        visitors: numberAt(row, 2),
    }));
}

export async function readPostHogAnalytics(range: PostHogRange): Promise<PostHogAnalytics> {
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;

    if (!projectId || !apiKey) {
        // Name only what is actually missing; telling someone to set a variable they have
        // already set is how a five-minute fix turns into an afternoon.
        const missing = [!projectId && 'POSTHOG_PROJECT_ID', !apiKey && 'POSTHOG_PERSONAL_API_KEY'].filter(Boolean);

        return {
            status: 'unconfigured',
            message: `Traffic and quote conversions are being recorded, but this page cannot read them back yet. Set ${missing.join(' and ')} on the server. A read-only personal API key is enough.`,
        };
    }

    const where = publicPageviewWhere(range);

    try {
        const conversions = conversionWhere(range);

        const [metricResults, trendResults, pageResults, sourceResults, eventResults, valueResults, ctaResults, channelResults] =
            await Promise.all([
                hogql(
                    projectId,
                    apiKey,
                    `SELECT count(), uniq(distinct_id), countIf(properties.$current_url LIKE '%/contact%')
                 FROM events WHERE ${where}`,
                ),
                hogql(
                    projectId,
                    apiKey,
                    `SELECT toDate(timestamp), count(), uniq(distinct_id)
                 FROM events WHERE ${where}
                 GROUP BY toDate(timestamp) ORDER BY toDate(timestamp) ASC`,
                ),
                hogql(
                    projectId,
                    apiKey,
                    `SELECT properties.$current_url, count()
                 FROM events WHERE ${where}
                 GROUP BY properties.$current_url ORDER BY count() DESC LIMIT 200`,
                ),
                hogql(
                    projectId,
                    apiKey,
                    `SELECT coalesce(nullIf(properties.$referring_domain, ''), 'Direct'), count()
                 FROM events WHERE ${where}
                 GROUP BY coalesce(nullIf(properties.$referring_domain, ''), 'Direct')
                 ORDER BY count() DESC LIMIT 12`,
                ),
                hogql(projectId, apiKey, `SELECT event, count() FROM events WHERE ${conversions} GROUP BY event`),
                hogql(
                    projectId,
                    apiKey,
                    `SELECT sum(toFloat(properties.estimate))
                 FROM events WHERE event = 'quote_submitted' AND ${RANGE_CONFIG[range].sql}`,
                ),
                hogql(
                    projectId,
                    apiKey,
                    `SELECT concat(toString(properties.cta), ' \u00b7 ', toString(properties.placement)), count()
                 FROM events WHERE event = 'cta_clicked' AND ${RANGE_CONFIG[range].sql}
                 GROUP BY concat(toString(properties.cta), ' \u00b7 ', toString(properties.placement))
                 ORDER BY count() DESC LIMIT 8`,
                ),
                hogql(
                    projectId,
                    apiKey,
                    `SELECT toString(properties.channel), count()
                 FROM events WHERE event = 'contact_channel_clicked' AND ${RANGE_CONFIG[range].sql}
                 GROUP BY toString(properties.channel)`,
                ),
            ]);

        const metricRow = rows(metricResults)[0] ?? [];
        const visitors = numberAt(metricRow, 1);
        const quotesSubmitted = countFor(eventResults, 'quote_submitted');

        const conversionSummary: AnalyticsConversions = {
            quotesStarted: countFor(eventResults, 'quote_started'),
            quotesSubmitted,
            quoteValue: numberAt(rows(valueResults)[0] ?? [], 0),
            phoneClicks: countFor(channelResults, 'phone'),
            emailClicks: countFor(channelResults, 'email'),
            conversionRate: visitors > 0 ? (quotesSubmitted / visitors) * 100 : 0,
            topCtas: rows(ctaResults).map((row) => ({ label: String(row[0] ?? ''), value: numberAt(row, 1) })),
        };

        return {
            status: 'ready',
            range,
            rangeLabel: RANGE_CONFIG[range].label,
            pageViews: numberAt(metricRow, 0),
            visitors: numberAt(metricRow, 1),
            quotePageViews: numberAt(metricRow, 2),
            trend: toTrend(trendResults),
            topPages: groupPages(pageResults),
            topSources: groupSources(sourceResults),
            conversions: conversionSummary,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'PostHog analytics could not be loaded.',
        };
    }
}
