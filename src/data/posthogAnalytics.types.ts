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
      };
