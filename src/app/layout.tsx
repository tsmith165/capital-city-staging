import '../styles/globals.scss';

import React, { ReactNode } from 'react';

import { ClerkProvider } from '@clerk/nextjs';

import { PHProvider } from '@/app/providers';

type LayoutProps = {
    children: ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
    return (
        <ClerkProvider>
            <html lang="en">
                <PHProvider>
                    <body className="h-full w-full">
                        <main>{children}</main>
                    </body>
                </PHProvider>
            </html>
        </ClerkProvider>
    );
}
