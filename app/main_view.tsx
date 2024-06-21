'use client';

import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '../store/store';

import Home from './_main_components/home';
import About from './_main_components/about';
import Portfolio from './_main_components/portfolio';
import Services from './_main_components/services';
import TestimonialsAndStatistics from './_main_components/testimonials_and_statistics';

const WhereWeWork = dynamic(() => import('./_main_components/where_we_work'), {
    ssr: false,
});

const components = [
    { id: 'home', component: Home },
    { id: 'portfolio', component: Portfolio },
    { id: 'where', component: WhereWeWork },
    { id: 'services', component: Services },
    { id: 'testimonials', component: TestimonialsAndStatistics },
    { id: 'about', component: About },
];

export default function MainView() {
    const { selectedComponent, isScrolling, setScrolling } = useStore((state) => state);
    const refs = useRef(components.map(() => React.createRef<HTMLDivElement>()));

    useEffect(() => {
        if (selectedComponent) {
            const index = components.findIndex((item) => item.id === selectedComponent);
            if (index !== -1) {
                refs.current[index].current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
            setScrolling(false);
        }
    }, [selectedComponent]);

    useEffect(() => {
        if (isScrolling) {
            const index = components.findIndex((item) => item.id === selectedComponent);
            if (index !== -1) {
                refs.current[index].current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
            setScrolling(false);
        }
    }, [isScrolling]);

    return (
        <div className="flex flex-col overflow-y-auto h-full">
            {components.map(({ id, component: Component }, index) => (
                <div key={id} ref={refs.current[index]} className="w-full h-auto bg-neutral-900">
                    <Component />
                </div>
            ))}
        </div>
    );
}