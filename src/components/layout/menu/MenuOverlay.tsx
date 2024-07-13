import MenuOverlayButton from './MenuOverlayButton';
import { menu_list, admin_menu_list } from '@/lib/menu_list';

import dynamic from 'next/dynamic';
const DynamicMenuOverlaySignOutButton = dynamic(() => import('./MenuOverlaySignOutButton'), { ssr: false });

const ADD_SIGN_IN_OUT_BUTTON = false;

function MenuOverlay({ currentPage, isAdmin }: { currentPage: string, isAdmin: boolean }) {
    const menuList = isAdmin ? admin_menu_list : menu_list;
    const menuItems = generateMenu(menuList, isAdmin, currentPage);

    return <div className="relative z-50 flex w-full flex-col">{menuItems}</div>;
}

function generateMenu(menuList: typeof menu_list, isSignedIn: boolean, currentPage: string) {
    console.log(`MenuOverlay: Current Page: ${currentPage}`);
    const menu_items = menuList.map((menuItem) => {
        const [className, menuItemString, urlEndpoint] = menuItem;
        const isActive = urlEndpoint === '/' ? currentPage === '/' : currentPage.includes(urlEndpoint);
        return (
            <div key={className}>
                <MenuOverlayButton id={className} menu_name={menuItemString} url_endpoint={urlEndpoint} isActive={isActive} />
            </div>
        );
    });

    if (isSignedIn) {
        menu_items.push(
            <div key="sign_out_button">
                <DynamicMenuOverlaySignOutButton />
            </div>,
        );
    } else if (ADD_SIGN_IN_OUT_BUTTON) {
        menu_items.push(
            <div key="sign_in">
                <MenuOverlayButton
                    id={'sign_in'}
                    menu_name={'Sign In'}
                    url_endpoint={'/signin'}
                    isActive={currentPage.includes('/signin')}
                />
            </div>,
        );
    }
    return menu_items;
}

export default MenuOverlay;