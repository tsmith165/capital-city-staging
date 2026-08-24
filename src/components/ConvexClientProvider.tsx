'use client';

import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { useAuth } from '@clerk/nextjs';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * `ConvexProviderWithClerk` used to be a `dynamic(..., { ssr: false })` import, described as
 * preventing SSR issues. Because this provider wraps every route, that one flag opted the whole
 * application out of server rendering: each page shipped an empty shell with
 * BAILOUT_TO_CLIENT_SIDE_RENDERING and no copy, headings or links in the HTML.
 *
 * The provider server-renders correctly on its own. What it was masking is that several admin
 * clients call `useSearchParams` outside a Suspense boundary; those pages now wrap it explicitly.
 */

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    );
}
