'use client';

import posthog from 'posthog-js';

import type { AnalyticsEvent, AnalyticsEventMap } from './analytics.types';

export type { AnalyticsPlacement, AnalyticsEvent } from './analytics.types';

/**
 * One entry point for product analytics.
 *
 * Call sites used to reach for `posthog-js` directly, which meant free-form event names
 * ("Home page was loaded") that no query can group, no payload shape, and a hard dependency on
 * PostHog in every component that wanted to record something. Everything goes through `track`
 * now: the names and payloads are a closed set, and swapping the destination is one file.
 */
export function track<E extends AnalyticsEvent>(event: E, properties: AnalyticsEventMap[E]): void {
    if (typeof window === 'undefined') return;
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    try {
        posthog.capture(event, properties);
    } catch {
        // Analytics must never take a page down with it.
    }
}

const seen = new Set<string>();

/** For once-per-page-load signals such as "the visitor started filling in the quote form". */
export function trackOnce<E extends AnalyticsEvent>(event: E, properties: AnalyticsEventMap[E]): void {
    if (seen.has(event)) return;
    seen.add(event);
    track(event, properties);
}
