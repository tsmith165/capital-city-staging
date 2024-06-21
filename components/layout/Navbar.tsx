'use client';

import React from 'react';
import { useStore } from '../../store/store';
import { menu_list } from '../../lib/menu_list';
import Image from 'next/image';

export default function Navbar({ page }: { page: string }) {
    console.log('Navbar: page=', page);
    const { selectedComponent, setSelectedComponent } = useStore((state) => state);

    const navbar = menu_list.map(([menu_class_name, menu_full_name]) => {
        const handleClick = () => {
            setSelectedComponent(menu_class_name);
        };
        let is_selected = menu_class_name === selectedComponent;

        return (
            <div
                key={menu_class_name}
                className={`h-full leading-[50px] font-bold cursor-pointer text-transparent bg-clip-text ${
                    is_selected
                        ? 'bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500'
                        : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-500'
                } ${menu_class_name === 'testimonials' || menu_class_name === 'portfolio' ? 'hidden md:block' : ''}`}
                onClick={handleClick}>
                {menu_full_name}
            </div>
        );
    });

    const halfLength = Math.ceil(navbar.length / 2);

    return (
        <nav className="bg-neutral-900 p-0 flex flex-row h-[50px] w-full items-center justify-center">
            <div className="hidden md:flex flex-row space-x-4 items-center justify-end flex-1">
                {navbar.slice(0, halfLength)}
            </div>
            <div className="hidden md:flex h-full w-auto relative mx-4">
                <Image
                    src="/CCS_logo_text.png"
                    alt="CCS Logo"
                    width={247}
                    height={88}
                    className="object-contain max-h-full w-fit pt-2 pb-1"
                />
            </div>
            <div className="hidden md:flex flex-row space-x-4 items-center justify-start flex-1">
                {navbar.slice(halfLength)}
            </div>
            <div className="md:hidden flex flex-row space-x-4 items-center justify-center w-full">
                {navbar}
            </div>
        </nav>
    );
}