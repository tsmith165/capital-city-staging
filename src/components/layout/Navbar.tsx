'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { PRIMARY_CTA, PRIMARY_NAV } from '@/lib/menu_list';
import { track } from '@/lib/analytics';
import { useStore } from '@/stores/store';
import { useIsAdmin } from '@/utils/auth/useIsAdmin';

import MobileNavPanel from './nav/MobileNavPanel';
import NavDropdown from './nav/NavDropdown';
import { CTA_CLASSES, NAV_LINK_ACTIVE, NAV_LINK_CLASSES, NAV_LINK_IDLE } from './nav/nav.constants';

export default function Navbar({ page }: { page: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);
    const isAdmin = useIsAdmin();

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

    const activeSection = pathname === '/' ? searchParams.get('component') : null;
    const activeId =
        PRIMARY_NAV.find((item) =>
            item.section
                ? item.section === activeSection
                : pathname === item.href || pathname.startsWith(`${item.href}/`),
        )?.id ?? null;

    return (
        <>
            <nav aria-label="Main" className="sticky top-0 z-40 h-16 w-full border-b border-line bg-ink/95 backdrop-blur">
                <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
                    <Link href="/" aria-label="Capital City Staging home" className="flex shrink-0 items-center">
                        <Image
                            src="/logo/CCS_logo_text.png"
                            alt="Capital City Staging"
                            width={247}
                            height={88}
                            priority
                            className="h-[38px] w-auto object-contain"
                        />
                    </Link>

                    <div className="hidden items-center gap-7 tm:flex">
                        {PRIMARY_NAV.map((item) => {
                            const isActive = activeId === item.id;

                            if (item.children) {
                                return <NavDropdown key={item.id} item={item} isActive={isActive} />;
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={(event) => item.section && handleSectionClick(event, item.section)}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`${NAV_LINK_CLASSES} ${isActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}

                        {isAdmin ? (
                            <Link href="/admin" className={`${NAV_LINK_CLASSES} text-forest-200 hover:text-gold-300`}>
                                Admin
                            </Link>
                        ) : null}

                        <Link
                            href={PRIMARY_CTA.href}
                            className={CTA_CLASSES}
                            onClick={() => track('cta_clicked', { cta: 'get_a_quote', placement: 'nav' })}
                        >
                            {PRIMARY_CTA.label}
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 tm:hidden">
                        <Link
                            href={PRIMARY_CTA.href}
                            className={`${CTA_CLASSES} hidden xs:inline-flex`}
                            onClick={() => track('cta_clicked', { cta: 'get_a_quote', placement: 'nav_mobile' })}
                        >
                            {PRIMARY_CTA.label}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowMenu(true)}
                            aria-expanded={showMenu}
                            aria-controls="site-menu"
                            aria-label="Open menu"
                            className="grid h-10 w-10 place-items-center rounded-md text-body-muted transition-colors hover:bg-surface-raised hover:text-gold-300"
                        >
                            <Menu size={24} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </nav>

            <MobileNavPanel
                open={showMenu}
                onClose={() => setShowMenu(false)}
                isAdmin={isAdmin}
                activeId={activeId}
                onSectionClick={handleSectionClick}
            />
        </>
    );
}
