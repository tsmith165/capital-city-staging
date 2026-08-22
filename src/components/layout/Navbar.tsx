'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

import { navbar_menu_list } from '@/lib/menu_list';
import { useStore } from '@/stores/store';
import { useIsAdmin } from '@/utils/auth/useIsAdmin';

import dynamic from 'next/dynamic';
const DynamicMenuOverlay = dynamic(() => import('./menu/MenuOverlay'), { ssr: false });

const NAV_LINK_CLASSES =
    'rounded-sm text-sm font-bold uppercase tracking-wide text-gold-300 transition-colors hover:text-gold-200';

export default function Navbar({ page }: { page: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);
    const isAdmin = useIsAdmin();
    const menuRef = useRef<HTMLDivElement>(null);

    const setSelectedComponent = useStore((state) => state.setSelectedComponent);

    const updateUrlWithoutNavigation = useCallback(
        (newValue: string) => {
            const params = new URLSearchParams(searchParams);
            if (newValue) {
                params.set('component', newValue);
            } else {
                params.delete('component');
            }
            window.history.pushState(null, '', `${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
        },
        [searchParams, pathname],
    );

    /**
     * Section links keep a real href so they work without JS and can be opened in a new tab.
     * When we are already on the homepage the click is intercepted to scroll instead of reload.
     */
    const handleSectionClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>, section: string) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

            event.preventDefault();
            setSelectedComponent(`${section}_${Date.now()}`);

            if (page !== 'home') {
                router.push(`/?component=${section}`);
            } else {
                updateUrlWithoutNavigation(section);
            }
        },
        [page, router, setSelectedComponent, updateUrlWithoutNavigation],
    );

    useEffect(() => {
        if (page === 'home') {
            setSelectedComponent(searchParams.get('component') || '');
        }
    }, [page, searchParams, setSelectedComponent]);

    // The menu previously opened on hover alone, which left it unreachable by keyboard and
    // unreliable on touch. It is a real toggle now, so it also needs the usual dismissals.
    useEffect(() => {
        if (!showMenu) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setShowMenu(false);
        };
        const onPointerDown = (event: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [showMenu]);

    const navLinks = navbar_menu_list.map(([section, label]) =>
        section === 'contact' ? (
            <Link key={section} href="/contact" className={NAV_LINK_CLASSES}>
                {label}
            </Link>
        ) : (
            <Link
                key={section}
                href={`/?component=${section}`}
                onClick={(event) => handleSectionClick(event, section)}
                className={`${NAV_LINK_CLASSES} ${section === 'portfolio' ? 'hidden xs:inline' : ''}`}
            >
                {label}
            </Link>
        ),
    );

    const half = Math.ceil(navLinks.length / 2);

    return (
        <nav aria-label="Main" className="sticky top-0 z-40 h-[56px] w-full border-b border-line bg-ink/95 backdrop-blur">
            <div className="relative flex h-full items-center justify-between gap-4 px-4">
                <div className="hidden flex-1 items-center justify-end gap-6 md:flex">{navLinks.slice(0, half)}</div>

                <Link href="/" aria-label="Capital City Staging home" className="flex shrink-0 items-center">
                    <Image
                        src="/logo/CCS_logo_text.png"
                        alt="Capital City Staging"
                        width={247}
                        height={88}
                        priority
                        className="max-h-[44px] w-auto object-contain"
                    />
                </Link>

                <div className="hidden flex-1 items-center justify-start gap-6 md:flex">{navLinks.slice(half)}</div>

                <div className="flex flex-1 items-center justify-end gap-5 md:hidden">{navLinks}</div>

                <div ref={menuRef} className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowMenu((open) => !open)}
                        aria-expanded={showMenu}
                        aria-controls="site-menu"
                        aria-label={showMenu ? 'Close menu' : 'Open menu'}
                        className="grid h-10 w-10 place-items-center rounded-md text-gold-300 transition-colors hover:bg-surface-raised hover:text-gold-200"
                    >
                        {showMenu ? <X size={24} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
                    </button>

                    {showMenu && (
                        <div
                            id="site-menu"
                            className="absolute right-0 top-[calc(100%+4px)] z-50 w-[220px] overflow-hidden rounded-md border border-line bg-surface-raised shadow-overlay"
                        >
                            <DynamicMenuOverlay currentPage={page} isAdmin={isAdmin} onNavigate={() => setShowMenu(false)} />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
