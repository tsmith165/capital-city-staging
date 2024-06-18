import React from 'react';
import { useStore } from '../../store/store';
import { menu_list } from '../../lib/menu_list';

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
                className={`h-full leading-[50px] font-bold cursor-pointer ${
                    is_selected ? 'text-neutral-400' : 'text-primary hover:text-neutral-400'
                }`}
                onClick={handleClick}>
                {menu_full_name}
            </div>
        );
    });

    return (
        <nav className="bg-secondary_dark p-0 flex flex-row h-[50px] w-full justify-center">
            <div className="flex flex-row space-x-4 px-4">{navbar}</div>
        </nav>
    );
}
