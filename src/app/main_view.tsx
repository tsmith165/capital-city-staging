'use client';

import React, { useMemo, useLayoutEffect, useEffect, useState } from 'react';
import { useStore } from '@/stores/store';

import Home from '@/app/_main_components/home';
import About from '@/app/_main_components/about';
import Portfolio from '@/app/_main_components/portfolio';
import Services from '@/app/_main_components/services';

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
    { id: 'about', component: About },
];

interface InitialHomepageImage {
    imagePath: string;
    width: number;
    height: number;
}

export default function MainView({
    initialHomepageImages,
}: {
    initialHomepageImages?: InitialHomepageImage[] | null;
}) {
    const [layoutLoaded, setLayoutLoaded] = useState(false);
    const componentRefs = useStore((state) => state.componentRefs);
    const setComponentRefs = useStore((state) => state.setComponentRefs);
    const refs = useMemo(() => components.map(() => React.createRef<HTMLDivElement>()), []);

    const selectedComponent = useStore((state) => state.selectedComponent);

    useLayoutEffect(() => {
        const timer = setTimeout(() => {
            setComponentRefs(refs);
            setLayoutLoaded(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [setComponentRefs, refs]);

    useEffect(() => {
        if (!layoutLoaded) return;

        // Extract the base component name (remove the timestamp)
        const baseComponent = selectedComponent.split('_')[0];

        // Check if the base component exists and scroll to it
        const index = componentRefs.findIndex((item) => item.current?.id === baseComponent);
        if (index !== -1) {
            const ref = componentRefs[index];
            if (ref && ref.current) {
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
            {components.map(({ id, component: Component }, index) => (
                <div key={id} ref={refs[index]} id={id} className="h-auto w-full bg-stone-900">
                    {id === 'home' ? <Component initialHomepageImages={initialHomepageImages} /> : <Component />}
                </div>
            ))}
        </div>
    );
}
