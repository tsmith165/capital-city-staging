import React from 'react';

import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import { PHProvider } from '@/app/providers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';

interface RootLayoutProps {
    children: React.ReactNode;
}

const RootProvider = ({ children }: RootLayoutProps) => {
    return (
        <ConvexClientProvider>
            <PHProvider>
                <NuqsAdapter>{children}</NuqsAdapter>
            </PHProvider>
        </ConvexClientProvider>
    );
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <RootProvider>
            <html lang="en">
                <body className="h-full w-full">
                    <main>{children}</main>
                </body>
            </html>
        </RootProvider>
    );
}
