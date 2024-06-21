'use client';

import React from 'react';
import { useStore } from '../../store/store';
import { menu_list } from '../../lib/menu_list';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar({ page }: { page: string }) {
    const { selectedComponent, setSelectedComponent, isScrolling, setScrolling } = useStore((state) => state);

    const handleSelectPage = (key: string) => {
        setScrolling(true);
        setSelectedComponent(key);
    };

    const navbar = menu_list.map(([menu_class_name, menu_full_name]) => {
        let is_selected = menu_class_name === selectedComponent;

        return (
            <Link key={menu_class_name} href="/" className={`${menu_class_name === 'testimonials' || menu_class_name === 'portfolio' ? 'hidden md:flex' : ''}`}>
                <div
                    className={`h-full pb-1 font-bold cursor-pointer text-transparent bg-clip-text ${
                        is_selected
                            ? 'bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500'
                            : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-500'
                    }`}
                    onClick={() => handleSelectPage(menu_class_name)}
                >
                    {menu_full_name}
                </div>
            </Link>
        );
    });

    const halfLength = Math.ceil(navbar.length / 2);
    const leftNavbar = navbar.slice(0, halfLength);
    const rightNavbar = navbar.slice(halfLength);

    return (
        <nav className="bg-neutral-900 p-0 flex flex-row h-[50px] w-full items-center justify-between">
            <div className="hidden md:flex flex-row space-x-4 items-center justify-end flex-1">
                {leftNavbar}
            </div>
            <Link href="/" className="hidden md:flex mx-4 pb-1 items-center justify-center">
                <Image
                    src="/logo/CCS_logo_text.png"
                    alt="CCS Logo"
                    width={247}
                    height={88}
                    className="object-contain max-h-[48px] w-fit pt-2 pb-1"
                />
            </Link>
            <div className="hidden md:flex flex-row space-x-4 items-center justify-start flex-1">
                {rightNavbar}
            </div>
            <div className="md:hidden flex flex-row space-x-4 items-center justify-center w-full">
                {navbar}
            </div>
        </nav>
    );
}