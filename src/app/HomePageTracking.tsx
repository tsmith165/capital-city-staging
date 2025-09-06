'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function HomePageTracking() {
    useEffect(() => {
        // Track page load with client-side PostHog
        if (typeof window !== 'undefined' && posthog) {
            posthog.capture('Home page was loaded');
        }
    }, []);

    return null; // This component doesn't render anything
}