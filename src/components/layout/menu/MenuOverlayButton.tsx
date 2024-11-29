import React, { useState } from 'react';
import Link from 'next/link';
import { MenuItem } from '@/lib/menu_list';
import { FaChevronLeft } from 'react-icons/fa';

interface MenuOverlayButtonProps {
    menuItem: MenuItem;
    isActive: boolean;
}

function MenuOverlayButton({ menuItem, isActive }: MenuOverlayButtonProps) {
    const [showSubMenu, setShowSubMenu] = useState(false);

    return (
        <div className="relative" onMouseEnter={() => setShowSubMenu(true)} onMouseLeave={() => setShowSubMenu(false)}>
            <Link
                href={menuItem.url}
                className={`relative z-50 flex h-[40px] items-center justify-between border-b-2 border-primary_dark bg-primary px-[5px] font-bold text-secondary_dark hover:bg-secondary_dark hover:text-primary ${
                    isActive ? '!bg-secondary_dark !text-primary' : ''
                }`}
                aria-label={menuItem.label}
                prefetch={false}
            >
                {menuItem.label}
                {menuItem.subMenu && <FaChevronLeft className="ml-2" />}
            </Link>

            {menuItem.subMenu && showSubMenu && (
                <div className="absolute left-[-160px] top-0 z-50 h-fit w-[160px] rounded-l-md rounded-br-md border-2 border-primary_dark bg-secondary_light">
                    {menuItem.subMenu.map((subItem) => (
                        <Link
                            key={subItem.id}
                            href={subItem.url}
                            className="flex h-[40px] items-center border-b-2 border-primary_dark bg-primary px-[5px] font-bold text-secondary_dark hover:bg-secondary_dark hover:text-primary"
                        >
                            {subItem.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MenuOverlayButton;
