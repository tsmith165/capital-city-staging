'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

import { useStore } from '@/stores/store';
import Home from '@/app/_main_components/home';
import Services from '@/app/_main_components/services';
import Portfolio from '@/app/_main_components/portfolio';
import Statistics from '@/app/_main_components/statistics';
import About from '@/app/_main_components/about';

const Where = dynamic(() => import('@/app/_main_components/where'), { ssr: false });

/**
 * Order follows what a visitor needs: what this is, what we sell, the work itself, why it works,
 * whether we cover them, and who they would be working with. Portfolio and the map used to come
 * first, so the services were the fourth thing on the page. The buyer-behaviour numbers used to
 * be nested inside the services section, which diluted that section's two calls to action; they
 * land better straight after someone has looked at the photographs.
 */
const SECTIONS = [
    { id: 'home', component: Home },
    { id: 'services', component: Services },
    { id: 'portfolio', component: Portfolio },
    { id: 'statistics', component: Statistics },
    { id: 'where', component: Where },
    { id: 'about', component: About },
] as const;

interface InitialHomepageImage {
    imagePath: string;
    width: number;
    height: number;
}

export default function MainView({ initialHomepageImages }: { initialHomepageImages?: InitialHomepageImage[] | null }) {
    const selectedComponent = useStore((state) => state.selectedComponent);

    /*
     * Scrolling used to depend on a store of refs registered from a 500ms timeout, so a nav click
     * inside that window silently did nothing. The sections carry their ids in the DOM already.
     */
    useEffect(() => {
        const sectionId = selectedComponent.split('_')[0];
        if (!sectionId || sectionId === 'home') return;

        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [selectedComponent]);

    return (
        <div className="flex flex-col">
            {SECTIONS.map(({ id, component: Component }) => (
                <div key={id} id={id} className="w-full scroll-mt-[var(--nav-height)] bg-ink">
                    {id === 'home' ? <Home initialHomepageImages={initialHomepageImages} /> : <Component />}
                </div>
            ))}
        </div>
    );
}
