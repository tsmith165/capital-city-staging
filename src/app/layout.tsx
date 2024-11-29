import React from 'react';

import { ClerkProvider } from '@clerk/nextjs';
import { PHProvider } from '@/app/providers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { dark } from '@clerk/themes';

import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';

interface RootLayoutProps {
    children: React.ReactNode;
}

const RootProvider = ({ children }: RootLayoutProps) => {
    return (
        <ClerkProvider appearance={{ baseTheme: dark }}>
            <PHProvider>
                <NuqsAdapter>{children}</NuqsAdapter>
            </PHProvider>
        </ClerkProvider>
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
