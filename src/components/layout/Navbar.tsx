'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { menu_list } from '@/lib/menu_list';
import { useStore } from '@/stores/store';

export default function Navbar({ page }: { page: string }) {
    const router = useRouter();
    const searchParams = useSearchParams()

    const setSelectedComponent = useStore((state) => state.setSelectedComponent);
    const componentRefs = useStore((state) => state.componentRefs);

    const handleClick = (menu_class_name: string) => {
        setSelectedComponent(menu_class_name);
        if (menu_class_name === 'contact') {
            router.push('/contact');
            return;
        }
        const index = componentRefs.findIndex((item) => item.current?.id === menu_class_name);
        if (index !== -1) {
            const ref = componentRefs[index];
            if (ref && ref.current) {
                ref.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }

        router.push(`/?component=${menu_class_name}`, {scroll: true});
    };

    useEffect(() => {
        if (page === 'home') {
            console.log("Current homepage component: " + searchParams.get('component'));
            setSelectedComponent(searchParams.get('component') || '');
        }
    }, []);

    const navbar = menu_list.map(([menu_class_name, menu_full_name]) => {
        return (
            <div
                key={menu_class_name}
                onClick={() => handleClick(menu_class_name)}
                className={`h-full pb-1 font-bold cursor-pointer text-transparent bg-clip-text ${
                    menu_class_name === 'testimonials' || menu_class_name === 'portfolio' ? 'hidden xs:flex' : ''
                } bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-500`}
            >
                {menu_full_name}
            </div>
        );
    });

    const halfLength = Math.ceil(navbar.length / 2);
    const leftNavbar = navbar.slice(0, halfLength);
    const rightNavbar = navbar.slice(halfLength);

    return (
        <nav className="bg-neutral-900 p-0 flex flex-row h-[50px] w-full items-center justify-between">
            <div className="flex md:hidden mx-4 pb-1" onClick={() => handleClick('home')}>
                <Image
                    src="/logo/CCS_logo_text.png"
                    alt="CCS Logo"
                    width={247}
                    height={88}
                    className="object-contain max-h-[48px] w-fit pt-2 pb-1"
                />
            </div>
            <div className="hidden md:flex flex-row space-x-4 items-center justify-end flex-1">
                {leftNavbar}
            </div>
            <div className="hidden md:flex mx-4 pb-1 items-center justify-center" onClick={() => handleClick('home')}>
                <Image
                    src="/logo/CCS_logo_text.png"
                    alt="CCS Logo"
                    width={247}
                    height={88}
                    className="object-contain max-h-[48px] w-fit pt-2 pb-1"
                />
            </div>
            <div className="hidden md:flex flex-row space-x-4 items-center justify-start flex-1">
                {rightNavbar}
            </div>
            <div className="md:hidden flex flex-row space-x-4 items-center justify-end w-full pr-4">
                {navbar}
            </div>
        </nav>
    );
}
