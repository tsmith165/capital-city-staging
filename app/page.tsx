'use client';

import React, { useEffect, useRef } from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { useStore } from '../store/store';
import PageLayout from '../components/layout/PageLayout';
import MainView from './main_view';
import About from './_main_components/about';
import Portfolio from './_main_components/portfolio';
import Services from './_main_components/services';
import TestimonialsAndStatistics from './_main_components/testimonials_and_statistics';
const WhereWeWork = dynamic(() => import('./_main_components/where_we_work'), {
    ssr: false,
});

export const metadata: Metadata = {
    title: 'Capital City Staging',
    description:
        "Capital City Stgin allows you to focus on your next moves, we'll handle your history.  With a home staged by Mia, you can trust that every room tells your story.",
    keywords:
        'Staging, Homestaging, Real Estate, Staging Services, Staging Software, Staging Software, Homestaging, Real Estate, Real Estate Staging, Real Estate Staging Services, Real Estate Staging Software, Real Estate Staging Software, Mia, Mia Dofflemyer, Home Staging, Sacramento, Sacramento Home Staging, Sacramento Real Estate, Sacramento Real Estate Staging, Sacramento Real Estate Staging Services, Sacramento Real Estate Staging Software, Sacramento Real Estate Staging Software, Sacramento Staging, Sacramento Staging Services, Sacramento Staging Software, Sacramento Staging Software',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/CCS_logo.png',
        shortcut: '/CCS_logo.png',
        apple: '/apple-touch-icon-152x152.png',
    },
    openGraph: {
        title: 'Capital City Staging',
        description:
            "Capital City Stgin allows you to focus on your next moves, we'll handle your history.  With a home staged by Mia, you can trust that every room tells your story.",
        siteName: 'Capital City Staging',
        url: 'https://wwww.capitalcitystaging.com',
        images: [
            {
                url: '/CCS_og_image.png',
                width: 1200,
                height: 630,
                alt: 'Capital City Staging',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

const components = [
    { id: 'home', component: MainView },
    { id: 'portfolio', component: Portfolio },
    { id: 'where', component: WhereWeWork },
    { id: 'services', component: Services },
    { id: 'testimonials', component: TestimonialsAndStatistics },
    { id: 'about', component: About },
];

export default function Home() {
    const selectedComponent = useStore((state) => state.selectedComponent);
    const refs = useRef(components.map(() => React.createRef<HTMLDivElement>()));

    useEffect(() => {
        if (selectedComponent) {
            const index = components.findIndex((item) => item.id === selectedComponent);
            if (index !== -1) {
                refs.current[index].current?.scrollIntoView({
                    behavior: 'smooth',
                });
            }
        }
    }, [selectedComponent]);

    return (
        <PageLayout page="home">
            <div className="flex flex-col overflow-y-auto h-full">
                {components.map(({ id, component: Component }, index) => (
                    <div key={id} ref={refs.current[index]} className="w-full h-auto bg-neutral-900">
                        <Component />
                    </div>
                ))}
            </div>
        </PageLayout>
    );
}
