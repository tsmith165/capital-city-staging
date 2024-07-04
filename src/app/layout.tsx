import '../styles/globals.css';

import React, { ReactNode } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/next"

import { ClerkProvider } from '@clerk/nextjs'

import { PHProvider } from '@/app/providers'
import dynamic from 'next/dynamic'

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
})

type LayoutProps = {
    children: ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
    return (
        <ClerkProvider>
            <html lang="en">
                <PHProvider>
                    <body className="w-full h-full">
                        <PostHogPageView />
                        <SpeedInsights />
                        <main>{children}</main>
                    </body>
                </PHProvider>
            </html>
        </ClerkProvider>
    );
}
