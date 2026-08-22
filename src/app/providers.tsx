'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

/**
 * Init was previously unguarded with a non-null assertion, so a missing key initialised the
 * client with `undefined` and every capture failed noisily for the rest of the session.
 */
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // Captured manually so App Router client navigations are counted.
        capture_pageleave: true,
    });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
    if (!POSTHOG_KEY) return <>{children}</>;

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
