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

    return (
        <nav className="bg-neutral-900 p-0 flex flex-row h-[50px] w-full justify-center items-center">
            <div className="flex flex-row space-x-4 px-4 flex-grow justify-end">{navbar.slice(0, navbar.length / 2)}</div>
            <div className="h-full w-auto relative md:mx-4 hidden md:block">
                <Image
                    src="/CCS_logo_text.png"
                    alt="CCS Logo"
                    width={247}
                    height={88}
                    className="object-contain max-h-full w-fit pt-2 pb-1"
                />
            </div>
            <div className="flex flex-row space-x-4 pr-4 md:pl-4 flex-grow">{navbar.slice(navbar.length / 2)}</div>
        </nav>
    );
}
