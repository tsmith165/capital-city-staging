import React from 'react';
import type { Metadata } from 'next';

import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { PHProvider } from '@/app/providers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.capitalcitystaging.com'),
};

interface RootLayoutProps {
    children: React.ReactNode;
}

const RootProvider = ({ children }: RootLayoutProps) => {
    return (
        <ClerkProvider appearance={{ baseTheme: dark }}>
            <ConvexClientProvider>
                <PHProvider>
                    <NuqsAdapter>{children}</NuqsAdapter>
                </PHProvider>
            </ConvexClientProvider>
        </ClerkProvider>
    );
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body className="h-full w-full">
                <RootProvider>
                    <main>{children}</main>
                </RootProvider>
            </body>
        </html>
    );
}
