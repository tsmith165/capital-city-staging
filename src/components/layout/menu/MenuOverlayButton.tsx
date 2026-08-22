import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import { MenuItem } from '@/lib/menu_list';

interface MenuOverlayButtonProps {
    menuItem: MenuItem;
    isActive: boolean;
    onNavigate?: () => void;
}

const ITEM_CLASSES =
    'flex min-h-[42px] items-center justify-between gap-2 border-b border-line px-3.5 text-sm font-bold transition-colors';

function MenuOverlayButton({ menuItem, isActive, onNavigate }: MenuOverlayButtonProps) {
    const [showSubMenu, setShowSubMenu] = useState(false);

    // A submenu that only opened on hover could not be reached by keyboard or reliably on
    // touch, so the parent is a disclosure button and the link sits beside it.
    if (menuItem.subMenu) {
        return (
            <div className="flex flex-col">
                <div
                    className={`${ITEM_CLASSES} ${isActive ? 'bg-surface-overlay text-gold-300' : 'text-body hover:bg-surface-overlay'}`}
                >
                    <Link href={menuItem.url} onClick={onNavigate} className="flex-1 py-2.5" prefetch={false}>
                        {menuItem.label}
                    </Link>
                    <button
                        type="button"
                        onClick={() => setShowSubMenu((open) => !open)}
                        aria-expanded={showSubMenu}
                        aria-label={`${showSubMenu ? 'Hide' : 'Show'} ${menuItem.label} links`}
                        className="grid h-8 w-8 place-items-center rounded-sm text-body-muted transition-colors hover:text-gold-300"
                    >
                        <ChevronDown
                            size={16}
                            aria-hidden="true"
                            className={`transition-transform ${showSubMenu ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>

                {showSubMenu && (
                    <div className="flex flex-col bg-surface">
                        {menuItem.subMenu.map((subItem) => (
                            <Link
                                key={subItem.id}
                                href={subItem.url}
                                onClick={onNavigate}
                                className="flex min-h-[38px] items-center border-b border-line py-2 pl-6 pr-3.5 text-xs font-bold text-body-muted transition-colors hover:bg-surface-overlay hover:text-gold-300"
                                prefetch={false}
                            >
                                {subItem.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={menuItem.url}
            onClick={onNavigate}
            className={`${ITEM_CLASSES} py-2.5 ${isActive ? 'bg-surface-overlay text-gold-300' : 'text-body hover:bg-surface-overlay hover:text-gold-300'}`}
            prefetch={false}
        >
            {menuItem.label}
        </Link>
    );
}

export default MenuOverlayButton;
