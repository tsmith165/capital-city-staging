import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Alegreya_Sans_SC, Lato } from 'next/font/google';

import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { PHProvider } from '@/app/providers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import '@/styles/globals.css';

const lato = Lato({
    subsets: ['latin'],
    weight: ['300', '400', '700', '900'],
    variable: '--font-lato-face',
    display: 'swap',
});

const alegreya = Alegreya_Sans_SC({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-alegreya-face',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://www.capitalcitystaging.com'),
    title: {
        default: 'Capital City Staging | Home Staging in Sacramento',
        template: '%s | Capital City Staging',
    },
    description: 'Professional home staging and decorating in Sacramento. Capital City Staging helps homes sell faster and for more money.',
    alternates: {
        canonical: '/',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export const viewport: Viewport = {
    themeColor: '#0a0c0a',
    colorScheme: 'dark',
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
        <html lang="en" className={`${lato.variable} ${alegreya.variable}`}>
            <body className="h-full w-full font-sans">
                <a href="#main-content" className="skip-link">
                    Skip to main content
                </a>
                <RootProvider>
                    <main id="main-content">{children}</main>
                </RootProvider>
            </body>
        </html>
    );
}
