import React, { ReactNode, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PostHogPageView from '@/app/PostHogPageView';

type PageLayoutProps = {
    children: ReactNode;
    page: string;
};

/**
 * The page used to scroll inside a fixed-height <main>, which is why the header could never be
 * sticky and every section had to subtract the header height by hand. The document scrolls now.
 */
export default function PageLayout({ children, page }: PageLayoutProps) {
    return (
        <div className="bg-ink flex min-h-[100dvh] flex-col">
            <Suspense>
                <PostHogPageView />
                <Navbar page={page} />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
