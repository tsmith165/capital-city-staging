import { create } from 'zustand';

type Store = {
    /** `<section>_<timestamp>`; the suffix makes repeat clicks on the same nav item re-scroll. */
    selectedComponent: string;
    setSelectedComponent: (component: string) => void;
};

export const useStore = create<Store>((set) => ({
    selectedComponent: 'home',
    setSelectedComponent: (component) => set({ selectedComponent: component }),
}));
