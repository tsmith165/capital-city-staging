import { create } from 'zustand';

type Store = {
    selectedComponent: string;
    isScrolling: boolean;
    setSelectedComponent: (component: string) => void;
    setScrolling: (scrolling: boolean) => void;
};

export const useStore = create<Store>((set) => ({
    selectedComponent: 'home',
    isScrolling: false,
    setSelectedComponent: (component) => set({ selectedComponent: component }),
    setScrolling: (scrolling) => set({ isScrolling: scrolling }),
}));