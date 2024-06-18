'use client';

import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/store';
import PageLayout from '../components/layout/PageLayout';
import MainView from './main_view';
import WhereWeWork from './where_we_work';
import AboutTheOwner from './about_the_owner';
import Portfolio from './portfolio';
import Services from './services';
import Testimonials from './testimonials';
import Statistics from './statistics';
import Contact from './contact';

const components = [
    { id: 'home', component: MainView },
    { id: 'about', component: AboutTheOwner },
    { id: 'portfolio', component: Portfolio },
    { id: 'where', component: WhereWeWork },
    { id: 'services', component: Services },
    { id: 'testimonials', component: Testimonials },
    { id: 'statistics', component: Statistics },
    { id: 'contact', component: Contact },
];

export default function Home() {
    const selectedComponent = useStore((state) => state.selectedComponent);
    const refs = useRef(components.map(() => React.createRef<HTMLDivElement>()));

    useEffect(() => {
        if (selectedComponent) {
            console.log('useEffect: selectedComponent=', selectedComponent);
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
                    <div key={id} ref={refs.current[index]} className="w-full min-h-full max-h-full">
                        <Component />
                    </div>
                ))}
            </div>
        </PageLayout>
    );
}
