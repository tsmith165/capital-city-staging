'use client';

import React, { useRef, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/stores/store';

import Home from '@/app/_main_components/home';
import About from '@/app/_main_components/about'; 
import Portfolio from '@/app/_main_components/portfolio';
import Services from '@/app/_main_components/services';
// import Testimonials from '@/app/_main_components/testimonials';

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
    const setComponentRefs = useStore((state) => state.setComponentRefs);
    const refs = useRef(components.map(() => React.createRef<HTMLDivElement>()));

    useLayoutEffect(() => {
        setComponentRefs(refs.current);
    }, [setComponentRefs]);

    return (
        <div className="flex flex-col overflow-y-auto h-full">
            {components.map(({ id, component: Component }, index) => (
                <div
                    key={id}
                    ref={refs.current[index]}
                    id={id}
                    className="w-full h-auto bg-neutral-900"
                >
                    <Component />
                </div>
            ))}
        </div>
    );
}
