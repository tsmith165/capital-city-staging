import { create } from 'zustand';

type Store = {
    selectedComponent: string;
    setSelectedComponent: (component: string) => void;
};

export const useStore = create<Store>((set) => ({
    selectedComponent: 'home',
    setSelectedComponent: (component) => set({ selectedComponent: component }),
}));
