export const POSTHOG_RANGES = ['7d', '30d', '90d', '365d'] as const;

export type PostHogRange = (typeof POSTHOG_RANGES)[number];

export interface AnalyticsEntry {
    label: string;
    value: number;
}

export interface AnalyticsTrendPoint {
    date: string;
    views: number;
    visitors: number;
}

/**
 * The site records a `quote_submitted` event with the estimate attached, so the console can show
 * what the traffic actually produced rather than inferring intent from `/contact` pageviews.
 */
export interface AnalyticsConversions {
    quotesStarted: number;
    quotesSubmitted: number;
    quoteValue: number;
    phoneClicks: number;
    emailClicks: number;
    /** Submitted quotes as a percentage of unique visitors. */
    conversionRate: number;
    topCtas: AnalyticsEntry[];
}

export type PostHogAnalytics =
    | { status: 'unconfigured'; message: string }
    | { status: 'error'; message: string }
    | {
          status: 'ready';
          range: PostHogRange;
          rangeLabel: string;
          pageViews: number;
          visitors: number;
          quotePageViews: number;
          trend: AnalyticsTrendPoint[];
          topPages: AnalyticsEntry[];
          topSources: AnalyticsEntry[];
          conversions: AnalyticsConversions;
      };
