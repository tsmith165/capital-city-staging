'use client';

import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useStore } from '@/stores/store';

import Home from '@/app/_main_components/home';
import About from '@/app/_main_components/about';
import Portfolio from '@/app/_main_components/portfolio';
import Services from '@/app/_main_components/services';
// import Testimonials from '@/app/_main_components/testimonials';

import dynamic from 'next/dynamic';
const PostHogPageView = dynamic(() => import('@/app/PostHogPageView'), {
    ssr: false,
});
const Where = dynamic(() => import('@/app/_main_components/where'), {
    ssr: false,
});

const components = [
    { id: 'home', component: Home },
    { id: 'portfolio', component: Portfolio },
    { id: 'where', component: Where },
    { id: 'services', component: Services },
    //{ id: 'testimonials', component: Testimonials },
    { id: 'about', component: About },
];

export default function MainView() {
    const [layoutLoaded, setLayoutLoaded] = useState(false);
    const componentRefs = useStore((state) => state.componentRefs);
    const setComponentRefs = useStore((state) => state.setComponentRefs);
    const refs = useRef(components.map(() => React.createRef<HTMLDivElement>()));

    const selectedComponent = useStore((state) => state.selectedComponent);

    useLayoutEffect(() => {
        setTimeout(() => {
            setComponentRefs(refs.current);
            setLayoutLoaded(true);
        }, 500);
    }, [setComponentRefs]);

    useEffect(() => {
        if (!layoutLoaded) return;

        // Extract the base component name (remove the timestamp)
        const baseComponent = selectedComponent.split('_')[0];

        // Check if the base component exists and scroll to it
        const index = componentRefs.findIndex((item) => item.current?.id === baseComponent);
        console.log('Selected Component Index: ' + index);
        if (index !== -1) {
            const ref = componentRefs[index];
            if (ref && ref.current) {
                console.log('Scrolling to ref: ', ref.current);
                ref.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }
    }, [selectedComponent, componentRefs, layoutLoaded]);

    return (
        <div className="flex h-full flex-col overflow-y-auto">
            <PostHogPageView />
            <Head>
                <link rel="preload" as="image" href="/portfolio/stock/staging-stock-3.jpg" imageSizes="100vw" />
            </Head>
            {components.map(({ id, component: Component }, index) => (
                <div key={id} ref={refs.current[index]} id={id} className="h-auto w-full bg-stone-900">
                    <Component />
                </div>
            ))}
        </div>
    );
}
