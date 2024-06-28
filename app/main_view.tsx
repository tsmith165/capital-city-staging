'use client';

import React, { useRef, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '../store/store';

import Home from './_main_components/home';
import About from './_main_components/about'; 
import Portfolio from './_main_components/portfolio';
import Services from './_main_components/services';
// import Testimonials from './_main_components/testimonials';

const Where = dynamic(() => import('./_main_components/where'), {
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
