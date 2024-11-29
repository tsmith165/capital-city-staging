import { useState } from 'react';
import MenuOverlayButton from './MenuOverlayButton';
import { menu_list, admin_menu_list, MenuItem } from '@/lib/menu_list';

import dynamic from 'next/dynamic';
const DynamicMenuOverlaySignOutButton = dynamic(() => import('./MenuOverlaySignOutButton'), { ssr: false });

function MenuOverlay({ currentPage, isAdmin }: { currentPage: string; isAdmin: boolean }) {
    const menuList = isAdmin ? admin_menu_list : menu_list;

    return (
        <div className="relative z-50 flex w-full flex-col">
            {menuList.map((menuItem) => (
                <MenuOverlayButton key={menuItem.id} menuItem={menuItem} isActive={currentPage.includes(menuItem.url)} />
            ))}
            {isAdmin && <DynamicMenuOverlaySignOutButton />}
        </div>
    );
}

export default MenuOverlay;
