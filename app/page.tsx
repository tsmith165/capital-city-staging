// File 1: /app/page.tsx

'use client';

import dynamic from 'next/dynamic';

const WhereWeWork = dynamic(() => import('./where_we_work'), {
    ssr: false,
});

import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/store';
import PageLayout from '../components/layout/PageLayout';
import MainView from './main_view';
import About from './about';
import Portfolio from './portfolio';
import Services from './services';
import TestimonialsAndStatistics from './testimonials_and_statistics';

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
