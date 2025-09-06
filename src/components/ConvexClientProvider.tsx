'use client';

import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import dynamic from 'next/dynamic';
import { useAuth } from '@clerk/nextjs';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Dynamic import to prevent SSR issues
const ConvexProviderWithClerk = dynamic(
  () => import('convex/react-clerk').then((mod) => mod.ConvexProviderWithClerk),
  { ssr: false }
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}