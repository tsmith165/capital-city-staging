'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function ContactPageTracking() {
    useEffect(() => {
        // Track page load with client-side PostHog
        if (typeof window !== 'undefined' && posthog) {
            posthog.capture('Contact page was loaded');
        }
    }, []);

    return null; // This component doesn't render anything
}