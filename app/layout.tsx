import { SpeedInsights } from "@vercel/speed-insights/next"
import React, { ReactNode } from 'react';
import '../styles/globals.css';

type LayoutProps = {
    children: ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
    return (
        <html lang="en">
            <body className="w-full h-full">
                <main>{children}</main>
            </body>
        </html>
    );
}
