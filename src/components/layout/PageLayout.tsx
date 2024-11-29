import React, { ReactNode, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import PostHogPageView from '@/app/PostHogPageView';

type PageLayoutProps = {
    children: ReactNode;
    page: string;
};

export default function PageLayout({ children, page }: PageLayoutProps) {
    return (
        <div className="h-[100dvh] bg-stone-900">
            <Suspense>
                <PostHogPageView />
                <Navbar page={page} />
            </Suspense>
            <main className="h-[calc(100dvh-50px)]">{children}</main>
        </div>
    );
}
