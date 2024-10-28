import { create } from 'zustand';
import { InventoryWithImages } from '@/db/schema';
import { ReactNode } from 'react';

interface InventoryState {
    category: string;
    filterMenuOpen: boolean;
    itemList: InventoryWithImages[];
    inventoryItems: ReactNode[];
    setCategory: (category: string) => void;
    setFilterMenuOpen: (isOpen: boolean) => void;
    setItemList: (items: InventoryWithImages[]) => void;
    setInventoryItems: (items: ReactNode[] | ((prev: ReactNode[]) => ReactNode[])) => void;
}

const useInventoryStore = create<InventoryState>((set) => ({
    category: 'None',
    filterMenuOpen: false,
    itemList: [],
    inventoryItems: [],
    setCategory: (category) => set({ category }),
    setFilterMenuOpen: (isOpen) => set({ filterMenuOpen: isOpen }),
    setItemList: (items) => set({ itemList: items }),
    setInventoryItems: (items) =>
        set((state) => ({
            inventoryItems: typeof items === 'function' ? items(state.inventoryItems) : items,
        })),
}));

export default useInventoryStore;
