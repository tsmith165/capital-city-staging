import MenuOverlayButton from './MenuOverlayButton';
import { menu_list, admin_menu_list } from '@/lib/menu_list';

import dynamic from 'next/dynamic';
const DynamicMenuOverlaySignOutButton = dynamic(() => import('./MenuOverlaySignOutButton'), { ssr: false });

function MenuOverlay({
    currentPage,
    isAdmin,
    onNavigate,
}: {
    currentPage: string;
    isAdmin: boolean;
    onNavigate?: () => void;
}) {
    const menuList = isAdmin ? admin_menu_list : menu_list;

    return (
        <div className="flex w-full flex-col">
            {menuList.map((menuItem) => (
                <MenuOverlayButton
                    key={menuItem.id}
                    menuItem={menuItem}
                    isActive={currentPage.includes(menuItem.url)}
                    onNavigate={onNavigate}
                />
            ))}
            {isAdmin && <DynamicMenuOverlaySignOutButton />}
        </div>
    );
}

export default MenuOverlay;
