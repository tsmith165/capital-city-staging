'use client';

import React, { useEffect, useCallback, useTransition, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { navbar_menu_list } from '@/lib/menu_list';
import { useStore } from '@/stores/store';
import { IoIosMenu } from 'react-icons/io';
import { Protect } from '@clerk/nextjs';
import { useIsAdmin } from '@/utils/auth/useIsAdmin';
import AdminProtect from '@/utils/auth/AdminProtect';

import dynamic from 'next/dynamic';
const DynamicMenuOverlay = dynamic(() => import('./menu/MenuOverlay'), { ssr: false });

export default function Navbar({ page }: { page: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [showMenu, setShowMenu] = useState(false);

    const selectedComponent = useStore((state) => state.selectedComponent);
    const setSelectedComponent = useStore((state) => state.setSelectedComponent);

    const updateUrlWithoutNavigation = useCallback(
        (newValue: string) => {
            startTransition(() => {
                const params = new URLSearchParams(searchParams);
                if (newValue) {
                    params.set('component', newValue);
                } else {
                    params.delete('component');
                }

                // Create new URL
                const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;

                // Update the URL without navigation
                window.history.pushState(null, '', newUrl);
            });
        },
        [searchParams, pathname],
    );

    const handleClick = useCallback(
        (menu_class_name: string) => {
            if (menu_class_name === 'contact') {
                router.push('/contact');
            } else {
                // Force update by appending a timestamp
                const updatedComponent = `${menu_class_name}_${Date.now()}`;
                setSelectedComponent(updatedComponent);
                if (page !== 'home') {
                    console.log('Navigating to homepage with component: ' + menu_class_name);
                    router.push('/?component=' + menu_class_name);
                } else {
                    console.log('Updating URL without navigation: ' + menu_class_name);
                    updateUrlWithoutNavigation(menu_class_name);
                }
            }
        },
        [page, router, setSelectedComponent, updateUrlWithoutNavigation],
    );

    useEffect(() => {
        if (page === 'home') {
            console.log('Current homepage component: ' + searchParams.get('component'));
            setSelectedComponent(searchParams.get('component') || '');
        }
    }, [page, searchParams, setSelectedComponent]);

    const navbar = navbar_menu_list.map(([menu_class_name, menu_full_name]) => (
        <div
            key={menu_class_name}
            onClick={() => handleClick(menu_class_name)}
            className={`h-full cursor-pointer bg-clip-text pb-1 font-bold text-transparent ${
                menu_class_name === 'testimonials' || menu_class_name === 'portfolio' ? 'hidden xs:flex' : ''
            } bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-500`}
        >
            {menu_full_name}
        </div>
    ));

    const halfLength = Math.ceil(navbar.length / 2);
    const leftNavbar = navbar.slice(0, halfLength);
    const rightNavbar = navbar.slice(halfLength);

    return (
        <nav className="h-[50px] w-full bg-stone-900 p-0">
            <div className="flex flex-row items-center justify-between">
                <div className="mx-4 flex pb-1 md:hidden" onClick={() => handleClick('home')}>
                    <Image
                        src="/logo/CCS_logo_text.png"
                        alt="CCS Logo"
                        width={247}
                        height={88}
                        className="max-h-[48px] w-fit object-contain pb-1 pt-2"
                    />
                </div>
                <div className="hidden flex-1 flex-row items-center justify-end space-x-4 md:flex">{leftNavbar}</div>
                <div className="mx-4 hidden items-center justify-center pb-1 md:flex" onClick={() => handleClick('home')}>
                    <Image
                        src="/logo/CCS_logo_text.png"
                        alt="CCS Logo"
                        width={247}
                        height={88}
                        className="max-h-[48px] w-fit object-contain pb-1 pt-2"
                    />
                </div>
                <div className="hidden flex-1 flex-row items-center justify-start space-x-4 md:flex">{rightNavbar}</div>
                <div className="flex w-full flex-row items-center justify-end space-x-4 pr-[55px] pt-[10px] md:hidden">{navbar}</div>
            </div>
            <div className="group p-0" onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
                <IoIosMenu
                    className={`absolute right-0 top-0 h-[50px] w-[50px] fill-primary_dark py-[5px] pr-2 group-hover:fill-primary`}
                />
                {showMenu && (
                    <div className="absolute right-0 top-[50px] z-50 h-fit w-[160px] rounded-bl-md border-b-2 border-l-2 border-primary_dark bg-secondary_light">
                        <DynamicMenuOverlay currentPage={page} isAdmin={useIsAdmin()} />
                    </div>
                )}
            </div>
        </nav>
    );
}
